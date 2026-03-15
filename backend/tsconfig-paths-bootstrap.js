// Used by dockerized environment
const tsConfig = require('./tsconfig.json');
const tsConfigPaths = require('tsconfig-paths');

tsConfigPaths.register({
  baseUrl: './dist',
  paths: tsConfig.compilerOptions.paths,
});
