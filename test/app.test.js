import { describe, test, expect } from '@jest/globals'
import { fullTrim, nameIsValid, getTotal } from '../src/app.js'

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
describe('nameIsValid', () => {
  // Arrange — наборы входных данных и ожидаемых результатов
  const cases = [
    { name: 'ab', expected: true },
    { name: 'a', expected: false },
    { name: 'Ab', expected: false },
    { name: 'ирина', expected: false },
    { name: 123, expected: false },
    { name: null, expected: false }
  ]

  test.each(cases)('для имени $name возвращает $expected', ({ name, expected }) => {
    // Act
    const result = nameIsValid(name)

    // Assert
    expect(result).toBe(expected)
  })
})
describe('getTotal', () => {
  test('суммирует стоимость нескольких товаров с учётом количества', () => {
    // Arrange
    const items = [
      { price: 100, quantity: 2 },
      { price: 50, quantity: 3 }
    ]
    const expected = 350

    // Act
    const result = getTotal(items)

    // Assert
    expect(result).toBe(expected)
  })

  test('применяет скидку к сумме заказа', () => {
    // Arrange
    const items = [{ price: 100, quantity: 2 }]
    const discount = 10
    const expected = 180

    // Act
    const result = getTotal(items, discount)

    // Assert
    expect(result).toBe(expected)
  })

  test('возвращает ноль при вызове без аргументов', () => {
    // Arrange
    const expected = 0

    // Act
    const result = getTotal()

    // Assert
    expect(result).toBe(expected)
  })
})
describe('getTotal — проверка скидки', () => {
  test('выбрасывает ошибку, если скидка передана строкой', () => {
    // Arrange
    const items = [{ price: 100, quantity: 2 }]
    const discount = '10'

    // Act + Assert
    expect(() => getTotal(items, discount)).toThrow('Скидка должна быть числом')
  })

  test('выбрасывает ошибку при отрицательной скидке', () => {
    // Arrange
    const items = [{ price: 100, quantity: 2 }]
    const discount = -1

    // Act + Assert
    expect(() => getTotal(items, discount)).toThrow('Процент скидки должен быть от 0 до 99')
  })

  test('выбрасывает ошибку при скидке 100 процентов', () => {
    // Arrange
    const items = [{ price: 100, quantity: 2 }]
    const discount = 100

    // Act + Assert
    expect(() => getTotal(items, discount)).toThrow('Процент скидки должен быть от 0 до 99')
  })
})
