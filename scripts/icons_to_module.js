const fs = require('fs')
const path = require('path')

const icons = fs.readFileSync('./data/icons.csv').toString().split("\n").filter(l => l).map(l => {
  const [address, url] = l.split(',')
  return {
    address,
    url
  }
})
fs.writeFileSync(path.join(__dirname, '../src/token_icons.js'), `
const TOKEN_ICONS = {
${ icons.filter(({ url }) => url !== 'missing_small.png').map(({ address, url }) => `'${ address.trim() }': '${ url.trim() }'`).join(",\n") }
}

export default TOKEN_ICONS
`)