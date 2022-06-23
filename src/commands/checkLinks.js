const { writeFileSync } = require('fs')
const { make } = require('../lib/docsIndex')

exports.checkLinks = async () => {
  const index = await make('content/')
  writeFileSync('docs.json', JSON.stringify(index))
}
