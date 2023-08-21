import Command from '@downzoo/command'
import { getGitPlatform, Gitee, Github, log, makeList } from '@downzoo/utils'

class InstallCommand extends Command {
	get command() {
		return 'install'
	}

	get description() {
		return 'Install project'
	}

	get options() {

	}

	async action(params) {
		let platform = getGitPlatform()
		if (!platform) {
			platform = await makeList({
				message: 'choose Git platform',
				choices: [{
					name: 'Github',
					value: 'github'
				}, {
					name: 'Gitee',
					value: 'Gitee'
				}]
			})
		}

		log.verbose('platform', platform)

		let gitAPI
		if (platform === 'github') {
			gitAPI = new Github()
		} else if (platform === 'Gitee') {
			gitAPI = new Gitee()
		}

		gitAPI.savePlatform(platform)
		await gitAPI.init()
	}

	preAction() {

	}

	postAction() {

	}

}

function Install(instance) {
	return new InstallCommand(instance)
}

export default Install
