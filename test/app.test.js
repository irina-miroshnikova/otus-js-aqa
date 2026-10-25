import { describe, test, expect } from '@jest/globals'
import { fullTrim } from '../src/app.js'

describe('fullTrim', () => {
  test('удаляет пробелы в начале, внутри и в конце строки', () => {
    // Arrange
    const text = ' hello world '
    const expected = 'helloworld'

    // Act
    const result = fullTrim(text)

    // Assert
    expect(result).toBe(expected)
  })

  test('удаляет табуляцию и перенос строки', () => {
    // Arrange
    const text = '\thello\nworld\t'
    const expected = 'helloworld'

    // Act
    const result = fullTrim(text)

    // Assert
    expect(result).toBe(expected)
  })

  test('возвращает пустую строку для null', () => {
    // Arrange
    const text = null
    const expected = ''

    // Act
    const result = fullTrim(text)

    // Assert
    expect(result).toBe(expected)
  })
})
