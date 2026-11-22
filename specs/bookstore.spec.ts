import { describe, expect, test } from '@jest/globals'
import config from '../framework/config/config.ts'
import bookSchema from '../framework/schemas/book.schema.ts'
import AccountService from '../framework/services/account.service.ts'
import BookStoreService from '../framework/services/bookstore.service.ts'
import Ajv from 'ajv'
import addFormats from 'ajv-formats'
type UserProfile = {
  books: { isbn: string }[]
}
const ajv = new Ajv()
addFormats(ajv)
const validateBook = ajv.compile(bookSchema)

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

      const profile: UserProfile = await profileResponse.json()
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

      const profile: UserProfile = await profileResponse.json()
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
      const isValid = validateBook(book)
      expect(isValid).toBe(true)
      expect(book.isbn).toBe(isbn)
      expect(book.title).toBe(title)
    },
    15000
  )
  test.each([
    { field: 'pages', value: '234', keyword: 'type' },
    { field: 'publish_date', value: 'not-a-date', keyword: 'format' }
  ])('Book response schema rejects invalid $field', ({ field, value, keyword }) => {
    const invalidBook = { isbn: '9781449325862', title: 'Git Pocket Guide', [field]: value }

    expect(validateBook(invalidBook)).toBe(false)
    expect(validateBook.errors).toMatchObject([{ instancePath: `/${field}`, keyword }])
  })
  test('Book response schema rejects additional properties', () => {
    const invalidBook = {
      isbn: '9781449325862',
      title: 'Git Pocket Guide',
      rating: 5
    }

    expect(validateBook(invalidBook)).toBe(false)
    expect(validateBook.errors).toMatchObject([
      {
        keyword: 'additionalProperties',
        params: { additionalProperty: 'rating' }
      }
    ])
  })
})
