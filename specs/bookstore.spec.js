import config from '../framework/config/config.js'
import AccountService from '../framework/services/account.service.js'
import BookStoreService from '../framework/services/bookstore.service.js'

describe('BookStore API', () => {
  test('Add Book - Success', async () => {
    // Arrange — создаём пользователя
    const isbn = '9781449325862'
    const user = {
      userName: `${config.userName}_add_book_${Date.now()}`,
      password: config.password
    }

    const createResponse = await AccountService.createUser(user)
    expect(createResponse.status).toBe(201)

    const { userID: userId } = await createResponse.json()

    try {
      // Arrange — получаем токен для работы с коллекцией
      const tokenResponse = await AccountService.generateToken(user)
      expect(tokenResponse.status).toBe(200)

      const tokenBody = await tokenResponse.json()
      expect(tokenBody.status).toBe('Success')
      expect(tokenBody.token).toEqual(expect.any(String))
      expect(tokenBody.token).not.toBe('')

      // Act — добавляем книгу
      const addResponse = await BookStoreService.addBook(userId, isbn, tokenBody.token)

      // Assert — проверяем ответ и читаем коллекцию из профиля
      expect(addResponse.status).toBe(201)

      const profileResponse = await AccountService.getUser(userId, user)
      expect(profileResponse.status).toBe(200)

      const profile = await profileResponse.json()
      const isbns = profile.books.map(book => book.isbn)
      expect(isbns).toContain(isbn)
    } finally {
      // Cleanup — удаляем тестового пользователя
      const cleanupResponse = await AccountService.deleteUser(userId, user)
      expect(cleanupResponse.status).toBe(204)
    }
  }, 30000)

  test('Replace Book - Success', async () => {
    // Arrange — готовим два ISBN и создаём пользователя
    const oldIsbn = '9781449325862'
    const newIsbn = '9781449331818'
    const user = {
      userName: `${config.userName}_replace_book_${Date.now()}`,
      password: config.password
    }

    const createResponse = await AccountService.createUser(user)
    expect(createResponse.status).toBe(201)

    const { userID: userId } = await createResponse.json()

    try {
      // Arrange — получаем токен и добавляем исходную книгу
      const tokenResponse = await AccountService.generateToken(user)
      expect(tokenResponse.status).toBe(200)

      const tokenBody = await tokenResponse.json()
      expect(tokenBody.status).toBe('Success')
      expect(tokenBody.token).toEqual(expect.any(String))
      expect(tokenBody.token).not.toBe('')

      const addResponse = await BookStoreService.addBook(userId, oldIsbn, tokenBody.token)
      expect(addResponse.status).toBe(201)

      // Act — заменяем исходную книгу новой
      const replaceResponse = await BookStoreService.replaceBook(userId, oldIsbn, newIsbn, tokenBody.token)

      // Assert — проверяем ответ и читаем коллекцию после замены
      expect(replaceResponse.status).toBe(200)

      const profileResponse = await AccountService.getUser(userId, user)
      expect(profileResponse.status).toBe(200)

      const profile = await profileResponse.json()
      const isbns = profile.books.map(book => book.isbn)
      expect(isbns).toEqual([newIsbn])
    } finally {
      // Cleanup — удаляем тестового пользователя
      const cleanupResponse = await AccountService.deleteUser(userId, user)
      expect(cleanupResponse.status).toBe(204)
    }
  }, 30000)
  test('Delete Book - Success', async () => {
    // Arrange — создаём пользователя
    const isbn = '9781449325862'
    const user = {
      userName: `${config.userName}_delete_book_${Date.now()}`,
      password: config.password
    }

    const createResponse = await AccountService.createUser(user)
    expect(createResponse.status).toBe(201)

    const { userID: userId } = await createResponse.json()

    try {
      // Arrange — получаем токен и добавляем книгу
      const tokenResponse = await AccountService.generateToken(user)
      expect(tokenResponse.status).toBe(200)

      const tokenBody = await tokenResponse.json()
      expect(tokenBody.status).toBe('Success')
      expect(tokenBody.token).toEqual(expect.any(String))
      expect(tokenBody.token).not.toBe('')

      const addResponse = await BookStoreService.addBook(userId, isbn, tokenBody.token)
      expect(addResponse.status).toBe(201)

      // Act — удаляем книгу из коллекции
      const deleteResponse = await BookStoreService.deleteBook(userId, isbn, tokenBody.token)

      // Assert — проверяем статус и коллекцию после удаления
      expect(deleteResponse.status).toBe(204)

      const profileResponse = await AccountService.getUser(userId, user)
      expect(profileResponse.status).toBe(200)

      const profile = await profileResponse.json()
      expect(profile.books).toEqual([])
    } finally {
      // Cleanup — удаляем тестового пользователя
      const cleanupResponse = await AccountService.deleteUser(userId, user)
      expect(cleanupResponse.status).toBe(204)
    }
  }, 30000)

  // Arrange — две пары ISBN и ожидаемого названия
  test.each([
    { isbn: '9781449325862', title: 'Git Pocket Guide' },
    { isbn: '9781449331818', title: 'Learning JavaScript Design Patterns' }
  ])(
    'Get Book - $isbn',
    async ({ isbn, title }) => {
      // Act — запрашиваем книгу по ISBN
      const response = await BookStoreService.getBook(isbn)

      // Assert — проверяем статус и данные книги
      expect(response.status).toBe(200)

      const book = await response.json()
      expect(book.isbn).toBe(isbn)
      expect(book.title).toBe(title)
    },
    15000
  )
})
