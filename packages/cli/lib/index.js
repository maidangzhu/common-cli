import createInitCommand from '@downzoo/init'
import createCLI from './createCLI.js'

export default function () {
	const program = createCLI()
	createInitCommand(program)

	program.parse(process.argv)
}
