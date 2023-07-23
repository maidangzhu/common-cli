import path from 'node:path'
import { pathExistsSync } from 'path-exists'
import fse from 'fs-extra'
import ora from 'ora'
import { execa } from 'execa'
import { printErrorLog, log } from '@downzoo/utils'

const getCacheDir = (targetPath) => {
	return path.resolve(targetPath, 'node_modules')
}

const makeCacheDir = (targetPath) => {
	const cacheDir = getCacheDir(targetPath)
	if (!pathExistsSync(cacheDir)) {
		fse.mkdirpSync(cacheDir)
	}
}

const downloadAppTemplate = async (targetPath, selectedTemplate) => {
	const { npmName, version } = selectedTemplate
	const installCommand = 'pnpm'
	const installArgs = [
		'install',
		`${npmName}@${version}`
	]
	const cwd = targetPath
	log.verbose('installArgs', installArgs)
	log.verbose('cwd', cwd)
	await execa(installCommand, installArgs, { cwd })
}

const downloadTemplate = async (selectedTemplate) => {
	const { targetPath, template } = selectedTemplate
	makeCacheDir(targetPath)
	const spinner = ora(`Downloading...\n`).start()

	try {
		await downloadAppTemplate(targetPath, template)
		spinner.stop()
		log.success('downloaded success')
	} catch (e) {
		spinner.stop()
		printErrorLog(e)
	}
}

export default downloadTemplate
