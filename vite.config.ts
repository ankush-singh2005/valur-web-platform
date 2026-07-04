import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'


function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

export default defineConfig({
  plugins: [
    figmaAssetResolver(),
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    // Ensure a single copy of React across the app and pre-bundled deps
    // (react-router was resolving a separate instance → "invalid hook call").
    dedupe: ['react', 'react-dom'],
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    // Pre-bundle every React-using dep in one pass so they all share the single
    // deduped React instance (avoids "invalid hook call / multiple copies").
    include: ['react', 'react-dom', 'react-dom/client', 'react/jsx-runtime', 'react-router', 'recharts', 'sonner', 'lucide-react'],
  },

  // Allow the dev server to be reached through ngrok / other tunnels.
  // Vite blocks unknown Host headers by default; these wildcards cover ngrok domains.
  server: {
    allowedHosts: ['.ngrok-free.app', '.ngrok.app', '.ngrok.io', '.ngrok-free.dev'],
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
