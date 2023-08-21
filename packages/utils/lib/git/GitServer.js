import { homedir } from 'node:os'
import fs from 'node:fs'
import path from 'node:path'
import { pathExistsSync } from 'path-exists'
import fse from 'fs-extra'

import log from '../log.js'
import { makePassword } from '../inquirer.js'

const TEMP_HOME = '.common-cli'
const TEMP_TOKEN = '.token'
const TEMP_PLATFORM = '.git-platform'

function createTokenPath() {
	return path.resolve(`${homedir()}/${TEMP_HOME}`, TEMP_TOKEN)
}

function createPlatformPath() {
	return path.resolve(`${homedir()}/${TEMP_HOME}`, TEMP_PLATFORM)
}

class GitServer {
	async init() {
		const tokenPath = createTokenPath()
		log.verbose('tokenPath', tokenPath)
		if (pathExistsSync(tokenPath)) {
			this.token = fse.readFileSync(tokenPath, 'utf-8').toString()
		} else {
			this.token = await this.getToken()
			fse.writeFileSync(tokenPath, this.token)
		}
		log.verbose('token', this.token)
		log.verbose('token path', tokenPath, pathExistsSync(tokenPath))
	}

	getToken() {
		return makePassword({
			message: 'please enter your token'
		})
	}

	savePlatform(platform) {
		fs.writeFileSync(createPlatformPath(), platform)
	}
}

function getGitPlatform() {
	if (pathExistsSync(createPlatformPath())) {
		return fs.readFileSync(createPlatformPath(), 'utf-8').toString()
	}
	return null
}

export {
	GitServer,
  getGitPlatform
}
