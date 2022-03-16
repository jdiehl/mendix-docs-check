const { dirname } = require('path')
const { writeFile } = require('fs').promises
const mkdirp = require('mkdirp')

function makeUrlIndex(docs) {
  const index = {}
  for (const doc of docs) {
    let { url } = doc.header
    if (!url) throw new Error(`Invalid doc: ${doc.file}`)
    if (url[0] === '/') url = url.substr(1)
    if (url[url.length - 1] === '/') url = url.substr(0, url.length - 1)
    index[url] = doc
  }
  return index
}

function findDoc(index, url) {
  const doc = index[url.substr(24)]
  if (!doc) throw new Error(`Could not find doc for url: ${url}`)
  return doc
}

exports.convert = async function convert(DOCS, docs, data) {
  const index = makeUrlIndex(docs)
  for ({ Source, Page, Parent, Title } of data) {
    const to =  './output/' + Page + '.md'

    // create directory
    const dir = dirname(to)
    await mkdirp(dir)

    // collect source files
    let content = []
    for (url of Source.split('\n')) {
      if (!url) continue
      const doc = findDoc(index, url)
      content.push(doc.body)
    }

    // write file
    await writeFile(to, content.join('\n\n\n\n>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> MERGED <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<\n\n\n\n'))
  }
}

