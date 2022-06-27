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
    logger.error(`Invalid Doc Header: ${file} ${err.message}`)
    res.header = {}
    res.error = err
  }

  // extract body
  res.content = content.join('')

  return res
}

// load all docs in a folder
exports.make = async (dir) => {
  const files = await glob(dir + '**/*.md')
  for (const file of files) {
    // parse and store the doc
    const doc = await loadDoc(file)
    exports.docs.push(doc)

    // update the index
    if (doc.header.url) {
      const url = doc.header.url.replace(/\/$/, '')
      if (exports.index[url]) {
        if (exports.index[url].alias) {
          logger.error(`Duplicate Alias URL: ${url} (${doc.file}, ${exports.index[url].file})`)
        } else {
          logger.error(`Duplicate URL: ${url} (${doc.file}, ${exports.index[url].file})`)
          continue
        }
      }

      // set the doc to the url
      exports.index[url] = doc

      // set the alias urls
      if (doc.header.aliases) {
        for (const alias of doc.header.aliases) {
          const aliasUrl = alias.replace(/\/$/, '')
          if (exports.index[aliasUrl]) {
            logger.warn(`Duplicate Alias URL: ${url} (${doc.file}, ${exports.index[aliasUrl].file})`)
            continue
          }
          exports.index[aliasUrl] = { file: doc.file, url: aliasUrl, alias: doc }
        }
      }
    } else {
      logger.warn(`Doc without URL: ${doc.file}`)
    }
  }
  return exports
}

exports.docs = []
exports.index = {}
