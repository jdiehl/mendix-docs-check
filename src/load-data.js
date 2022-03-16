const { parseFile } = require('fast-csv')

exports.loadData = async function loadData(file) {
  return new Promise((resolve, reject) => {
    const data = []
    parseFile(file, { headers: true, delimiter: '\t' })
    .on('data', row => data.push(row))
    .on('error', err => reject(err))
    .on('end', () => resolve(data))
  })
}
