import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { readFileSync, writeFileSync } from 'node:fs'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import dts from 'vite-plugin-dts'
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'

const __dirname = dirname(fileURLToPath(import.meta.url))

function copyPackageJson(): Plugin {
  return {
    name: 'copy-package-json',
    writeBundle() {
      const pkg = JSON.parse(readFileSync(resolve(__dirname, 'package.json'), 'utf-8'))
      pkg.main = './searching-ui.js'
      pkg.module = './searching-ui.js'
      pkg.types = './index.d.ts'
      pkg.exports = {
        '.': {
          types: './index.d.ts',
          import: './searching-ui.js',
        },
      }
      delete pkg.files
      delete pkg.scripts
      delete pkg.devDependencies
      writeFileSync(resolve(__dirname, 'dist/package.json'), JSON.stringify(pkg, null, 2))
    },
  }
}

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    copyPackageJson(),
    dts({
      include: ['src'],
      exclude: ['src/**/*.test.tsx', 'src/**/*.test.ts'],
      tsconfigPath: './tsconfig.build.json',
      // Disabled rollupTypes to avoid API Extractor TypeScript version mismatch warning
      // Types will be generated as separate files instead of bundled
      rollupTypes: false,
    }),
    cssInjectedByJsPlugin(),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    sourcemap: true,
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'SearchingUI',
      fileName: 'searching-ui',
      formats: ['es'],
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        // Externalize packages with browser-specific code to allow proper SSR handling
        'react-markdown',
        'framer-motion',
      ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'jsxRuntime',
        },
      },
    },
  }
})
