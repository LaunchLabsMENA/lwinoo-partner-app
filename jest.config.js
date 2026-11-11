module.exports = {
  preset: '@react-native/jest-preset',
  testTimeout: 30000,
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|@react-navigation|react-native-.*|react-redux|@reduxjs|redux|redux-thunk|reselect|immer|axios)/)',
  ],
};
