const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const { join } = require('path');
const fs = require('fs');

const assetsPath = join(__dirname, './src/assets');
const assets = fs.existsSync(assetsPath) && fs.readdirSync(assetsPath).length > 0 
  ? ['./src/assets'] 
  : [];

module.exports = {
  resolve: {
    alias: {
      '@you-fizz/shared': join(__dirname, '../../libs/shared/src')
    }
  },
  output: {
    path: join(__dirname, '../../dist/apps/upload'),
    ...(process.env.NODE_ENV !== 'production' && {
      devtoolModuleFilenameTemplate: '[absolute-resource-path]',
    }),
  },
  plugins: [
    new NxAppWebpackPlugin({
      target: 'node',
      compiler: 'tsc',
      main: './src/main.ts',
      tsConfig: './tsconfig.app.json',
      assets: assets,
      optimization: false,
      outputHashing: 'none',
      generatePackageJson: true,
      sourceMaps: true,
    }),
  ],
};

