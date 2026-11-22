export default {
  testEnvironment: 'node',
  transform: {
    '^.+\\.js$': 'babel-jest'
  },
  clearMocks: true,
  reporters: ['default', ['jest-html-reporters', { publicPath: './reports', filename: 'report.html' }]]
}
