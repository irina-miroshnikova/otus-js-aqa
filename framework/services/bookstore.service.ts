import config from '../config/config.ts'

const BookStoreService = {
  replaceBook(userId: string, oldIsbn: string, newIsbn: string, token: string) {
    const url = `${config.baseUrl}/BookStore/v1/Books/${encodeURIComponent(oldIsbn)}`

    return fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ userId, isbn: newIsbn })
    })
  },
  getBook(isbn: string) {
    const url = `${config.baseUrl}/BookStore/v1/Book?ISBN=${encodeURIComponent(isbn)}`

    return fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' }
    })
  },
  deleteBook(userId: string, isbn: string, token: string) {
    return fetch(`${config.baseUrl}/BookStore/v1/Book`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ userId, isbn })
    })
  },
  addBook(userId: string, isbn: string, token: string) {
    return fetch(`${config.baseUrl}/BookStore/v1/Books`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        userId,
        collectionOfIsbns: [{ isbn }]
      })
    })
  }
}

export default BookStoreService
