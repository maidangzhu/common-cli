import { log, makeInput, makeList } from '@downzoo/utils'

const ADD_TYPE_PROJECT = 'project'
const ADD_TYPE_COMPONENT = 'component'
const ADD_TEMPLATE_LIST = [{
	name: 'react项目模板',
	value: 'react-template',
	npmName: '@downzoo/react-template',
	version: '1.0.0'
},
	{
		name: 'vue项目模板',
		value: 'vue-template',
		npmName: '@downzoo/vue-template',
		version: '1.0.0'
	}
]
const ADD_TYPE_LIST = [{
	name: '项目',
	value: ADD_TYPE_PROJECT
}, {
	name: '组件',
	value: ADD_TYPE_COMPONENT
}]

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
		defaultValue: ''
	})
}

// 获取项目模板
function getAddTemplate() {
	return makeList({
		title: '项目模板',
		message: '请选择项目模板',
		defaultValue: '@downzoo/react-template',
		choices: ADD_TEMPLATE_LIST
	})
}

export async function createTemplate(name, opts) {
	const addType = await getAddType()
	log.verbose('addType', addType)

	if (addType.name === ADD_TYPE_PROJECT) {
		const addName = await getAddName()
		log.verbose('addName', addName)

	}
}
