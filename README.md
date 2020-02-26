# comdirect

Un-official node.js module for the [comdirect REST API](https://www.comdirect.de/cms/kontakt-zugaenge-api.html)

## NOTE:

This module works only with the **photoTAN** method!

Use it at your own risk!  
If you enter a wrong TAN 3 times your account will be blocked (to unlock you need to do a phone call).

You can reset the error counter by enter a valid TAN via the 
[official website](https://kunde.comdirect.de/lp/wt/login) by retreiving your [inbox (PostBox)](https://kunde.comdirect.de/itx/posteingangsuche).

Enable the and handle your [REST API credentials](https://kunde.comdirect.de/itx/oauth/privatkunden).

## Motivation

The REST API requires 5 HTTP requests (authentication) before you can fetch your bank account information.  
To fetch account transactions you need 7 HTTP requests in total.

The authentication works with an access token which is valid for 10 minutes and a refresh token which is valid for 20 minutes.
For each new HTTP request both tokens are changing its value and extending the expiration.
If the refresh token is expired you need to authenticate again which means to need to enter a new TAN again.

This module helps you to make it easys as possible by:

- automate much as possible of the authentication flow
  - if there is no valid refresh token you need to open a browser and do the TAN challenge (scan picture and and enter a TAN)
  - if access token is expired but refresh token is valid a new access token is created
- load the account id automatically in order to allow you to fetch account transactions
- auto refresh (update the refresh token automatically every 15 minutes)
- persist data (refresh token, account id, etc.) optionally to run your script again without doing the TAN challenge after it has terminated

## Usage

### Install 
Either clone this repository and run `npm install` or install it with `npm install comdirect`.

## Environment variables

```sh
export CLIENT_ID=User_A1234B567D901012E0XXXXXXXXXXXXXX
export CLIENT_SECRET=ABDBASDBASB12361741623ABACBD
export PERSISTENCE=1 # optionally save refresh token, etc. to file, otherwise everything is only in the memory
export CREDENTIALS_FILE_PATH='.credentials' # defaults to '$PWD/.credentials', only usefull when PERSISTENCE=1
export DEBUG=1 # print all HTTP requests (url, status code, body)
```

### API

```js
comdirect = require('comdirect')
highLevel = require('comdirect/high-level')
lowLevel = require('comdirect/low-level')
```

##### `comdirect(config = {autoRefresh: false, webhook: false, port: 8090})`
Function with an optional config object.  

`autoRefresh`: update the refresh token every 15 minutes  
`webhook`:  if true the authorization starts when you open the URL and do login via a browser. 
`port`: is required to open a URL for the TAN challenge in the browser and the webhook method.  

Returns a promise with the this object:
```json
{
  "access_token": "AAA",
  "refresh_token": "BBB",
  "sessionUUID": "CCC",
  "sessionId": "DDD",
  "requestId": "EEE",
  "accountId": "FFF"
}
```

**WIP**

Please check the source code.


### Example (interactive CLI)

Example with interactive CLI. Follow instructions in the output

```js
const comdirect = require('comdirect')
const {
	getTransactions, 
	getAccountInfo
} = require('comdirect/low-level')

const {load} = require('comdirect/high-level')

;(async function() {
	const result = await server({autoRefresh: true, webhook: false})
	const {
		access_token,
		accountId,
		sessionId,
		requestId
	} = result
	const transactions = await getTransactions(access_token, accountId, sessionId, requestId)
	console.log(transactions.values[0]) // show latest transaction
	
	// wait 11 minutes (access token is expired at this time)
	setTimeout(async function() {
		const {
			access_token,
			accountId,
			sessionId,
			requestId
		} = load() // load always a fresh token
		const transactions = await getTransactions(access_token, accountId, sessionId, requestId)
		console.log(transactions.values[0]) // show latest transaction
	}, 1000 * 60 * 1) 
})()
```

### Example (non interactive CLI)

Example without interactive CLI.  Follow instructions in the output.  
Usefull when deployment (and server start) is automated.  
The login is done via an URL and a form which is displayed in the sever output.


```js
const comdirect = require('comdirect')
const {
	getTransactions, 
	getAccountInfo
} = require('comdirect/low-level')

const {load} = require('comdirect/high-level')

;(async function() {
	const result = await server({autoRefresh: true, webhook: false})
	const {
		access_token,
		accountId,
		sessionId,
		requestId
	} = result
	const transactions = await getTransactions(access_token, accountId, sessionId, requestId)
	console.log(transactions.values[0]) // show latest transaction
	
	// wait 11 minutes (access token is expired at this time)
	setTimeout(async function() {
		const {
			access_token,
			accountId,
			sessionId,
			requestId
		} = load() // load always a fresh token
		const transactions = await getTransactions(access_token, accountId, sessionId, requestId)
		console.log(transactions.values[0]) // show latest transaction
	}, 1000 * 60 * 1) 
})()
```