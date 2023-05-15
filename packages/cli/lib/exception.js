import { isDebug, log } from '@downzoo/utils'

function printErrorLog(e, type) {
	if (isDebug()) {
		log.error(type, e)
	} else {
		log.error(type, e.message)
	}
}

process.on('uncaughtException', printErrorLog)

process.on('unhandledRejection', printErrorLog)
