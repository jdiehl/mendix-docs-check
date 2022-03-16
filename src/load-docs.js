const { readFile } = require('fs').promises
const glob = require("glob")

async function loadDoc(file) {
  const buf = await readFile(file)
  const body = buf.toString()
  const content = body.split('\n')
  if (content.shift().trim() !== '---') throw new Error(`Invalid doc: ${file}`)
  
  const header = {}

  while (content.length > 0 && content[0].trim() !== '---') {
    [key, value] = content.shift().trim().split(/ *: */)
    if (key) header[key] = value
  }

  if (content.length === 0) throw new Error(`Invalid doc: ${file}`)

  return { file, header, body }
}

async function loadDir(dir) {
  return new Promise((resolve, reject) => {
    const docs = []
    glob(dir + '**/*.md', async (err, files) => {
      if (err) return reject(err)
      const docs = []
      for (const file of files) {
        try {
          const doc = await loadDoc(file)
          docs.push(doc)
        } catch (err) {
          return reject(err)
        }
      }
      resolve(docs)
    })

  })
}

exports.loadDocs = async function loadDocs(dirs) {
  let docs = []
  for (const dir of dirs) {
    const moreDocs = await loadDir(dir)
    docs = docs.concat(moreDocs)
  }
  return docs
}
