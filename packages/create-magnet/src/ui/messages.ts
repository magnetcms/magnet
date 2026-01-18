import ansis from 'ansis'
import type { ProjectConfig } from '../types.js'

export function showSuccessMessage(config: ProjectConfig): void {
	const { projectName, packageManager } = config

	const runCmd = packageManager === 'npm' ? 'npm run' : packageManager

	console.log()
	console.log(ansis.green.bold('Success!'), 'Your Magnet CMS project is ready.')
	console.log()
	console.log(ansis.bold('Next steps:'))
	console.log()
	console.log(ansis.cyan(`  cd ${projectName}`))
	console.log(ansis.cyan('  cp .env.example .env'))
	console.log(ansis.cyan(`  ${runCmd} docker:up`))
	console.log(ansis.cyan(`  ${runCmd} dev`))
	console.log()
	console.log(ansis.dim('Happy building!'))
	console.log()
}

export function showErrorMessage(error: unknown): void {
	console.log()
	console.log(
		ansis.red.bold('Error:'),
		error instanceof Error ? error.message : String(error),
	)
	console.log()
}

export function showWarning(message: string): void {
	console.log(ansis.yellow('Warning:'), message)
}

export function showInfo(message: string): void {
	console.log(ansis.blue('Info:'), message)
}
