# Cloudfront function

This runs in a very curated runtime; please review the [JS requirements](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/functions-javascript-runtime-features.html).

*Not to be confused with Lambda@Edge functions which cost 6x more money and 2x more latency.*

## Testing

Testing is a bit interesting, we must deploy first or test using the aws console.

### From Jest

`test-objects/aws-test-util.js` contains a wrapper for the aws-cli so we can get results.

### From AWS CLI
```sh
# For more information
aws cloudfront test-function help

# The test
# https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/test-function.html
aws cloudfront test-function \
--if-match EXXXXXXXXXXXX \
--name GeoSyntaxComStaticRewrite \
--event-object fileb://cloudfront/test-objects/rewrite.json
```

### *-header.js test cases

These tests just use the generic `headers-response-event.json`.

### static-rewrite.js test cases

The function is rather ugly but optimized for throughput.

| test-object                   | test request uri       | expected request uri rewrite
|-------------------------------|------------------------|-----------------------------
| rewrite-api-contact-file.json | /api/contact.json      | /api/people.json
| rewrite-api-contact.json      | /api/contact           | /api/contact
| rewrite-api-slash.json        | /api/                  | /api/
| rewrite-api.json              | /api                   | /api
| rewrite-assets-js-file.json   | /assets/main.bundle.js | /assets/image.jpg
| rewrite-page-file.json        | /page.html             | /page.html
| rewrite-page-index-file.json  | /page/index.html       | /page/index.html/index.html
| rewrite-page-slash.json       | /page/                 | /page/index.html
| rewrite-page.json             | /page                  | /page/index.html
| rewrite-root.json             | /                      | /index.html
