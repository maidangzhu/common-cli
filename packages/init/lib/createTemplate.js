import { homedir } from 'node:os'
import path from 'node:path'
import fse from 'fs-extra'
import { log, makeInput, makeList, getLatestVersion, request, printErrorLog } from '@downzoo/utils'

const ADD_TYPE_PROJECT = 'project'
const ADD_TYPE_PAGE = 'component'
const DEFAULT_TEMPLATE_LIST = [
	{
		name: 'react项目模板',
		value: 'react-template',
		npmName: '@downzoo/react-template',
		version: '1.0.0',
		team: 'pc'
	}
]
const ADD_TYPE_LIST = [{
	name: '项目',
	value: ADD_TYPE_PROJECT
}, {
	name: '页面',
	value: ADD_TYPE_PAGE
}]
const TEMP_HOME = '.common-cli'

// 获取创建类型
function getAddType() {
	return makeList({
		title: '创建类型',
		message: '请选择初始化类型',
		defaultValue: ADD_TYPE_PROJECT,
		choices: ADD_TYPE_LIST
	})
}

// 获取项目名称
function getAddName() {
	return makeInput({
		message: '请输入项目名称',
		defaultValue: '',
		validate: value => {
			if (value.length > 0) {
				return true
			}
			return 'name must not be empty'
		}
	})
}

// 获取项目模板
function getAddTemplate(list) {
	return makeList({
		title: '项目模板',
		message: '请选择项目模板',
		defaultValue: '@downzoo/react-template',
		choices: list || DEFAULT_TEMPLATE_LIST
	})
}

function getAddTeam(list) {
	return makeList({
		title: '项目团队',
		message: '请选择项目团队',
		defaultValue: 'pc',
		choices: list.map((each) => ({ name: each, value: each }) || ['pc', 'web'])
	})
}

// 安装缓存目录
function makeTargetPath() {
	fse.ensureDirSync(path.resolve(homedir(), TEMP_HOME))
	return path.resolve(`${homedir()}/${TEMP_HOME}`, 'addTemplate')
}

async function getTemplates() {
	try {

		const data = await request({
			url: '/api/v1/project',
			method: 'get'
		})

		log.verbose('template', data)
		return data
	} catch (e) {
		printErrorLog(e)
		return null
	}
}

async function createTemplate(name, opts) {
	const ADD_TEMPLATE_LIST = await getTemplates()
	if (!ADD_TEMPLATE_LIST) {
		throw new Error('获取模板列表失败！')
	}
	let addType // 创建项目类型
	let addName // 项目名称
	let selectedTemplate // 项目模板

	const { template = null, type = null } = opts

	if (type) {
		addType = type
	} else {
		addType = await getAddType()
	}
	log.verbose('addType', addType)

	if (addType === ADD_TYPE_PROJECT) {
		if (name) {
			addName = name
		} else {
			addName = await getAddName()
		}
		log.verbose('addName', addName)
		if (template) {
			selectedTemplate = ADD_TEMPLATE_LIST.find(tp => tp.value === template)
			if (!selectedTemplate) {
				throw new Error(`项目模板 ${template} 不存在！`)
			}
		} else {
			const teamList = [...new Set(ADD_TEMPLATE_LIST.map(tp => tp.team))]
			const addTeam = await getAddTeam(teamList)
			log.verbose('addTeam', addTeam)

			const addTemplate = await getAddTemplate(ADD_TEMPLATE_LIST)
			selectedTemplate = ADD_TEMPLATE_LIST.find(tp => tp.value === addTemplate)
			log.verbose('addTemplate', selectedTemplate)
		}

		log.verbose('selectedTemplate', selectedTemplate)
		const latestVersion = await getLatestVersion(selectedTemplate.npmName)
		log.verbose('latestVersion', latestVersion)

		const selectedTemplateNew = {
			...selectedTemplate,
			version: latestVersion
		}
		const targetPath = makeTargetPath()
		log.verbose('targetPath', targetPath)

		return {
			type: addType,
			name: addName,
			template: selectedTemplateNew,
			targetPath
		}
	} else {
		throw new Error(`创建的项目类型 ${addType} 不支持`)
	}
}

export default createTemplate
