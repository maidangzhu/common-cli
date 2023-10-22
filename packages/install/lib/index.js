import ora from 'ora'
import Command from '@downzoo/command'
import {
	log,
	makeList,
	makeInput,
	printErrorLog,
	initGitServer
} from '@downzoo/utils'

const PREV_PAGE = '${prev_page}'
const NEXT_PAGE = '${next_page}'
const SEARCH_MODE_REPO = 'search_repo'
const SEARCH_MODE_CODE = 'search_code'

class InstallCommand extends Command {
	get command() {
		return 'install'
	}

	get description() {
		return 'install project'
	}

	get options() {
	}

	async action() {
		await this.generateGitAPI()
		await this.searchGitAPI()
		// await this.selectTags()
		log.verbose('full_name', this.keyword)
		log.verbose('selected_tag', this.selectedTag)
		// await this.downloadRepo()
		// await this.installDependencies()
		// await this.runRepo()
	}

	async runRepo() {
		await this.gitAPI.runRepo(process.cwd(), this.keyword)
	}

	async downloadRepo() {
		const spinner = ora(`正在下载: ${this.keyword}(${this.selectedTag})`).start()
		try {
			await this.gitAPI.cloneRepo(this.keyword, this.selectedTag)
			spinner.stop()
			log.success(`下载成功: ${this.keyword}(${this.selectedTag})`)
		} catch (e) {
			spinner.stop()
			printErrorLog(e)
		}
	}

	async installDependencies() {
		const spinner = ora(`正在安装依赖: ${this.keyword}(${this.selectedTag})`).start()
		try {
			const ret = await this.gitAPI.installDependencies(process.cwd(), this.keyword, this.selectedTag)
			spinner.stop()
			if (!ret) {
				log.error(`依赖安装失败: ${this.keyword}(${this.selectedTag})`)
			} else {
				log.success(`依赖安装成功: ${this.keyword}(${this.selectedTag})`)
			}
		} catch (e) {
			spinner.stop()
			printErrorLog(e)
		}
	}

	async generateGitAPI() {
		this.gitAPI = await initGitServer()
	}

	async searchGitAPI() {
		// 1. 收集搜索关键词和开发语言
		const platform = this.gitAPI.getPlatform()
		if (platform === 'github') {
			this.mode = await makeList({
				message: '请选择搜索模式',
				choices: [
					{ name: '仓库', value: SEARCH_MODE_REPO },
					{ name: '源码', value: SEARCH_MODE_CODE }
				]
			})
		} else {
			this.mode = SEARCH_MODE_REPO
		}
		log.verbose('mode', this.mode)
		this.q = await makeInput({
			message: '请输入搜索关键词',
			validate(value) {
				if (value.length > 0) {
					return true
				} else {
					return '请输入搜索关键词'
				}
			}
		})
		this.language = await makeInput({
			message: '请输入开发语言'
		})
		log.verbose('search word', this.q, this.language, platform)
		this.page = 1
		this.perPage = 10
		await this.doSearch()
	}

	async doSearch() {
		const platform = this.gitAPI.getPlatform()
		let searchResult
		let count = 0
		let list = []
		// github
		if (platform === 'github') {
			// 2. 生成搜索参数
			const params = {
				q: this.q + (this.language ? `+language:${this.language}` : ''),
				order: 'desc',
				sort: 'stars',
				per_page: this.perPage,
				page: this.page,
			};
			log.verbose('search params', params)
			if (this.mode === SEARCH_MODE_REPO) {
				searchResult = await this.gitAPI.searchRepositories(params)
				list = searchResult.items.map(item => ({
					name: `${item.full_name}(${item.description})`,
					value: item.full_name
				}))
			} else {
				searchResult = await this.gitAPI.searchCode(params)
				list = searchResult.items.map(item => ({
					name: item.repository.full_name + (item.repository.description ? `(${item.repository.description})` : ''),
					value: item.repository.full_name
				}))
			}
			count = searchResult.total_count // 整体数据量
			log.verbose('search count', count)
		} else {
			// gitee
			const params = {
				q: this.q,
				order: 'desc',
				sort: 'stars_count',
				per_page: this.perPage,
				page: this.page
			}
			if (this.language) {
				params.language = this.language // 注意输入格式：JavaScript
			}
			log.verbose('search params', params)
			searchResult = await this.gitAPI.searchRepositories(params)
			count = 9999999
			list = searchResult.map(item => ({
				name: `${item.full_name}(${item.description})`,
				value: item.full_name
			}))
		}

		// 判断当前页面，已经是否到达最大页数
		if ((platform === 'github' && this.page * this.perPage < count) || list.length > 0) {
			list.push({
				name: '下一页',
				value: NEXT_PAGE
			})
		}
		if (this.page > 1) {
			list.unshift({
				name: '上一页',
				value: PREV_PAGE
			})
		}

		if (count > 0) {
			const keyword = await makeList({
				message: platform === 'github' ? `请选择要下载的项目（共${count}条数据）` : '请选择要下载的项目',
				choices: list
			})

			if (keyword === NEXT_PAGE) {
				await this.nextPage()
			} else if (keyword === PREV_PAGE) {
				await this.prevPage()
			} else {
				// 下载项目
				this.keyword = keyword
			}
		}
	}

	async nextPage() {
		this.page++
		await this.doSearch()
	}

	async prevPage() {
		this.page--
		await this.doSearch()
	}

	async selectTags() {
		let tagsList
		this.tagPage = 1
		this.tagPerPage = 30
		tagsList = await this.doSelectTags()
	}

	async doSelectTags() {
		const platform = this.gitAPI.getPlatform()
		let tagsListChoices = []
		if (platform === 'github') {
			const params = {
				page: this.tagPage,
				per_page: this.tagPerPage
			}
			const tagsList = await this.gitAPI.getTags(this.keyword, params)
			tagsListChoices = tagsList.map(item => ({
				name: item.name,
				value: item.name
			}))
			if (tagsList.length > 0) {
				tagsListChoices.push({
					name: '下一页',
					value: NEXT_PAGE
				})
			}
			if (this.tagPage > 1) {
				tagsListChoices.unshift({
					name: '上一页',
					value: PREV_PAGE
				})
			}
		} else {
			const tagsList = await this.gitAPI.getTags(this.keyword)
			tagsListChoices = tagsList.map(item => ({
				name: item.name,
				value: item.name
			}))
		}
		const selectedTag = await makeList({
			message: '请选择tag',
			choices: tagsListChoices
		})

		if (selectedTag === NEXT_PAGE) {
			await this.nextTags()
		} else if (selectedTag === PREV_PAGE) {
			await this.prevTags()
		} else {
			this.selectedTag = selectedTag
		}
	}

	async nextTags() {
		this.tagPage++
		await this.doSelectTags()
	}

	async prevTags() {
		this.tagPage--
		await this.doSelectTags()
	}
}

function Install(instance) {
	return new InstallCommand(instance)
}

export default Install
