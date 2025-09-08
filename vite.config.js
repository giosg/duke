import { defineConfig } from 'vite';
import { resolve } from 'path';
import { fileURLToPath, URL } from 'node:url';
import { copyFileSync, mkdirSync, existsSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';

// Plugin to copy static files
const copyStaticFiles = () => {
  return {
    name: 'copy-static-files',
    writeBundle() {
      const copyRecursively = (src, dest) => {
        if (!existsSync(src)) return;
        
        if (statSync(src).isDirectory()) {
          if (!existsSync(dest)) {
            mkdirSync(dest, { recursive: true });
          }
          readdirSync(src).forEach(file => {
            copyRecursively(join(src, file), join(dest, file));
          });
        } else {
          const destDir = dirname(dest);
          if (!existsSync(destDir)) {
            mkdirSync(destDir, { recursive: true });
          }
          copyFileSync(src, dest);
        }
      };

      // Copy static files
      copyRecursively('app/manifest.json', 'dist/manifest.json');
      copyRecursively('app/images', 'dist/images');
      copyRecursively('app/templates', 'dist/templates');
      copyRecursively('app/_locales', 'dist/_locales');
      copyRecursively('app/fonts', 'dist/fonts');
      copyRecursively('app/popup.html', 'dist/popup.html');
    }
  };
};

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'app/scripts/main.js'),
        background: resolve(__dirname, 'app/scripts/background.js'),
        contentScript: resolve(__dirname, 'app/scripts/contentscript.js'),
        postMessageListener: resolve(__dirname, 'app/scripts/postmessagelistener.js'),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          // Keep the original file structure for Chrome extension
          if (chunkInfo.name === 'background') return 'scripts/background.js';
          if (chunkInfo.name === 'contentScript') return 'scripts/contentscript.js';
          if (chunkInfo.name === 'postMessageListener') return 'scripts/postmessagelistener.js';
          if (chunkInfo.name === 'main') return 'scripts/main.js';
          return 'scripts/[name].js';
        },
        chunkFileNames: 'scripts/[name].js',
        assetFileNames: (assetInfo) => {
          // Keep CSS files in css folder
          if (assetInfo.name?.endsWith('.css')) {
            return 'css/[name][extname]';
          }
          // Keep images in images folder
          if (/\.(png|jpe?g|svg|gif|webp|ico)$/i.test(assetInfo.name || '')) {
            return 'images/[name][extname]';
          }
          // Keep fonts in fonts folder
          if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name || '')) {
            return 'fonts/[name][extname]';
          }
          return 'assets/[name][extname]';
        }
      }
    },
  },
  plugins: [copyStaticFiles()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./app', import.meta.url)),
    }
  }
});
