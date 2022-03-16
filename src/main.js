const { convert } = require('./convert')
const { loadDocs } = require('./load-docs')
const { loadData } = require('./load-data')

exports.main = async function main(DOCS, DATA) {
  const docs = await loadDocs([DOCS + 'howto/mobile/', DOCS + 'refguide/mobile/'])
  const data = await loadData(DATA)
  await convert(DOCS, docs, data)
}
