const Command = require('@downzoo/command')

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

	action([name, opts]) {
		console.log('init', name, opts)
	}

	preAction() {
		console.log("-> pre");
	}

	postAction() {
		console.log("-> post");
	}
}

function Init(instance) {
	return new InitCommand(instance)
}

module.exports = Init
