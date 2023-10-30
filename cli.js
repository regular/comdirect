//jshint esversion: 11
//jshint -W033
//
const comdirect = require('.')

async function main() {
  const {getTokens, refreshTokens, getTransactions} = comdirect()

  const minDate = '2022-01-01'
  const maxDate = '2022-02-01'

	const tokens = await getTokens()
  console.dir(tokens)
	const {accountId} = tokens

  await refreshTokens()
  const result = await getTransactions(accountId[0], minDate, maxDate)
  result.forEach(
    ({bookingDate, transactionValue:{value, unit}, remittanceInfo})=>{
      console.log(bookingDate, unit, value, remittanceInfo[0])
    }
  )
}

main()
