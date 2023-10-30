//jshint esversion: 11
//jshint -W033

const highlevel = require('./high-level')
const utils = require('./utils')

module.exports = function() {
  const  hl = highlevel()

  return {
    getTokens,
    getTransactions,
    refreshTokens: hl.refreshTokenFlowIfNeeded,
    getAccountBalances: hl.getAccountBalances
  }

  function getTokens() {
    return hl.loadUserData(
      "",
      ()=> utils.getInput('Zugangsnummer/Username: '),
      ()=> utils.getInput('PIN/Password: ', true),
      ()=>utils.getInput('TAN: ')
    )
  }

  async function getTransactions(accountId, minDate, maxDate) {

    let offset = 0
    let result = []
    do {
      transactions = await hl.getTransactions(accountId, offset, minDate, maxDate)
      result = result.concat(transactions.values)
      //console.log(Object.assign({}, transactions, {values:null}))
      //transactions.values.forEach(console.log)
      
      offset += transactions.values.length
      //console.log(`Got ${result.length} transactions`)
    } while(result.length < transactions.paging.matches && transactions.paging.index < transactions.paging.matches)
    result.reverse()
    const cutoff = result.findIndex( ({bookingDate})=>bookingDate==maxDate )
    //console.log('first invalid', cutoff)
    if (cutoff>=0) result.splice(cutoff)
    return result
  }

}

