export const get = async (_event, _context) => {
  return {
    statusCode: 200,
    body: JSON.stringify({ statusCode: 200, msg: 'Hello world' }),
  }
}
