import Command from '@downzoo/command'
import { log } from '@downzoo/utils'
import { createTemplate } from './createTemplate.js'
import downloadTemplate from './downloadTemplate.js'

class InitCommand extends Command {
	get command() {
		return 'init [name]'
	}

	get description() {
		return 'Initialize a new project'
	}

	get options() {
		return [
			['-f, --force', '是否强制更新', false],
			['-v, --version', '版本号', '0.0.0']
		]
	}

	async action([name, opts]) {
		log.verbose('init', name, opts)

		// 1. 选择项目模板，生成项目信息
		const selectedTemplate = await createTemplate(name, opts)
		log.verbose('template', selectedTemplate)
		// 2. 下载项目模板至缓存目录
		downloadTemplate(selectedTemplate)
		// 3. 安装项目模板至项目目录

	}

	preAction() {
		// console.log('-> pre')
	}

	postAction() {
		// console.log('-> post')
	}
}

function Init(instance) {
	return new InitCommand(instance)
}

export default Init
