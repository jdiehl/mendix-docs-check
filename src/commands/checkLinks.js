const { existsSync, writeFileSync } = require('fs')

const { make } = require('../lib/docsIndex')
const logger = require('../lib/logger')

// find all links in a document
function getLinks(doc) {
  // remove code blocks
  let content = doc.content.replace(/```[^`]+```/g, '').replace(/`[^`]+`/g, '')

  // extract links
  const regex = /\[([^\]]*)\]\(([^)]+)\)/g
  const links = []
  // eslint-disable-next-line no-cond-assign
  for (let match; match = regex.exec(content);) {
    links.push({ match: match[0], text: match[1], url: match[2], index: match.index })
    content = content.slice(match.index + match[0].length, content.length)
  }
  return links
}

exports.checkLinks = async () => {
  const { docs, index } = await make('content/')
  for (const doc of docs) {
    const links = getLinks(doc)

    // check links
    for (const link of links) {
      // simplify linkUrl
      // TODO: also check anchors
      const linkUrl = link.url.replace(/#.*$/, '').replace(/\/$/, '')
      if (linkUrl.length === 0) continue

      // ignore external links
      // TODO: check external links
      if (linkUrl.indexOf('://') >= 0) continue

      // ignore mail links
      if (linkUrl.substring(0, 7) === 'mailto:') continue

      // check static content
      if (existsSync('static/' + linkUrl)) continue

      // check docs
      const linkDoc = index[linkUrl]
      if (!linkDoc) {
        logger.warn(`Link not found: ${doc.file} [${link.text}](${link.url})`)
      } else if (linkDoc.alias) {
        logger.warn(`Link to alias: ${doc.file}:${link.index} [${link.text}](${link.url}), Original: ${linkDoc.alias.header.url}`)
      }
    }
  }
}
