/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',

  // carrega .env antes dos testes
  setupFiles: ['dotenv/config'],

  // onde estão os testes
  roots: ['<rootDir>/tests'],

  // resolver alias "@/*" e também permitir 'src/...'
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^src/(.*)$': '<rootDir>/src/$1',
  },
  moduleDirectories: ['node_modules', '<rootDir>/src'],

  // compilar TS
  transform: { '^.+\\.ts$': ['ts-jest'] },


  // cobertura só do que importa
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/server.ts',
    '!src/swagger.ts',
    '!src/types/**',
    '!src/lib/prisma.ts',
    '!src/**/index.ts',
  ],
  coveragePathIgnorePatterns: ['/node_modules/', '/dist/'],

  coverageDirectory: 'coverage',
  coverageReporters: ['lcov', 'text', 'html'],

  restoreMocks: true,
  clearMocks: true,
  resetMocks: true,
}
