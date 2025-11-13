import axios from 'axios'
import { randomBytes } from 'crypto'
import type { Response, Request } from 'express'
import { AuthProvider } from '@prisma/client'
import { prisma } from '../lib/prisma'
import { signToken } from '../utils/jwt'

type Provider = 'google' | 'discord'
type OAuthStateEntry = { provider: Provider; expiresAt: number }

const STATE_TTL = 5 * 60 * 1000
const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
const GOOGLE_PROFILE_URL = 'https://www.googleapis.com/oauth2/v2/userinfo'
const DISCORD_AUTH_URL = 'https://discord.com/api/oauth2/authorize'
const DISCORD_TOKEN_URL = 'https://discord.com/api/oauth2/token'
const DISCORD_PROFILE_URL = 'https://discord.com/api/users/@me'

const stateStore = new Map<string, OAuthStateEntry>()

const userSelect = {
  id: true,
  email: true,
  name: true,
  avatarUrl: true,
  mainCharacter: true,
  createdAt: true,
}

function baseSuccessUrl() {
  return (
    process.env.AUTH_SUCCESS_URL ||
    (process.env.APP_URL ? `${process.env.APP_URL.replace(/\/$/, '')}/auth/callback` : 'http://localhost:5173/auth/callback')
  )
}

function baseFailureUrl() {
  return (
    process.env.AUTH_FAILURE_URL ||
    (process.env.APP_URL ? `${process.env.APP_URL.replace(/\/$/, '')}/login` : 'http://localhost:5173/login')
  )
}

function buildSuccessRedirect(token: string) {
  const url = new URL(baseSuccessUrl())
  url.searchParams.set('token', token)
  return url.toString()
}

function buildFailureRedirect(message?: string) {
  const url = new URL(baseFailureUrl())
  if (message) url.searchParams.set('error', message)
  return url.toString()
}

function createState(provider: Provider) {
  const value = randomBytes(24).toString('hex')
  stateStore.set(value, { provider, expiresAt: Date.now() + STATE_TTL })
  return value
}

function consumeState(value: string | undefined, provider: Provider) {
  if (!value) return false
  const entry = stateStore.get(value)
  if (!entry) return false
  stateStore.delete(value)
  if (entry.provider !== provider) return false
  if (entry.expiresAt < Date.now()) return false
  return true
}

