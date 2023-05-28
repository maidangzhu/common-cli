import path from 'node:path'
import { dirname } from 'dirname-filename-esm'
import { program } from 'commander'
import semver from 'semver'
import fse from 'fs-extra'
import chalk from 'chalk'

import { log, isDebug } from '@downzoo/utils'

const __dirname = dirname(import.meta)
const pkgPath = path.resolve(__dirname, '../package.json')
const pkg = fse.readJsonSync(pkgPath)

const LOWEST_NODE_VERSION = '14.0.0'

function preAction() {
	checkNodeVersion()
}

function checkNodeVersion() {
	log.verbose('node version', process.version)
	if (!semver.gte(process.version, LOWEST_NODE_VERSION)) {
		throw new Error(chalk.red(`common-cli 需要安装 ${LOWEST_NODE_VERSION} 以上版本的Node.js`))
	}
}

export default function createCLI() {
	log.info('version', pkg.version)

	program.on('command:*', (obj) => {
		log.error('未知的命令：' + obj[0])
	})

	program.on('option:debug', () => {
		if (isDebug()) {
			log.verbose('debug', 'launch debug mode')
		}
	})

	return program
		.name(Object.keys(pkg.bin)[0])
		.usage('<command> [options]')
		.version(pkg.version)
		.option('-d, --debug', '是否开启调试模式', false)
		.hook('preAction', preAction)
}
