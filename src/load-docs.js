const { readFile, writeFile } = require('fs').promises
const { fstat } = require('fs')
const glob = require("glob")

async function loadDoc(file) {
  const buf = await readFile(file)
  const content = buf.toString().split('\n')
  if (content.shift().trim() !== '---') throw new Error(`Invalid doc: ${file}`)
  
  const header = {}

  while (content.length > 0 && content[0].trim() !== '---') {
    const line = content.shift()
    const i = line.indexOf(':')
    const key = line.substring(0, i).trim()
    let value = line.substring(i + 1).trim()
    if (value && (value[0] === '"' || value[0] === '[')) value = JSON.parse(value)
    if (key) header[key] = value
  }
  content.shift()
  if (content.length === 0) throw new Error(`Invalid doc: ${file}`)

  const body = content.join('\n')

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
  try {
    const buf = await readFile('./docs.json')
    return JSON.parse(buf)
  } catch {}

  let docs = []
  for (const dir of dirs) {
    const moreDocs = await loadDir(dir)
    docs = docs.concat(moreDocs)
  }

  await writeFile('./docs.json', JSON.stringify(docs, false, '  '))
  
  return docs
}
