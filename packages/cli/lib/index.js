import createInitCommand from '@downzoo/init'
import createInstallCommand from '@downzoo/install'
import createCLI from './createCLI.js'

export default function () {
	const program = createCLI()
	createInitCommand(program)
	createInstallCommand(program)
	program.parse(process.argv)
}
