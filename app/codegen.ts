import type { CodegenConfig } from '@graphql-codegen/cli';

const baseConfig: CodegenConfig = {
  overwrite: true,
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

export default baseConfig;
