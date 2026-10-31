const baseUrl = 'https://bookstore.demoqa.com'

describe('Bookstore API', () => {
  const usersToDelete = []

  test('Create User - Invalid Password', async () => {
    // Arrange — подготовка
    const user = {
      userName: `otus_weak_${Date.now()}`,
      password: '123'
    }

    // Act — действие
    const response = await fetch(`${baseUrl}/Account/v1/User`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify(user)
    })

    const body = await response.json()

    // Assert — проверки
    expect(response.status).toBe(400)
    expect(body.code).toBe('1300')
    expect(body.message).toContain('Password must be eight characters or longer')
  }, 15000)

  test('Create User - Success', async () => {
    // Arrange — подготовка
    const user = {
      userName: `otus_success_${Date.now()}`,
      password: 'OtusTest!2026'
    }

    // Act — действие
    const response = await fetch(`${baseUrl}/Account/v1/User`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify(user)
    })

    const body = await response.json()

    if (response.status === 201) {
      usersToDelete.push({
        userId: body.userID,
        userName: user.userName,
        password: user.password
      })
    }

    // Assert — проверки
    expect(response.status).toBe(201)
    expect(body.userID).toEqual(expect.any(String))
    expect(body.userID).not.toBe('')
    expect(body.username).toBe(user.userName)
    expect(body.books).toEqual([])
  }, 15000)

  test('Create User - Duplicate Username', async () => {
    // Arrange — подготовка
    const user = {
      userName: `otus_duplicate_${Date.now()}`,
      password: 'OtusTest!2026'
    }

    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    }

    const createResponse = await fetch(`${baseUrl}/Account/v1/User`, {
      method: 'POST',
      headers,
      body: JSON.stringify(user)
    })
    const createdUser = await createResponse.json()

    if (createResponse.status === 201) {
      usersToDelete.push({
        userId: createdUser.userID,
        userName: user.userName,
        password: user.password
      })
    }

    expect(createResponse.status).toBe(201)

    // Act — повторное создание того же пользователя
    const response = await fetch(`${baseUrl}/Account/v1/User`, {
      method: 'POST',
      headers,
      body: JSON.stringify(user)
    })

    const body = await response.json()

    // Assert — проверки
    expect(response.status).toBe(406)
    expect(body.code).toBe('1204')
    expect(body.message).toBe('User exists!')
  }, 15000)

  test('Generate Token - Success', async () => {
    // Arrange — подготовка
    const user = {
      userName: `otus_token_${Date.now()}`,
      password: 'OtusTest!2026'
    }

    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    }

    const createResponse = await fetch(`${baseUrl}/Account/v1/User`, {
      method: 'POST',
      headers,
      body: JSON.stringify(user)
    })

    const createdUser = await createResponse.json()

    if (createResponse.status === 201) {
      usersToDelete.push({
        userId: createdUser.userID,
        userName: user.userName,
        password: user.password
      })
    }

    expect(createResponse.status).toBe(201)

    // Act — получение токена
    const response = await fetch(`${baseUrl}/Account/v1/GenerateToken`, {
      method: 'POST',
      headers,
      body: JSON.stringify(user)
    })

    const body = await response.json()

    // Assert — проверки
    expect(response.status).toBe(200)
    expect(body.status).toBe('Success')
    expect(body.result).toBe('User authorized successfully.')
    expect(body.token).toEqual(expect.any(String))
    expect(body.token).not.toBe('')
    expect(body.expires).toEqual(expect.any(String))
    expect(Date.parse(body.expires)).toBeGreaterThan(Date.now())
  }, 15000)

  test('Generate Token - Invalid Credentials', async () => {
    // Arrange — подготовка
    const user = {
      userName: `otus_invalid_token_${Date.now()}`,
      password: 'OtusTest!2026'
    }

    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    }

    const createResponse = await fetch(`${baseUrl}/Account/v1/User`, {
      method: 'POST',
      headers,
      body: JSON.stringify(user)
    })
    const createdUser = await createResponse.json()

    if (createResponse.status === 201) {
      usersToDelete.push({
        userId: createdUser.userID,
        userName: user.userName,
        password: user.password
      })
    }
    expect(createResponse.status).toBe(201)

    // Act — запрос токена с неправильным паролем
    const response = await fetch(`${baseUrl}/Account/v1/GenerateToken`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        userName: user.userName,
        password: 'WrongPassword!2026'
      })
    })

    const body = await response.json()

    // Assert — проверки
    expect(response.status).toBe(200)
    expect(body.status).toBe('Failed')
    expect(body.result).toBe('User authorization failed.')
    expect(body.token).toBeNull()
    expect(body.expires).toBeNull()
  }, 15000)

  afterAll(async () => {
    const cleanupErrors = []

    for (const user of usersToDelete) {
      try {
        const credentials = Buffer.from(`${user.userName}:${user.password}`).toString('base64')

        const response = await fetch(`${baseUrl}/Account/v1/User/${user.userId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Basic ${credentials}`
          },
          signal: AbortSignal.timeout(5000)
        })

        if (response.status !== 204) {
          cleanupErrors.push(`${user.userName}: HTTP ${response.status}`)
        }
      } catch (error) {
        cleanupErrors.push(`${user.userName}: ${error.message}`)
      }
    }

    expect(cleanupErrors).toEqual([])
  }, 30000)
})
