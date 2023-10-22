import log from './log.js'
import { isDebug, printErrorLog } from './isDebug.js'
import { makeList, makeInput, makePassword } from './inquirer.js'
import { getLatestVersion } from './npm.js'
import request from './request.js'
import Github from './git/github.js'
import Gitee from './git/gitee.js'
import { getGitPlatform, clearCache } from './git/GitServer.js'
import { initGitServer, initGitType, createRemoteRepo } from './git/GitUtils.js'

export {
	log,
	isDebug,
	makeList,
	makeInput,
	makePassword,
	printErrorLog,
	getLatestVersion,
	request,
	Gitee,
	Github,
	getGitPlatform,
	clearCache,
	initGitServer,
	initGitType,
	createRemoteRepo
}
