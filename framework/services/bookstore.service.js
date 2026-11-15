import config from '../config/config.js'

const BookStoreService = {
  replaceBook(userId, oldIsbn, newIsbn, token) {
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
  getBook(isbn) {
    const url = `${config.baseUrl}/BookStore/v1/Book?ISBN=${encodeURIComponent(isbn)}`

    return fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' }
    })
  },
  deleteBook(userId, isbn, token) {
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
  addBook(userId, isbn, token) {
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
