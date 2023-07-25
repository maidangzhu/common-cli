import path from 'node:path'
import { log } from '@downzoo/utils'
import fse from 'fs-extra'
import { pathExistsSync } from 'path-exists'
import ora from 'ora'
import ejs from 'ejs'
import { glob } from 'glob'
import { execa } from 'execa'

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

function ejsRender(installDir, template, name) {
	const { ignore } = template
	const ejsData = {
		data: {
			name
		}
	}

	glob('**', {
		cwd: installDir,
		nodir: true,
		ignore: ignore ?? []
	})
		.then((files) => {
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

export default async function installTemplate(selectedTemplate, opts) {
	const { force = false } = opts
	const { targetPath, name, template } = selectedTemplate
	const rootDir = process.cwd()
	const gitCommand = 'git'
	const gitArgs = ['init']
	const installDir = path.resolve(`${rootDir}/${name}`)
	log.verbose('installDir', installDir)
	fse.ensureDirSync(targetPath)

	if (pathExistsSync(installDir)) {
		if (!force) {
			log.error(`当前目录下已存在 ${installDir} 文件夹`)
			return
		} else {
			log.verbose('force', `当前目录下已存在 ${installDir} 文件夹，正在移除并重新安装`)
			fse.removeSync(installDir)
			fse.ensureDirSync(installDir)
		}
	} else {
		fse.ensureDirSync(installDir)
	}

	copyFile(targetPath, template, installDir)
	ejsRender(installDir, template, name)
	const gitCommandRes = await execa(gitCommand, gitArgs, { cwd: installDir })
	const { stdout} = gitCommandRes
	log.verbose('gitInit', stdout)
}

