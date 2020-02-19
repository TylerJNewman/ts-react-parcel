// module.exports = {
//   roots: ['<rootDir>/src'],
//   transform: {
//     '\\.(ts|tsx)?$': 'babel-jest',
//   },
//   testMatch: ['<rootDir>/src/**/(*.)spec.{ts,tsx}'], // looks for your test
//   moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
//   testPathIgnorePatterns: ['/node_modules/', '/public/'],
//   preset: 'ts-jest',
//   testEnvironment: 'jsdom',
//   globals: {
//     // we must specify a custom tsconfig for tests because we need the typescript transform
//     // to transform jsx into js rather than leaving it jsx such as the next build requires.  you
//     // can see this setting in tsconfig.jest.json -> "jsx": "react"
//     'ts-jest': {
//       tsConfig: 'tsconfig.jest.json',
//     },
//   },
// };

module.exports = {
  // The root of your source code, typically /src
  // `<rootDir>` is a token Jest substitutes
  roots: ['<rootDir>/src'],

  // Jest transformations -- this adds support for TypeScript
  // using ts-jest
  transform: {
    '^.+\\.(js|tsx|ts)?$': 'ts-jest',
  },

  // Runs special logic, such as cleaning up components
  // when using React Testing Library and adds special
  // extended assertions to Jest
  setupFilesAfterEnv: [
    '@testing-library/jest-dom/extend-expect',
    'jest-extended',
  ],

  // Test spec file resolution pattern
  // Matches parent folder `__tests__` and filename
  // should contain `test` or `spec`.
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$',

  // Module file extensions for importing
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
    '\\.(css|less|scss|sss|styl)$': '<rootDir>/node_modules/jest-css-modules',
  },
};

// module.exports = {
//   preset: 'ts-jest',
//   testEnvironment: 'node',
//   globals: {
//     // we must specify a custom tsconfig for tests because we need the typescript transform
//     // to transform jsx into js rather than leaving it jsx such as the next build requires.  you
//     // can see this setting in tsconfig.jest.json -> "jsx": "react"
//     'ts-jest': {
//       tsConfig: 'tsconfig.jest.json',
//     },
//   },
// };
