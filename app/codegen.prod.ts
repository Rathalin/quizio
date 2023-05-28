import type { CodegenConfig } from '@graphql-codegen/cli';
import baseConfig from './codegen';

const config: CodegenConfig = {
  ...baseConfig,
  schema: 'https://quizio.flockert.at/graphql',
};

export default config;
