import path from "node:path"
import { program } from 'commander'
import semver from 'semver'
import chalk from 'chalk'
import fse from 'fs-extra'
import { dirname } from "dirname-filename-esm"
import createInitCommand from '@downzoo/init'
import { log, isDebug } from '@downzoo/utils'

const __dirname = dirname(import.meta)
const pkgPath = path.resolve(__dirname, '../package.json')
const pkg = fse.readJsonSync(pkgPath)

const LOWEST_NODE_VERSION = '18.0.0'

function preAction() {
	checkNodeVersion()
}

function checkNodeVersion() {
	log.verbose('node version', process.version)
	if (!semver.gte(process.version, LOWEST_NODE_VERSION)) {
		throw new Error(chalk.red(`common-cli 需要安装 ${LOWEST_NODE_VERSION} 以上版本的Node.js`))
	}
}

process.on('uncaughtException', (e) => {
	if (isDebug) {
		log.error(e)
	} else {
		console.error(e.message)
	}
})

export default function () {
	log.info('version', pkg.version)

	program
		.name(Object.keys(pkg.bin)[0])
		.usage('<command> [options]')
		.version(pkg.version)
		.option('-d, --debug', '是否开启调试模式', false)
		.hook('preAction', preAction)

	createInitCommand(program)

	program.parse(process.argv)
}
