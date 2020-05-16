# WebFaas - Server - AWS Lambda
WebFaaS Server AWS for [node](http://nodejs.org).

[![NPM Version][npm-image]][npm-url]
[![Linux Build][travis-image]][travis-url]
[![Test Coverage][coveralls-image]][coveralls-url]

### Example
```shell
curl -XPOST https://xxx.execute-api.us-east-1.amazonaws.com/prod/@webfaaslabs/math:sum/1.0.0 -H "x-api-key: yyy" -H "content-type: application/json" -d '{"x":2,"y":3}' -v
```
## License

[MIT](LICENSE)

[npm-image]: https://img.shields.io/npm/v/@webfaas/webfaas-server-aws.svg
[npm-url]: https://npmjs.org/package/@webfaas/webfaas-server-aws

[travis-image]: https://img.shields.io/travis/webfaas/webfaas-server-aws/master.svg?label=linux
[travis-url]: https://travis-ci.org/webfaas/webfaas-server-aws

[coveralls-image]: https://img.shields.io/coveralls/github/webfaas/webfaas-server-aws/master.svg
[coveralls-url]: https://coveralls.io/github/webfaas/webfaas-server-aws?branch=master