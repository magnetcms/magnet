---
"create-magnet": patch
---

fix: set NODE_ENV=production in generated .env.example for standalone projects

- Changed default NODE_ENV from 'development' to 'production' in scaffolded projects
- Fixed README to show correct admin URL at /admin instead of port 3001
- This fixes the admin proxy error that occurs when NODE_ENV=development
  since standalone projects don't have a Vite dev server to proxy to
