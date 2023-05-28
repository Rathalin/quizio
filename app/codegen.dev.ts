import type { CodegenConfig } from '@graphql-codegen/cli';
import baseConfig from './codegen';

const config: CodegenConfig = {
  ...baseConfig,
  schema: 'http://localhost:1337/graphql',
};

export default config;
