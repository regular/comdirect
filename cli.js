//jshint esversion: 11
//jshint -W033
//
const comdirect = require('.')
const {getTransactions} = require('./low-level')
const {refreshTokenFlowIfNeeded} = require('./high-level')

;(async function() {
	const {accountId} = await comdirect.start({autoRefresh: false, webhook: false})

	await refreshTokenFlowIfNeeded()

  const minDate = '2022-01-01'
  const maxDate = '2022-02-01'

  let offset = 0
  let result = []
	do {
    transactions = await getTransactions(accountId[0], offset, minDate, maxDate)
    result = result.concat(transactions.values)
    //console.log(Object.assign({}, transactions, {values:null}))
    //transactions.values.forEach(console.log)
    
    transactions.values.forEach(({bookingDate, transactionValue:{value, unit}, remittanceInfo})=>{
      console.log(bookingDate, unit, value, remittanceInfo[0])
    })

    offset += transactions.values.length
    console.log(`Got ${result.length} transactions`)
  } while(result.length < transactions.paging.matches && transactions.paging.index < transactions.paging.matches)

})()
