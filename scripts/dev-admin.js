#!/usr/bin/env node

import { spawn } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = resolve(__dirname, '..')

process.env.NODE_ENV = 'development'

// Set example-specific environment variables
process.env.DATABASE_URL =
	'postgresql://postgres:postgres@localhost:5432/postgres'
process.env.SUPABASE_URL = 'http://localhost:8000'
process.env.SUPABASE_ANON_KEY =
	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
process.env.SUPABASE_SERVICE_KEY =
	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
process.env.JWT_SECRET =
	'super-secret-jwt-token-with-at-least-32-characters-long'

console.log('Starting admin development environment for drizzle-supabase...')

const nestjs = spawn('bun', ['run', 'dev'], {
	cwd: resolve(projectRoot, 'apps', 'examples', 'drizzle-supabase'),
	stdio: 'inherit',
	shell: true,
	env: { ...process.env, NODE_ENV: 'development' },
})

const vite = spawn('bun', ['run', 'dev'], {
	cwd: resolve(projectRoot, 'packages', 'client', 'admin'),
	stdio: 'inherit',
	shell: true,
})

console.log('NestJS server and Vite dev server started')

process.on('SIGINT', () => {
	nestjs.kill('SIGINT')
	vite.kill('SIGINT')
	process.exit(0)
})

process.on('SIGTERM', () => {
	nestjs.kill('SIGTERM')
	vite.kill('SIGTERM')
	process.exit(0)
})
