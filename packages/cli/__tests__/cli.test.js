import path from 'node:path'
import { execa } from 'execa'

const CLI = path.join(__dirname, '../bin/cli.js')
const bin = () => (...args) => execa(CLI, args)

test('run error command', async () => {
	const { stderr } = await bin()('iii')
	expect(stderr).toContain('未知的命令：iii')
})

test('should not throw err when use --help', async () => {
	let error = null
	try {
		await bin()('--help')
	} catch (e) {
		error = e
	}
	expect(error).toBeNull()
})

test('show correct version', async () => {
	const { stdout } = await bin()('-V')
	expect(stdout).toContain(require('../package.json').version)
})

test('open debug mode', async () => {
	let error = null
	try {
		await bin()('--debug')
	} catch (e) {
		error = e
	}
	expect(error.message).toContain('launch debug mode')
})
