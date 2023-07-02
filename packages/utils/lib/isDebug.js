import log from './log.js'

export function isDebug() {
	return (process.argv.includes('--debug') || process.argv.includes('-d'))
}

export function printErrorLog(e, type) {
	if (isDebug()) {
		log.error(type, e)
	} else {
		log.error(type, e.message)
	}
}
