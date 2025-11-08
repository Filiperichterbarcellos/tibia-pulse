// src/swagger.ts
import { OpenAPIV3 } from 'openapi-types'

export const swaggerSpec: OpenAPIV3.Document = {
  openapi: '3.0.3',
  info: {
    title: 'Tibia Pulse API',
    version: '1.0.0',
    description:
      'API do Tibia Pulse — autenticação, favoritos e (demais módulos).',
  },
  servers: [
    { url: 'http://localhost:3000', description: 'Local' },
  ],
  tags: [
    { name: 'Auth', description: 'Registro, login e identidade do usuário' },
    { name: 'Favorites', description: 'Gerenciamento de favoritos' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
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
      Favorite: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          userId: { type: 'string' },
          type: { type: 'string', enum: ['AUCTION', 'BOSS'] },
          key: { type: 'string' },
          notes: { type: 'string', nullable: true },
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
        },
        required: ['type', 'key'],
      },
      FavoriteListResponse: {
        type: 'object',
        properties: {
          favorites: {
            type: 'array',
            items: { $ref: '#/components/schemas/Favorite' },
          },
        },
        required: ['favorites'],
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          error: { type: 'string' },
          details: { type: 'object', nullable: true },
        },
        required: ['error'],
      },
    },
  },
  paths: {
    '/api/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Registrar usuário',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AuthRegisterRequest' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Usuário criado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthResponse' },
              },
            },
          },
          '409': {
            description: 'E-mail já cadastrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
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
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AuthLoginRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Autenticado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthResponse' },
              },
            },
          },
          '401': {
            description: 'Credenciais inválidas',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
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
                schema: {
                  type: 'object',
                  properties: { user: { $ref: '#/components/schemas/User' } },
                  required: ['user'],
                },
              },
            },
          },
          '401': { description: 'Não autenticado' },
        },
      },
    },
    '/api/favorites': {
      get: {
        tags: ['Favorites'],
        summary: 'Listar favoritos',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'query',
            name: 'type',
            schema: { type: 'string', enum: ['AUCTION', 'BOSS'] },
            required: false,
            description: 'Filtra por tipo',
          },
        ],
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/FavoriteListResponse' },
              },
            },
          },
          '401': { description: 'Não autenticado' },
        },
      },
      post: {
        tags: ['Favorites'],
        summary: 'Criar favorito',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/FavoriteCreateRequest' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Criado',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { favorite: { $ref: '#/components/schemas/Favorite' } },
                  required: ['favorite'],
                },
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
        parameters: [
          {
            in: 'path',
            name: 'id',
            schema: { type: 'string' },
            required: true,
          },
        ],
        responses: {
          '204': { description: 'Removido' },
          '404': { description: 'Não encontrado' },
          '401': { description: 'Não autenticado' },
        },
      },
    },
  },
}
