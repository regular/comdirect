//jshint esversion: 11
//jshint -W033

const fs = require('fs')

const utils = require('./utils')

module.exports = function() {
  const {
    oAuthInit,
    getSessionStatus,
    validateSesssionTAN,
    activateSesssionTAN,
    oAuthSecondaryFlow,
    refreshTokenFlow,
    getAccountInfo,
    getTransactions,
    getAccountBalances
  } = require('./low-level')({load, save})

  const CREDENTIALS_FILE_PATH = process.env.CREDENTIALS_FILE_PATH || '.credentials'
  let memory = {}
  const reference = {}
  const persistence = process.env.PERSISTENCE
  const DEBUG = process.env.DEBUG || false

  if (persistence) {
    console.log('using', CREDENTIALS_FILE_PATH)
  }

  function load() {
    if (!persistence) return memory
    try {
      return JSON.parse(fs.readFileSync(CREDENTIALS_FILE_PATH, 'utf8'))
    } catch (error) {
      console.log('creating empty file:', CREDENTIALS_FILE_PATH)
      fs.writeFileSync(CREDENTIALS_FILE_PATH, '{}', 'utf8')
      return {}
    }
  }

  function save(object) {
    const credentials = load()
    const patched = Object.assign({}, credentials, object)
    if (persistence) {
      fs.writeFileSync(CREDENTIALS_FILE_PATH, JSON.stringify(patched, null, 2), 'utf8')
    } else {
      memory = patched
    }
  }

  async function loadUserData(challengeUrl, username, password, tan) {
    const data = await getValidCredentials(challengeUrl, username, password, tan)
    if (data == null) {
      return null // for webhook
    }
    if (data.accountId == null) {
      const accountId = await getAccountInfo()
      save({accountId})
      return load()
    }
    return data
  }

  // refresh access token if needed
  async function refreshTokenFlowIfNeeded() {
    try {
      await getAccountInfo()
      return {status: 'still valid'}
    } catch (error) {
      // ignore
    }
    try {
      await refreshTokenFlow()
      return {status: 'updated'}
    } catch (error) {
      throw error
    }
  }

  async function getValidCredentials(challengeUrl, username, password, tan) {
    const data = load()
    try {
      // try access token
      const accountId = await getAccountInfo()
      if (accountId != null) {
        // everything is loaded and still valid
        save({accountId})
        return load()
      }
    } catch (error) {
      // ignore (access token has expired)
    }
    try {
      if (data.refresh_token != null) {
        const response = await refreshTokenFlow()
        return load()
      }
      // first run, continue with runOAuthFlow()
    } catch (error) {
      // ignore (refresh token has expired)
    }
    // initial/very first run will do this
    return await runOAuthFlow(challengeUrl, username, password, tan)
  }

  async function runOAuthFlow(challengeUrl, username, password, tan) {
    if (username == null || password == null || tan == null) {
      return null // for webhook
    }
    const _username = await username()
    const _password = await password()
    const oAuthResponse = await oAuthInit(_username, _password)
    const sessionId =  utils.guid()
    const requestId = utils.requestId()
    save({sessionId, requestId})
    const sessionStatus = await getSessionStatus() 
    const sessionUUID = sessionStatus[0].identifier
    const validationResponse = await validateSesssionTAN(sessionUUID)
    if (validationResponse.headers['x-once-authentication-info'] != null) {
      const header = JSON.parse(validationResponse.headers['x-once-authentication-info'])
      if (DEBUG) console.log('x-once-authentication-info', header)
      if (header.id != null) {
        reference.challenge = header.challenge
        //console.log(`Please solve the photoTAN with your browser: ${challengeUrl}`)
        const _tan = await tan()
        const activatedSession = await activateSesssionTAN(_tan, header.id, sessionStatus[0].identifier)
        if (activatedSession.sessionTanActive === true) {
          const finalRespone = await oAuthSecondaryFlow()
          return Object.assign({}, load(), {kdnr: finalRespone.kdnr} )
        } else {
          throw new Error('photoTAN was not successful')
        }
      }
    }
    throw new Error('photoTAN not possible')
  }

  return {
    loadUserData,
    getValidCredentials,
    refreshTokenFlow,
    refreshTokenFlowIfNeeded,
    load,
    save,
    getTransactions,
    getAccountBalances
  }
}
