import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  schema: 'https://quizio.flockert.at/graphql',
  documents: ['src/**/*.tsx', 'src/**/*ts', '!src/graphql/generated/**/*'],
  generates: {
    './src/graphql/generated/': {
      preset: 'client',
      plugins: [],
    },
    './graphql.schema.json': {
      plugins: ['introspection'],
    },
  },
};

export default config;
