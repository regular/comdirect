//jshint esversion: 11
//jshint -W033
//
const {inspect} = require('util')
const comdirect = require('.')

;(async function() {
  const {getTokens, refreshTokens, getAccountBalances} = comdirect()
  
	const tokens = await getTokens()
  console.dir(tokens)

  do {
    const balances = await getAccountBalances()
    console.log(new Date())
    console.log(inspect(balances, {depth: 4}))

    await wait()
    // wait 5 minutes
    await refreshTokens()
  } while(true)

})()

function wait() {
  return new Promise((resolve, reject) =>{
    setTimeout(resolve, 1000 * 60 * 5)
  })
}
