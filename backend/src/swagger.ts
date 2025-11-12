// src/utils/swagger.ts
import { OpenAPIV3 } from 'openapi-types'

export const swaggerSpec: OpenAPIV3.Document = {
  openapi: '3.0.3',
  info: {
    title: 'Tibia Pulse API',
    version: '1.0.0',
    description:
      'API do Tibia Pulse — autenticação, favoritos e módulos (worlds, bosses, calculator, personagens).',
  },
  servers: [{ url: 'http://localhost:3000', description: 'Local' }],
  tags: [
    { name: 'Auth', description: 'Registro, login e identidade do usuário' },
    { name: 'Favorites', description: 'Gerenciamento de favoritos' },
    { name: 'Worlds', description: 'Listagem e detalhe de mundos' },
    {
      name: 'Characters',
      description: 'Busca e detalhes de personagens (TibiaData + scraping tibia.com / rastreador proprietário)',
    },
    { name: 'Bosses', description: 'Bosses boostáveis e estatísticas de kills' },
    { name: 'Calculator', description: 'Calculadoras diversas (Tibia Coin, etc.)' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    schemas: {
      // ==== Usuário / Auth ====
      User: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          email: { type: 'string', format: 'email' },
          name: { type: 'string', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
        },
        required: ['id', 'email', 'createdAt'],
      },
      AuthRegisterRequest: {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 8 },
          name: { type: 'string' },
        },
        required: ['email', 'password'],
      },
      AuthLoginRequest: {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string' },
        },
        required: ['email', 'password'],
      },
      AuthResponse: {
        type: 'object',
        properties: {
          token: { type: 'string' },
          user: { $ref: '#/components/schemas/User' },
        },
        required: ['token', 'user'],
      },

      // ==== Favorites ====
      Favorite: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          userId: { type: 'string' },
          type: { type: 'string', enum: ['AUCTION', 'BOSS'] },
          key: { type: 'string' },
          notes: { type: 'string', nullable: true },
          snapshot: { type: 'object', additionalProperties: true, nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
        },
        required: ['id', 'userId', 'type', 'key', 'createdAt'],
      },
      FavoriteCreateRequest: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: ['AUCTION', 'BOSS'] },
          key: { type: 'string' },
          notes: { type: 'string' },
          snapshot: { type: 'object', additionalProperties: true },
        },
        required: ['type', 'key'],
      },
      FavoriteListResponse: {
        type: 'object',
        properties: {
          favorites: { type: 'array', items: { $ref: '#/components/schemas/Favorite' } },
        },
        required: ['favorites'],
      },

      // ==== Worlds ====
      World: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          players_online: { type: 'integer' },
          location: { type: 'string' },
          pvp_type: { type: 'string' },
          battleye_status: { type: 'string' },
          online_record: {
            type: 'object',
            properties: {
              players: { type: 'integer', nullable: true },
              date: { type: 'string', nullable: true },
            },
          },
        },
        required: ['name'],
      },
      WorldListResponse: {
        type: 'object',
        properties: {
          players_online_total: { type: 'integer' },
          count: { type: 'integer' },
          worlds: { type: 'array', items: { $ref: '#/components/schemas/World' } },
        },
        required: ['count', 'worlds'],
      },

      // ==== Bosses ====
      BossKillStatsResponse: {
        type: 'object',
        properties: {
          world: { type: 'string' },
          total: {
            type: 'object',
            properties: {
              last_day_killed: { type: 'integer' },
              last_week_killed: { type: 'integer' },
              last_day_players_killed: { type: 'integer' },
              last_week_players_killed: { type: 'integer' },
            },
          },
          entries: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                race: { type: 'string' },
                last_day_killed: { type: 'integer' },
                last_week_killed: { type: 'integer' },
                last_day_players_killed: { type: 'integer' },
                last_week_players_killed: { type: 'integer' },
              },
            },
          },
        },
        required: ['world', 'entries'],
      },

      // ==== Calculator ====
      CalculatorCoinsResponse: {
        type: 'object',
        properties: { coins: { type: 'integer' } },
        required: ['coins'],
      },
      CharacterSummary: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          level: { type: 'integer' },
          world: { type: 'string', nullable: true },
          vocation: { type: 'string', nullable: true },
          residence: { type: 'string', nullable: true },
          guild: { type: 'string', nullable: true },
          sex: { type: 'string', nullable: true },
          created: { type: 'string', nullable: true, description: 'ISO date ou string bruta' },
          lastLogin: { type: 'string', nullable: true, description: 'ISO date ou string bruta' },
          accountStatus: { type: 'string', nullable: true },
          house: { type: 'string', nullable: true },
          comment: { type: 'string', nullable: true },
          formerNames: { type: 'string', nullable: true },
          title: { type: 'string', nullable: true },
          formerWorld: { type: 'string', nullable: true },
          achievementPoints: { type: 'integer', nullable: true },
          currentXP: { type: 'integer', nullable: true },
          xpToNextLevel: { type: 'integer', nullable: true },
          averageDailyXP: { type: 'integer', nullable: true },
          bestDayXP: {
            type: 'object',
            nullable: true,
            properties: { date: { type: 'string' }, value: { type: 'integer' } },
          },
          history: {
            type: 'array',
            nullable: true,
            items: {
              type: 'object',
              properties: {
                date: { type: 'string' },
                expChange: { type: 'integer' },
                level: { type: 'integer' },
              },
            },
          },
          deaths: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                time: { type: 'string', nullable: true },
                level: { type: 'integer' },
                reason: { type: 'string' },
              },
            },
          },
        },
        required: ['name', 'level', 'deaths'],
      },

      // ==== Genérico ====
      OkPing: {
        type: 'object',
        properties: { ok: { type: 'boolean' } },
        required: ['ok'],
      },
      ErrorResponse: {
        type: 'object',
        properties: { error: { type: 'string' }, details: { type: 'object', nullable: true } },
        required: ['error'],
      },
    },
  },
  paths: {
    // ===== Auth =====
    '/api/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Registrar usuário',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthRegisterRequest' } } },
        },
        responses: {
          '201': { description: 'Usuário criado', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } },
          '409': { description: 'E-mail já cadastrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          '400': { description: 'Body inválido' },
        },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthLoginRequest' } } },
        },
        responses: {
          '200': { description: 'Autenticado', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } },
          '401': { description: 'Credenciais inválidas', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          '400': { description: 'Body inválido' },
        },
      },
    },
    '/api/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Dados do usuário autenticado',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': {
                schema: { type: 'object', properties: { user: { $ref: '#/components/schemas/User' } }, required: ['user'] },
              },
            },
          },
          '401': { description: 'Não autenticado' },
        },
      },
    },

    // ===== Favorites =====
    '/api/favorites': {
      get: {
        tags: ['Favorites'],
        summary: 'Listar favoritos',
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'query', name: 'type', schema: { type: 'string', enum: ['AUCTION', 'BOSS'] }, required: false, description: 'Filtra por tipo' },
        ],
        responses: {
          '200': { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/FavoriteListResponse' } } } },
          '401': { description: 'Não autenticado' },
        },
      },
      post: {
        tags: ['Favorites'],
        summary: 'Criar favorito',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/FavoriteCreateRequest' } } },
        },
        responses: {
          '201': {
            description: 'Criado',
            content: {
              'application/json': {
                schema: { type: 'object', properties: { favorite: { $ref: '#/components/schemas/Favorite' } }, required: ['favorite'] },
              },
            },
          },
          '409': { description: 'Duplicado' },
          '400': { description: 'Body inválido' },
          '401': { description: 'Não autenticado' },
        },
      },
    },
    '/api/favorites/{id}': {
      delete: {
        tags: ['Favorites'],
        summary: 'Remover favorito',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', schema: { type: 'string' }, required: true }],
        responses: {
          '204': { description: 'Removido' },
          '404': { description: 'Não encontrado' },
          '401': { description: 'Não autenticado' },
        },
      },
    },

    // ===== Worlds =====
    '/api/worlds': {
      get: {
        tags: ['Worlds'],
        summary: 'Listar mundos com filtros/ordenação',
        parameters: [
          { in: 'query', name: 'type', schema: { type: 'string' }, required: false, description: 'Filtro por pvp type (e.g., optional, open, retro)' },
          { in: 'query', name: 'battleye', schema: { type: 'string', enum: ['protected', 'unprotected'] }, required: false },
          { in: 'query', name: 'location', schema: { type: 'string', enum: ['EU', 'NA', 'SA'] }, required: false },
          { in: 'query', name: 'sort', schema: { type: 'string', enum: ['name', 'players_online'] }, required: false },
          { in: 'query', name: 'order', schema: { type: 'string', enum: ['asc', 'desc'] }, required: false },
          { in: 'query', name: 'limit', schema: { type: 'integer', minimum: 1 }, required: false },
        ],
        responses: {
          '200': { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/WorldListResponse' } } } },
          '404': { description: 'Não encontrado' },
        },
      },
    },
    '/api/worlds/{name}': {
      get: {
        tags: ['Worlds'],
        summary: 'Detalhe de um mundo',
        parameters: [{ in: 'path', name: 'name', schema: { type: 'string' }, required: true }],
        responses: {
          '200': { description: 'OK' },
          '404': { description: 'Não encontrado' },
        },
      },
    },

    // ===== Characters =====
    '/api/characters/{name}': {
      get: {
        tags: ['Characters'],
        summary: 'Detalhes enriquecidos de um personagem (TibiaData + tibia.com + rastreador proprietário)',
        parameters: [
          { in: 'path', name: 'name', required: true, schema: { type: 'string' }, description: 'Nome do personagem (ex.: Kaamez)' },
        ],
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CharacterSummary' },
              },
            },
          },
          '404': {
            description: 'Personagem não encontrado',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
          '502': {
            description: 'Erro na origem (upstream)',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
        },
      },
    },

    // ===== Bosses =====
    '/api/bosses/boostable': {
      get: {
        tags: ['Bosses'],
        summary: 'Lista bosses boostáveis (TibiaData)',
        responses: {
          '200': { description: 'OK' },
          '404': { description: 'Não encontrado' },
        },
      },
    },
    '/api/bosses/killstats/{world}': {
      get: {
        tags: ['Bosses'],
        summary: 'Estatísticas de kills por world',
        parameters: [{ in: 'path', name: 'world', schema: { type: 'string' }, required: true }],
        responses: {
          '200': { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/BossKillStatsResponse' } } } },
          '404': { description: 'Não encontrado' },
          '400': { description: 'Parâmetro ausente/ inválido' },
        },
      },
    },

    // ===== Market =====
    // ===== Calculator =====
    '/api/calculator/tibia-coin': {
      get: {
        tags: ['Calculator'],
        summary: 'Calcula quantas Tibia Coins são necessárias para pagar um preço em gold',
        parameters: [
          { in: 'query', name: 'price', schema: { type: 'integer', minimum: 1 }, required: true, description: 'Preço em gold (ex.: 600000)' },
          { in: 'query', name: 'tc', schema: { type: 'integer', minimum: 1 }, required: true, description: 'Preço de 1 TC em gold (ex.: 25000)' },
        ],
        responses: {
          '200': { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/CalculatorCoinsResponse' } } } },
          '400': { description: 'Parâmetros inválidos' },
        },
      },
    },
  },
}
