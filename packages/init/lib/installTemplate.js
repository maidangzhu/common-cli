import fse from 'fs-extra'
import path from 'node:path'
import { pathExistsSync } from 'path-exists'
import ora from 'ora'
import ejs from 'ejs'
import { glob } from 'glob'
import { log } from '@downzoo/utils'

function getCacheFilePath(targetPath, template) {
	return path.resolve(targetPath, 'node_modules', `${template.npmName}/templates/${template.value}`)
}

function copyFile(targetPath, template, installDir) {
	const originFile = getCacheFilePath(targetPath, template)
	log.verbose('originFile', originFile)
	const fileList = fse.readdirSync(originFile)
	const spinner = ora(`正在拷贝模板文件 ${template.npmName}...`).start()
	fileList.map((file) => {
		fse.copySync(`${originFile}/${file}`, `${installDir}/${file}`)
	})
	spinner.stop()
	log.success(`拷贝模板文件 ${template.npmName} 成功`)
}

function ejsRender(installDir, template) {
	glob('**', {
		cwd: installDir,
		nodir: true,
		ignore: [
			'**/publish/**',
			'**/node_modules/**',
		]
	})
		.then((files) => {
			const ejsData = {
				data: {
					name: template?.value ?? 'template'
				}
			}
			log.verbose('ejsData', ejsData)

			files.forEach((file) => {
				const filePath = path.join(installDir, file)
				log.verbose('filePath', filePath)
				ejs.renderFile(filePath, ejsData, (err, result) => {
					if (err) {
						log.error(err)
					} else {
						fse.writeFileSync(filePath, result)
					}
				})
			})
		})
		.catch((e) => {
			log.error(e)
		})
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
	ejsRender(installDir, template)
}

