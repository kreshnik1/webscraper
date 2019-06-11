'use strict'

var request = require('request')

module.exports = {
  fetch: fetch
}

function fetch (url) {
  return new Promise(function (resolve, reject) {
    request(url, function (error, response, html) {
      if (error) {
        return reject(error)
      }
      if (response.statusCode !== 200) {
        return reject(new Error(' Bad status code from server'))
      }
      resolve(html)
    })
  })
}
