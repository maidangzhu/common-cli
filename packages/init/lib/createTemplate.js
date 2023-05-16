import { log, makeList } from '@downzoo/utils'

const ADD_TYPE_PROJECT = 'project'
const ADD_TYPE_COMPONENT = 'component'
const ADD_TEMPLATE = [{
	name: 'react项目模板',
	npmName: '@downzoo/react-template',
	version: '1.0.0'
}]
const ADD_TYPE = [{
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
		choices: ADD_TYPE
	})
}

export async function createTemplate(name, opts) {
	const addType = await getAddType()
	log.verbose('addType', addType)
}
