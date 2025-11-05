/** @type {import('jest').Config} */
module.exports = {
  // Usa o preset do ts-jest para compilar TypeScript
  preset: 'ts-jest',

  // Ambiente Node.js (backend)
  testEnvironment: 'node',

  // Carrega variáveis do .env antes de rodar os testes
  setupFiles: ['dotenv/config'],

  // Onde os testes ficam localizados
  roots: ['<rootDir>/tests'],

  // Extensões reconhecidas
  moduleFileExtensions: ['ts', 'js', 'json'],

  // Compila arquivos .ts usando ts-jest (modo isolado para performance)
  transform: { '^.+\\.ts$': ['ts-jest', { isolatedModules: true }] },

  // Coleta cobertura dos arquivos em src (excluindo types.d.ts)
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.ts', '!src/**/types.d.ts'],

  // Diretório de saída da cobertura
  coverageDirectory: 'coverage',

  // Formatos de relatório para integração com o SonarCloud
  coverageReporters: ['lcov', 'text-summary'],
};
