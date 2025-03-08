const { readFileSync } = require('fs')
const path = require('path')

// Not dealing with jests ESM crap for this...
const viewerRequestCode = readFileSync(path.join(__dirname, './viewer-request.js')).toString()

const mockCf = `
const cf = {
  kvs:() => ({
    get: async (key) => ['/redirect/test/', '/'].includes(key) 
    ? 'https://domain.local/redirect/test/assertion/' 
    : undefined
  })
};
`

function viewerReqest(event) {
  eval(viewerRequestCode.replace(
    /^\s*import cf from 'cloudfront'.*$/im,
    mockCf,
  ))

  return handler(event)
}

describe('Viewer-request cloudfront function', () => {
  let mock;

  beforeEach(() => {
    mock = JSON.parse(JSON.stringify({
      request: {
        uri: "/",
        headers: {
          host: { value: "CANONICAL_HOST" },
        },
      }
    }))
  })

  it('should not change API and file uri', async () => {
    mock.request.uri = '/api/contact.json'
    expect((await viewerReqest(mock)).uri).toBe(mock.request.uri);
    mock.request.uri = '/api/contact'
    expect((await viewerReqest(mock)).uri).toBe(mock.request.uri);
    mock.request.uri = '/api/'
    expect((await viewerReqest(mock)).uri).toBe(mock.request.uri);
    mock.request.uri = '/api'
    expect((await viewerReqest(mock)).uri).toBe(mock.request.uri);
    mock.request.uri = '/assets/main.bundle.js'
    expect((await viewerReqest(mock)).uri).toBe(mock.request.uri);
    mock.request.uri = '/page.html'
    expect((await viewerReqest(mock)).uri).toBe(mock.request.uri);

  })

  it('should redirect to canonical url', async () => {
    mock.request.uri = '/page/index.html'
    expect((await viewerReqest(mock)).headers.location.value).toBe('https://CANONICAL_HOST/page/');
    mock.request.uri = '/page'
    expect((await viewerReqest(mock)).headers.location.value).toBe('https://CANONICAL_HOST/page/');
    mock.request.uri = '/page/'
    mock.request.headers.host.value = 'blah'
    expect((await viewerReqest(mock)).headers.location.value).toBe('https://CANONICAL_HOST/page/');
  })

  it('should redirect from KV store', async () => {
    mock.request.uri = '/redirect/test/'
    expect((await viewerReqest(mock)).headers.location.value).toBe('https://domain.local/redirect/test/assertion/');
  })

  it('should rewrite pages', async () => {
    mock.request.uri = '/'
    expect((await viewerReqest(mock)).uri).toBe('/index.html');
    mock.request.uri = '/page/'
    expect((await viewerReqest(mock)).uri).toBe('/page/index.html');
  })
})
