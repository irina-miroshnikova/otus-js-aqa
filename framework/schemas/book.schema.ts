const bookSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    isbn: { type: 'string' },
    title: { type: 'string' },
    subTitle: { type: 'string' },
    author: { type: 'string' },
    publish_date: { type: 'string', format: 'date-time' },
    publisher: { type: 'string' },
    pages: { type: 'number' },
    description: { type: 'string' },
    website: { type: 'string' }
  }
}

export default bookSchema