function ensureEnv(name: string) {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing environment variable ${name}`)
  }
  return value
}

function normalizeEmail(email: string | undefined | null, provider: Provider, providerAccountId: string) {
  if (email && email.trim().length) return email.trim().toLowerCase()
  return `${provider}-${providerAccountId}@oauth.local`
}

async function syncOAuthUser(
  provider: Provider,
  providerAccountId: string,
  profile: { email?: string | null; name?: string | null; avatarUrl?: string | null },
) {
  const prismaProvider = provider === 'google' ? AuthProvider.GOOGLE : AuthProvider.DISCORD
  const whereProvider = {
    provider_providerAccountId: {
      provider: prismaProvider,
      providerAccountId,
    },
  }

  let user = await prisma.user.findUnique({
    where: whereProvider,
    select: userSelect,
  })

  const normalizedEmail = normalizeEmail(profile.email, provider, providerAccountId)

  if (!user && normalizedEmail) {
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true },
    })
    if (existing) {
      user = await prisma.user.update({
        where: { id: existing.id },
        data: {
          provider: prismaProvider,
          providerAccountId,
          avatarUrl: profile.avatarUrl ?? undefined,
          name: profile.name ?? undefined,
        },
        select: userSelect,
      })
    }
  }

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        name: profile.name ?? null,
        avatarUrl: profile.avatarUrl ?? null,
        password: null,
        provider: prismaProvider,
        providerAccountId,
      },
      select: userSelect,
    })
  } else if (profile.name || profile.avatarUrl) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: user.name ?? profile.name ?? undefined,
        avatarUrl: profile.avatarUrl ?? user.avatarUrl ?? undefined,
      },
      select: userSelect,
    })
  }

  return user
}

async function finalizeAuth(res: Response, provider: Provider, providerAccountId: string, profile: { email?: string; name?: string; avatarUrl?: string }) {
  const user = await syncOAuthUser(provider, providerAccountId, profile)
  const token = signToken({ id: user.id, email: user.email ?? undefined })
  return res.redirect(buildSuccessRedirect(token))
}

export const OAuthController = {
  googleStart: (_req: Request, res: Response) => {
    try {
      const clientId = ensureEnv('GOOGLE_CLIENT_ID')
      const redirectUri = ensureEnv('GOOGLE_REDIRECT_URI')
      const state = createState('google')
      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: 'openid email profile',
        access_type: 'offline',
        prompt: 'consent',
        state,
      })
      return res.redirect(`${GOOGLE_AUTH_URL}?${params.toString()}`)
    } catch (err) {
      console.error('[oauth] google start failed', err)
      return res.redirect(buildFailureRedirect('config-error'))
    }
  },

  googleCallback: async (req: Request, res: Response) => {
    try {
      const { code, state } = req.query
      if (!code || typeof code !== 'string' || !consumeState(state as string, 'google')) {
        return res.redirect(buildFailureRedirect('invalid-state'))
      }
      const clientId = ensureEnv('GOOGLE_CLIENT_ID')
      const clientSecret = ensureEnv('GOOGLE_CLIENT_SECRET')
      const redirectUri = ensureEnv('GOOGLE_REDIRECT_URI')
      const tokenPayload = new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      })
      const tokenRes = await axios.post(GOOGLE_TOKEN_URL, tokenPayload.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })
      const accessToken = tokenRes.data?.access_token
      if (!accessToken) {
        throw new Error('missing access token')
      }
      const profileRes = await axios.get(GOOGLE_PROFILE_URL, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      const profile = profileRes.data
      if (!profile?.id) {
        throw new Error('missing profile id')
      }
      return finalizeAuth(res, 'google', String(profile.id), {
        email: profile.email,
        name: profile.name ?? profile.given_name ?? profile.email,
        avatarUrl: profile.picture,
      })
    } catch (err) {
      console.error('[oauth] google callback failed', err)
      return res.redirect(buildFailureRedirect('google-auth-failed'))
    }
  },

  discordStart: (_req: Request, res: Response) => {
    try {
      const clientId = ensureEnv('DISCORD_CLIENT_ID')
      const redirectUri = ensureEnv('DISCORD_REDIRECT_URI')
      const state = createState('discord')
      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: 'identify email',
        prompt: 'consent',
        state,
      })
      return res.redirect(`${DISCORD_AUTH_URL}?${params.toString()}`)
    } catch (err) {
      console.error('[oauth] discord start failed', err)
      return res.redirect(buildFailureRedirect('config-error'))
    }
  },

  discordCallback: async (req: Request, res: Response) => {
    try {
      const { code, state } = req.query
      if (!code || typeof code !== 'string' || !consumeState(state as string, 'discord')) {
        return res.redirect(buildFailureRedirect('invalid-state'))
      }
      const clientId = ensureEnv('DISCORD_CLIENT_ID')
      const clientSecret = ensureEnv('DISCORD_CLIENT_SECRET')
      const redirectUri = ensureEnv('DISCORD_REDIRECT_URI')
      const tokenPayload = new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      })
      const tokenRes = await axios.post(DISCORD_TOKEN_URL, tokenPayload.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })
      const accessToken = tokenRes.data?.access_token
      if (!accessToken) throw new Error('missing access token')

      const profileRes = await axios.get(DISCORD_PROFILE_URL, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      const profile = profileRes.data
      if (!profile?.id) throw new Error('missing discord id')
      const avatarUrl =
        profile.avatar && profile.id
          ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png?size=256`
          : null
      const displayName = profile.global_name || profile.username || profile.id

      return finalizeAuth(res, 'discord', String(profile.id), {
        email: profile.email,
        name: displayName,
        avatarUrl: avatarUrl ?? undefined,
      })
    } catch (err) {
      console.error('[oauth] discord callback failed', err)
      return res.redirect(buildFailureRedirect('discord-auth-failed'))
    }
  },
}
