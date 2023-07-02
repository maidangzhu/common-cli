/**
 * Abstract class for representing a Command.
 * Must be overridden by commands.
 */
class Command {
	constructor(instance) {
		if (!instance) {
			throw new Error('Command must have an instance!')
		}
		this.program = instance

		const cmd = this.program.command(this.command)
		cmd.description(this.description)
		cmd.hook('preAction', this.preAction)
		cmd.hook('postAction', this.postAction)
		if (this.options?.length > 0) {
			this.options.forEach((option) => {
				cmd.option(...option)
			})
		}
		cmd.action((...params) => {
			this.action(params)
		})
	}

	/**
	 * Gets the command of the Command instance.
	 * Must be overridden.
	 * @abstract
	 */
	get command() {
		throw new Error('Command.command must be overridden!')
	}

	get description() {
		throw new Error('Command.description must be overridden!')
	}

	get options() {
		return []
	}

	get action() {
		throw new Error('Command.action must be overridden!')
	}

	preAction() {
		// empty
	}

	postAction() {
		// empty
	}
}


export default Command
