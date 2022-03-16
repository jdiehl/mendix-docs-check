const { dirname } = require('path')
const { writeFile } = require('fs').promises
const mkdirp = require('mkdirp')

const OUTPUT = './mobile/'

function appendSlash(x) {
  return x[x.length - 1] === '/' ? x : x + '/'
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
    const to =  OUTPUT + Page + '.md'
    const url = appendSlash('/refguide/mobile/' + Page.replace('_index', ''))
    const parent = appendSlash('/refguide/' + Parent)
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
    
    const head = [`title: ${Title}`, `url: ${url}`]
    if (Parent === '') {
      head.push('weight: 50')
      head.push('tags: ["studio pro"]')
      head.push('#If moving or renaming this doc file, implement a temporary redirect and let the respective team know they should update the URL in the product. See Mapping to Products for more details.')
    } else {
      head.push(parent !== '/refguide/mobile/' ? `parent: ${parent}` : `category: Mobile`)
      head.push(`weight: ${weights[Parent]}`)
      for (const description of descriptions) {
        head.push(`description: ${description}`)
      }
      if (tags.length > 0) head.push(JSON.stringify([...tags]))
    }

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

  // create MAPPING
  await writeFile(OUTPUT + '_MAPPING.TXT', 'There are document files in this folder that are mapped to the product. Refer to Mapping to Products for the names of these files and how to proceed.')
}
