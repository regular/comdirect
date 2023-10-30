//jshint esversion: 11
//jshint -W033
//
const {inspect} = require('util')
const comdirect = require('.')
const {getAccountBalances} = require('./low-level')
const {refreshTokenFlowIfNeeded} = require('./high-level')

;(async function() {
	const result = await comdirect.start({autoRefresh: false, webhook: false})
  console.dir(result)

  do {
    const balances = await getAccountBalances()
    console.log(new Date())
    console.log(inspect(balances, {depth: 4}))

    // wait 5 minutes
    await new Promise((resolve, reject) =>{
      setTimeout(resolve, 1000 * 60 * 5)
    })
    await refreshTokenFlowIfNeeded()
  } while(true)

})()
