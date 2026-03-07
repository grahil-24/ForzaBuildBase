import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  clean: true,
  outDir: 'dist',
  sourcemap: true,
  splitting: false,
  // Don't bundle node_modules - let Node.js handle them at runtime
  noExternal: [],
  // Keep decorators for MikroORM entities
  esbuildOptions(options) {
    options.platform = 'node';
  },
});