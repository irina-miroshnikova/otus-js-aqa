import config from '../framework/config/config.js'
import AccountService from '../framework/services/account.service.js'

describe('Bookstore API', () => {
  const usersToDelete = []

  test('Create User - Invalid Password', async () => {
    // Arrange — подготовка
    const user = {
      userName: `otus_weak_${Date.now()}`,
      password: '123'
    }

    // Act — действие
    const response = await AccountService.createUser(user)

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
      password: config.password
    }

    // Act — действие
    const response = await AccountService.createUser(user)

    const body = await response.json()

    // Assert — проверки
    expect(response.status).toBe(201)

    usersToDelete.push({
      userId: body.userID,
      userName: user.userName,
      password: user.password
    })

    expect(body.userID).toEqual(expect.any(String))
    expect(body.userID).not.toBe('')
    expect(body.username).toBe(user.userName)
    expect(body.books).toEqual([])
  }, 15000)

  test('Create User - Duplicate Username', async () => {
    // Arrange — подготовка
    const user = {
      userName: `otus_duplicate_${Date.now()}`,
      password: config.password
    }

    const createResponse = await AccountService.createUser(user)
    const createdUser = await createResponse.json()

    expect(createResponse.status).toBe(201)

    usersToDelete.push({
      userId: createdUser.userID,
      userName: user.userName,
      password: user.password
    })

    // Act — повторное создание того же пользователя
    const response = await AccountService.createUser(user)

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
      password: config.password
    }

    const createResponse = await AccountService.createUser(user)
    const createdUser = await createResponse.json()

    expect(createResponse.status).toBe(201)

    usersToDelete.push({
      userId: createdUser.userID,
      userName: user.userName,
      password: user.password
    })

    // Act — получение токена

    const response = await AccountService.generateToken(user)

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
      password: config.password
    }

    const createResponse = await AccountService.createUser(user)
    const createdUser = await createResponse.json()

    expect(createResponse.status).toBe(201)

    usersToDelete.push({
      userId: createdUser.userID,
      userName: user.userName,
      password: user.password
    })

    // Act — запрос токена с неправильным паролем
    const response = await AccountService.generateToken({
      userName: user.userName,
      password: 'WrongPassword!2026'
    })
    const body = await response.json()

    // Assert — проверки
    expect(response.status).toBe(200)
    expect(body.status).toBe('Failed')
    expect(body.result).toBe('User authorization failed.')
    expect(body.token).toBeNull()
    expect(body.expires).toBeNull()
  }, 15000)
  test('Authorized - Success', async () => {
    // Arrange — подготовка пользователя
    const user = {
      userName: `${config.userName}_authorized_${Date.now()}`,
      password: config.password
    }

    const createResponse = await AccountService.createUser(user)
    expect(createResponse.status).toBe(201)

    const createdUser = await createResponse.json()

    usersToDelete.push({
      userId: createdUser.userID,
      userName: user.userName,
      password: user.password
    })

    const tokenResponse = await AccountService.generateToken(user)
    expect(tokenResponse.status).toBe(200)

    const tokenBody = await tokenResponse.json()
    expect(tokenBody.status).toBe('Success')
    expect(tokenBody.token).toEqual(expect.any(String))
    expect(tokenBody.token).not.toBe('')

    // Act — проверка авторизации
    const response = await AccountService.authorized(user)

    // Assert — проверки
    expect(response.status).toBe(200)

    const body = await response.json()
    expect(body).toBe(true)
  }, 15000)
  test('Get User - Success', async () => {
    // Arrange — подготовка пользователя
    const user = {
      userName: `${config.userName}_get_${Date.now()}`,
      password: config.password
    }

    const createResponse = await AccountService.createUser(user)
    expect(createResponse.status).toBe(201)

    const createdUser = await createResponse.json()

    usersToDelete.push({
      userId: createdUser.userID,
      userName: user.userName,
      password: user.password
    })

    // Act — получение пользователя
    const response = await AccountService.getUser(createdUser.userID, user)

    // Assert — проверки
    expect(response.status).toBe(200)

    const body = await response.json()
    expect(body.userId).toBe(createdUser.userID)
    expect(body.username).toBe(user.userName)
    expect(body.books).toEqual([])
  }, 15000)
  test('Delete User - Success', async () => {
    // Arrange — подготовка пользователя
    const user = {
      userName: `${config.userName}_delete_${Date.now()}`,
      password: config.password
    }

    const createResponse = await AccountService.createUser(user)
    expect(createResponse.status).toBe(201)

    const createdUser = await createResponse.json()

    const cleanupUser = {
      userId: createdUser.userID,
      userName: user.userName,
      password: user.password
    }

    usersToDelete.push(cleanupUser)

    // Act — удаление пользователя
    const response = await AccountService.deleteUser(createdUser.userID, user)

    // Assert — проверки
    expect(response.status).toBe(204)

    // Пользователь уже удалён — повторная очистка не нужна
    usersToDelete.splice(usersToDelete.indexOf(cleanupUser), 1)

    expect(await response.text()).toBe('')
  }, 15000)

  afterAll(async () => {
    const cleanupErrors = []

    for (const user of usersToDelete) {
      try {
        const response = await AccountService.deleteUser(user.userId, user)

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
