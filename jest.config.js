const testMatch = [/* '!',  */ '**/*.spec.ts'],
  coverageReporters = ['cobertura', 'html', 'text']

//This is an absolute hack which allows full debugging of tests, but causes code coverage to break.
if (process.env.DEBUG_TESTS === 'true') {
  testMatch.push('!')
  coverageReporters.length = 0
}

module.exports = {
  collectCoverage: true,
  collectCoverageFrom: ['**/*.{ts,vue}', '!**/node_modules/**', '!**/src/*'],
  coverageReporters,
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: './coverage',
        outputName: 'TEST-RESULTS.xml',
      },
    ],
  ],
  moduleFileExtensions: ['js', 'jsx', 'json', 'vue', 'ts', 'tsx'],
  transform: {
    '^.+\\.vue$': 'vue-jest',
    '.+\\.(css|styl|less|sass|scss|svg|png|jpg|ttf|woff|woff2)$':
      'jest-transform-stub',
    '^.+\\.tsx?$': 'ts-jest',
  },
  transformIgnorePatterns: ['/node_modules/'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  snapshotSerializers: ['jest-serializer-vue'],
  testMatch,
  testURL: 'http://localhost/',
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],
  globals: {
    'ts-jest': {
      babelConfig: true,
    },
  },
}
