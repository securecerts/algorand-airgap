import Axios from 'axios'
const MockAdapter = require('axios-mock-adapter')

// Create a new mock adapter instance for Axios
const mock = new MockAdapter(Axios)

// Mock a successful response for the Algorand API account information endpoint
mock.onGet('/v2/accounts/:accountId').reply((config) => {
  console.log('Mocking Algorand account info:', config.url)

  // Example of a mocked response data
  const mockAccountInfo = {
    address: config.url.split('/').pop(),
    amount: 1000000,
    assets: [],
    rewards: 1000,
  }

  return [200, mockAccountInfo]
})

// Mock a transaction submission endpoint to return an error
mock.onPost('/v2/transactions').reply((config) => {
  console.log('Mocking Algorand transaction submission:', config.url)

  return [400, { message: 'Transaction rejected by mock' }]
})

// Mock any unhandled request to return a 500 error
mock.onAny().reply((config) => {
  console.log('Unhandled request, returning error 500:', config.url)
  return [500, { error: 'Unhandled mock request' }]
})

// Use `mock.onAny().passThrough()` to let unhandled requests go through without mocking
// mock.onAny().passThrough()
