import config from '../config/config.js'

const AccountService = {
  createUser(user) {
    return fetch(`${config.baseUrl}/Account/v1/User`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify(user)
    })
  },

  generateToken(user) {
    return fetch(`${config.baseUrl}/Account/v1/GenerateToken`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify(user)
    })
  },

  authorized(user) {
    return fetch(`${config.baseUrl}/Account/v1/Authorized`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify(user)
    })
  },

  getUser(userId, user) {
    const credentials = Buffer.from(`${user.userName}:${user.password}`).toString('base64')

    return fetch(`${config.baseUrl}/Account/v1/User/${userId}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Basic ${credentials}`
      },
      signal: AbortSignal.timeout(5000)
    })
  },

  deleteUser(userId, user) {
    const credentials = Buffer.from(`${user.userName}:${user.password}`).toString('base64')

    return fetch(`${config.baseUrl}/Account/v1/User/${userId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Basic ${credentials}`
      },
      signal: AbortSignal.timeout(5000)
    })
  }
}

export default AccountService
