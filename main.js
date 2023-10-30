
const {loadUserData} = require('./high-level')
const utils = require('./utils')

function start() {
  return loadUserData(
    {}, "",
    ()=> utils.getInput('Zugangsnummer/Username: '),
    ()=> utils.getInput('PIN/Password: ', true),
    ()=>utils.getInput('TAN: ')
  )
}

module.exports = start

