export const GetConfig = function() {
  return {
    AuthSecret: process.env.AUTH_SECRET || 'secret'
  }
}