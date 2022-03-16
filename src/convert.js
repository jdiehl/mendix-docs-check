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
  let weight = 0
  const index = makeUrlIndex(docs)
  for ({ Source, Page, Parent, Title } of data) {
    weight += 10
    const to =  './output/' + Page + '.md'
    let descriptions = [], tags = new Set()

    // create directory
    const dir = dirname(to)
    await mkdirp(dir)

    // collect source files
    let body = []
    for (url of Source.split('\n')) {
      if (!url) continue
      const doc = findDoc(index, url)
      body.push('')
      body.push(`>>>>> ${doc.file.substring(7)}`)
      body.push(doc.body)

      // update description & tags
      if (doc.header.description) descriptions.push(doc.header.description)
      if (doc.header.tags) doc.header.tags.forEach(tag => tags.add(tag))
    }

    const head = [
      `title: ${Title}`,
      `url: /refguide/mobile/${Page}`,
      Parent ? `parent: /refguide/${Parent}` : `category: Mobile`,
      `weight: ${weight}`
    ].concat(descriptions.map(d => `description: ${d}`))
    if (tags.length > 0) head.push(JSON.stringify([...tags]))

    const contents = [
      '---',
      ...head,
      '---',
      ...body
    ]

    // write file
    await writeFile(to, contents.join('\n'))
  }
}
