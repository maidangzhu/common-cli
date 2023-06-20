import fse from 'fs-extra'
import path from 'node:path'
import { pathExistsSync } from 'path-exists'
import { log } from '@downzoo/utils'

function getCacheFilePath(targetPath, template) {
  return path.resolve(targetPath, 'node_modules', template.npmName, 'template')
}

function copyFile(targetPath, template, installDir) {
	const originFile = getCacheFilePath(targetPath, template)

	console.log("-> originFile", originFile);

	console.log("-> pathExistsSync(originFile", pathExistsSync(originFile));
}

export default function installTemplate(selectedTemplate, opts) {
	const { force = false } = opts
	const { targetPath, name, template } = selectedTemplate
	const rootDir = process.cwd()
	fse.ensureDirSync(targetPath)
	const installDir = path.resolve(`${rootDir}/${name}`)

	if (pathExistsSync(installDir)) {
		if(!force) {
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

