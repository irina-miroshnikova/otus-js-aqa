import config from '../config/config.ts'

export type UserCredentials = {
  userName: string
  password: string
}

const AccountService = {
  createUser(user: UserCredentials) {
    return fetch(`${config.baseUrl}/Account/v1/User`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify(user)
    })
  },

  generateToken(user: UserCredentials) {
    return fetch(`${config.baseUrl}/Account/v1/GenerateToken`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify(user)
    })
  },

  authorized(user: UserCredentials) {
    return fetch(`${config.baseUrl}/Account/v1/Authorized`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify(user)
    })
  },

  getUser(userId: string, user: UserCredentials) {
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

  deleteUser(userId: string, user: UserCredentials) {
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
