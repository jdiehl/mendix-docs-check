const { dirname } = require('path')
const { writeFile } = require('fs').promises
const mkdirp = require('mkdirp')

function fileToURL(file) {
  return ''
}

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
  let weights = {}
  const index = makeUrlIndex(docs)
  for ({ Source, Page, Parent, Title } of data) {
    weights[Parent] ? weights[Parent] += 10 : weights[Parent] = 10
    const to =  './output/' + Page + '.md'
    const url = `/refguide/mobile/${Page.replace('/_index', '')}/`
    const descriptions = [], tags = new Set(), aliases = []

    // create directory
    const dir = dirname(to)
    await mkdirp(dir)

    // collect source files
    let body = []
    for (src of Source.split('\n')) {
      if (!src) continue
      const doc = findDoc(index, src)
      body.push('')
      body.push(`>>>>> ${doc.file.substring(23)}`)
      body.push(doc.body)

      // update description & tags
      if (doc.header.description) descriptions.push(doc.header.description)
      if (doc.header.tags) doc.header.tags.forEach(tag => tags.add(tag))
      if (doc.header.url !== url) aliases.push(doc.header.url)
    }

    const head = [
      `title: ${Title}`,
      `url: ${url}`,
      Parent !== 'mobile' ? `parent: /refguide/${Parent}/` : `category: Mobile`,
      `weight: ${weights[Parent]}`
    ].concat(descriptions.map(d => `description: ${d}`))
    if (tags.length > 0) head.push(JSON.stringify([...tags]))

    // aliases
    if (aliases.length > 0) {
      head.push('aliases:')
      for (const alias of aliases) {
        head.push( `    - ${alias}`)
      }
    }

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
