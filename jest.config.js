export default {
  testEnvironment: 'node',
  transform: {
    '^.+\\.[jt]s$': 'babel-jest'
  },
  clearMocks: true,
  reporters: ['default', ['jest-html-reporters', { publicPath: './reports', filename: 'report.html' }]]
}
