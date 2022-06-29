import react from '@vitejs/plugin-react';

import { defineConfig, loadEnv, splitVendorChunkPlugin } from 'vite';
import macrosPlugin from 'vite-plugin-babel-macros';
import svgr from 'vite-plugin-svgr';
import tsConfigPaths from 'vite-tsconfig-paths';

export default defineConfig(({ command }) => {
  let env = {};
  const baseConfig: Record<string, any> = {};
  if (command === 'serve') {
    baseConfig.server = {
      fs: {
        allow: ['../..'],
      },
    };
    env = {
      NODE_ENV: 'development',
      ...loadEnv('development', process.cwd(), 'REACT_APP_'),
      ...loadEnv('development', process.cwd(), 'PUBLIC_URL'),
    };
  } else {
    env = {
      NODE_ENV: 'production',
      ...loadEnv('production', process.cwd(), 'REACT_APP_'),
      ...loadEnv('production', process.cwd(), 'PUBLIC_URL'),
    };
  }
  return {
    ...baseConfig,
    plugins: [
      react(),
      tsConfigPaths({
        root: `${process.cwd()}/../..`,
        projects: ['tsconfig.json', 'apps/simconfig/tsconfig.json'],
      }),
      svgr(),
      macrosPlugin(),
      splitVendorChunkPlugin(),
    ],
    resolve: {
      dedupe: ['react', 'react-dom'],
      preserveSymlinks: true,
    },
    base: command === 'build' ? '/PUBLIC_URL_VALUE/' : '/',
    define: {
      'process.env': env,
    },
    build: {
      sourcemap: command === 'build',
      commonjsOptions: {
        include: [],
      },
      rollupOptions: { treeshake: false },
    },
  };
});
