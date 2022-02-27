module.exports = async () => {
  return {
    verbose: true,
    testPathIgnorePatterns: ['cdk'],
    transform: {
      '^.+\\.js?$': 'esbuild-jest',
    }
  }
}
