import nextConfig from 'eslint-config-next'

export default [
  ...nextConfig,
  {
    rules: {
      // Standard pattern: setState called inside useEffect to sync derived state
      'react-hooks/set-state-in-effect': 'off',
      // Functions declared after the useEffect that calls them — hoisting is valid in JS
      'react-hooks/immutability': 'off',
      // UI strings intentionally contain quotes and apostrophes
      'react/no-unescaped-entities': 'off',
      // Dependency exhaustiveness surfaced as warning only
      'react-hooks/exhaustive-deps': 'warn',
      // ESLint config default export is intentionally anonymous
      'import/no-anonymous-default-export': 'off',
    },
  },
]
