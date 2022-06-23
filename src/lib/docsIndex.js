const { readFile } = require('fs').promises
const { promisify } = require('util')

const glob = promisify(require('glob'))
const yaml = require('yaml')

const logger = require('./logger')

// load and parse a document
async function loadDoc(file) {
  const buf = await readFile(file)
  const content = buf.toString().split('---')
  const res = { file }

  // extract header
  content.shift()
  try {
    res.header = yaml.parse(content.shift())
  } catch (err) {
    res.header = {}
    res.error = err
  }

  // extract body
  res.body = content.join('')

  return res
}

// load all docs in a folder
exports.make = async (dir) => {
  const files = await glob(dir + '**/*.md')
  for (const file of files) {
    const doc = await loadDoc(file)
    const { url } = doc.header
    if (url) {
      if (exports.index[url]) {
        logger.error(`Duplicate URL: ${url} (${doc.file}, ${exports.index[url].file})`)
      }
      exports.index[url] = doc
    } else {
      logger.warn(`Doc without URL: ${doc.file}`)
    }
  }
  return exports.index
}

exports.index = {}
