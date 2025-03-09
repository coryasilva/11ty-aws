import cf from 'cloudfront';
const canonicalHost = 'CANONICAL_HOST'; // Injected at CDK build; props.domainName
const kvsId = 'KEY_VALUE_STORE_ID_PLACEHOLDER'; // Injected at CDK build time.
const kvs = cf.kvs(kvsId);

async function handler(event) {
  const request = event.request;
  const host = request.headers.host.value;
  const uriHasPeriod = request.uri.includes('.');

  // Redirect to canonical hostname
  if (host !== canonicalHost) {
    return {
      statusCode: 301,
      statusDescription: 'Found',
      headers: {
        location: { value: `https://${canonicalHost}${request.uri}` },
        'cache-control': { value: 'max-age=300, s-maxage=86400' },
      },
    };
  }

  // Do not modify requests to api (file extension okay here)
  if (request.uri.startsWith('/api/') || request.uri === '/api') {
    return request;
  }

  // Force canonical trailing slash (if not a file)
  if (!uriHasPeriod && !request.uri.endsWith('/')) {
    return {
      statusCode: 301,
      statusDescription: 'Found',
      headers: {
        location: { value: `https://${canonicalHost}${request.uri}/` },
        'cache-control': { value: 'max-age=300, s-maxage=86400' },
      },
    };
  }

  // Force canonical paths
  if (request.uri.endsWith('/index.html')) {
    return {
      statusCode: 301,
      statusDescription: 'Found',
      headers: {
        location: {
          value: `https://${canonicalHost}${request.uri.substring(0, request.uri.length - 11)}/`,
        },
        'cache-control': { value: 'max-age=300, s-maxage=86400' },
      },
    };
  }

  // Redirect if exists in kv
  if (request.uri !== '/') {
    try {
      const redirect = await kvs.get(request.uri);
      if (redirect) {
        console.log(`Redirect found: ${request.uri} -> ${redirect}`);
        return {
          statusCode: '301',
          statusDescription: 'Found',
          headers: {
            location: { value: redirect },
          },
        };
      }
    } catch (error) {
      console.log(`Error when fetching key ${request.uri}: ${error}`);
    }
  }

  if (!uriHasPeriod) {
    request.uri += 'index.html';
  }

  return request;
}
