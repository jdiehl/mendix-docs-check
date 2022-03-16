const { main } = require('./src/main')

main('../docs/content/en/docs/', './data.tsv').catch(err => console.error(err))
