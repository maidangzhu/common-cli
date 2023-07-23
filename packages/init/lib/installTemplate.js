import fse from 'fs-extra'
import path from 'node:path'
import { pathExistsSync } from 'path-exists'
import ora from 'ora'
import { log } from '@downzoo/utils'

function getCacheFilePath(targetPath, template) {
	return path.resolve(targetPath, 'node_modules', template.npmName)
}

function copyFile(targetPath, template, installDir) {
	const originFile = getCacheFilePath(targetPath, template)
	const fileList = fse.readdirSync(originFile)
	const spinner = ora(`正在拷贝模板文件 ${template.npmName}...`).start()
	fileList.map((file) => {
		fse.copySync(`${originFile}/${file}`, `${installDir}/${file}`)
	})
	spinner.stop()
	log.success(`拷贝模板文件 ${template.npmName} 成功`)
}

export default function installTemplate(selectedTemplate, opts) {
	const { force = false } = opts
	const { targetPath, name, template } = selectedTemplate
	const rootDir = process.cwd()
	fse.ensureDirSync(targetPath)
	const installDir = path.resolve(`${rootDir}/${name}`)
	log.verbose('installDir', installDir)

	if (pathExistsSync(installDir)) {
		if (!force) {
			log.error(`当前目录下已存在 ${installDir} 文件夹`)
			return
		} else {
			log.verbose('force', force)
			fse.removeSync(installDir)
			fse.ensureDirSync(installDir)
		}
	} else {
		fse.ensureDirSync(installDir)
	}

	copyFile(targetPath, template, installDir)
}

