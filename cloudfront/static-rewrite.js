import cf from 'cloudfront';
const kvsId = 'KEY_VALUE_STORE_ID_PLACEHOLDER'; // Injected at CDK build time.
const kvs = cf.kvs(kvsId);

// This should be the canonical domain name. ex: www.mysite.com
const canonicalHost = '11ty-aws.corysilva.com';
// This could be the naked apex. ex: mysite.com
const redirectHost = 'corysilva.com';

function isHost(headers, host) {
  if (headers.host && headers.host.value === host) {
    return true;
  }
  if (headers.host && headers.host.multiValue) {
    return headers.host.multiValue.some(entry => entry.value === host);
  }
  return false;
}

function isCloudFrontHost(headers) {
  if (headers.host && headers.host.value.includes('cloudfront')) {
    return true;
  }
  else if (headers.host && headers.host.multiValue) {
    return headers.host.multiValue.some(entry => entry.value.includes('cloudfront'));
  }
  return false;
}

async function handler(event) {
  const request = event.request;
  const headers = request.headers || {}
  const uriOrig = request.uri;
  const uriHasPeriod = uri.includes('.');

  // Do not allow access via default cloudfront hostname
  if (isCloudFrontHost(headers)) {
    return {
      statusCode: 404,
      statusDescription: 'Page not found',
      headers: {
        'content-type': { value: 'text/plain; charset=UTF-8' }
      }
    }
  }

  // Redirect to canonical hostname
  if (isHost(headers, redirectHost)) {
    return {
      statusCode: 301,
      statusDescription: 'Found',
      headers: {
        'location': { value: `https://${canonicalHost}${request.uri}` },
        'cache-control': { value: 'max-age=300, s-maxage=86400' }
      }
    }
  }

  // Do not modify requests to api (file extension okay here)
  if (uriOrig.startsWith('/api/') || uriOrig === '/api') {
    return request;
  }

  // Normalize uri to ending slash (if not a file)
  if (!uriHasPeriod && !uriOrig.endsWith('/')) {
    request.uri += '/';
  }

  // Redirect if exists in kv
  if (request.uri !== '/') {
    try {
      const redirect = await kvs.get(request.uri);
      console.log(`Redirect found: ${request.uri} -> ${redirect}`);
      return {
        statusCode: '301',
        statusDescription: 'Found',
        headers: {
          location: { value: redirect }
        }
      };
    } catch (error) {
      console.log(`Error when fetching key ${request.uri}: ${error}`);
    }
  }

  if (!uriHasPeriod) {
    request.uri += 'index.html';
  }

  return request
}
