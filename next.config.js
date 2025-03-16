if (process.env.NODE_ENV === 'development' && !require.resolve('ts-node')) {
  require('ts-node/register');
}
