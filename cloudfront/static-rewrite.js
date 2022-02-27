var redirectMap = {
  // '/lowercase/with/slash/': ['/lower/case/with/slash/', 301 ],
}

// This should be the canonical domain name. ex: www.mysite.com
var canonicalHost = '11ty-aws.corysilva.com'
// This could be the naked apex. ex: mysite.com
var redirectHost = 'corysilva.com'

function isHost(headers, host) {
  if (headers['host'] && headers['host'].value === host) {
    return true;
  }
  if (headers['host'] && headers['host'].multiValue) {
    return headers['host'].multiValue.some(entry => entry.value === host);
  }
  return false;
}

function isCloudFrontHost(headers) {
  if (headers['host'] && headers['host'].value.includes('cloudfront')) {
    return true;
  }
  else if (headers['host'] && headers['host'].multiValue) {
    return headers['host'].multiValue.some(entry => entry.value.includes('cloudfront'));
  }
  return false;
}

function handler(event) {
  var clientIP = event.viewer.ip;
  var request = event.request;
  var headers = request.headers || {}
  var uri = request.uri;
  var uriHasPeriod = uri.includes('.');

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

  // Add the true-client-ip header to the incoming request
  request.headers['x-real-client-ip'] = { value: clientIP };

  // Do not modify requests to api (file extension okay here)
  if (uri.startsWith('/api/') || uri === '/api') {
    return request;
  }

  // Normalize uri to ending slash (if not a file)
  if (!uriHasPeriod && !uri.endsWith('/')) {
    request.uri += '/';
  }

  // Redirect if exists in map
  var redirect = redirectMap[uri];
  if (redirect && redirect.length === 2) {
    return {
      statusCode: redirect[1],
      statusDescription: 'Found',
      headers: {
        'location': { 'value': redirect[0] }
      }
    };
  }

  if (!uriHasPeriod) {
    request.uri += 'index.html';
  }

  return request
}
