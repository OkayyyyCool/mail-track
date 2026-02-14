import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['mailtrack-icon.png'],
      manifest: {
        name: 'MailTrack',
        short_name: 'MailTrack',
        description: 'Track and organize your emails intelligently',
        theme_color: '#4285F4',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/mail-track/',
        scope: '/mail-track/',
        icons: [
          {
            src: 'mailtrack-icon.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'mailtrack-icon.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      }
    })
  ],
  base: '/mail-track/',
})
