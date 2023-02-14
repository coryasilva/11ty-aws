import { awsCloudfrontTestFunction } from './test-objects/aws-test-util'

const functionName = 'GeoSyntaxComStaticRewrite'

describe('Static rewrite cloudfront function', () => {
  jest.setTimeout(30000)
  it('should not change /api/contact.json', async () => {
    const test = await awsCloudfrontTestFunction(functionName, 'rewrite-api-contact-file.json')
    expect(test.output.request.uri).toMatch(test.object.request.uri)
  })

  it('should not change /api/contact', async () => {
    const test = await awsCloudfrontTestFunction(functionName, 'rewrite-api-contact.json')
    expect(test.output.request.uri).toMatch(test.object.request.uri)
  })

  it('should not change /api/', async () => {
    const test = await awsCloudfrontTestFunction(functionName, 'rewrite-api-slash.json')
    expect(test.output.request.uri).toMatch(test.object.request.uri)
  })

  it('should not change /api', async () => {
    const test = await awsCloudfrontTestFunction(functionName, 'rewrite-api.json')
    expect(test.output.request.uri).toMatch(test.object.request.uri)
  })

  it('should not change /assets/main.bundle.js', async () => {
    const test = await awsCloudfrontTestFunction(functionName, 'rewrite-assets-js-file.json')
    expect(test.output.request.uri).toMatch(test.object.request.uri)
  })

  it('should not change /page.html', async () => {
    const test = await awsCloudfrontTestFunction(functionName, 'rewrite-page-file.json')
    expect(test.output.request.uri).toMatch(test.object.request.uri)
  })

  it('should not change /page/index.html', async () => {
    const test = await awsCloudfrontTestFunction(functionName, 'rewrite-page-index-file.json')
    expect(test.output.request.uri).toMatch(test.object.request.uri)
  })

  it('should change /page/ --> /page/index.html', async () => {
    const test = await awsCloudfrontTestFunction(functionName, 'rewrite-page-slash.json')
    expect(test.output.request.uri).toMatch(test.object.request.uri + 'index.html')
  })

  it('should change /page --> /page/index.html', async () => {
    const test = await awsCloudfrontTestFunction(functionName, 'rewrite-page.json')
    expect(test.output.request.uri).toMatch(test.object.request.uri + '/index.html')
  })

  it('should change / --> /index.html', async () => {
    const test = await awsCloudfrontTestFunction(functionName, 'rewrite-root.json')
    expect(test.output.request.uri).toMatch(test.object.request.uri + 'index.html')
  })
})
