const fs = require('fs')
const path = require('path')

const readJson = relPath =>
  JSON.parse(fs.readFileSync(path.join(__dirname, relPath), 'utf-8'))
const writeJson = (relPath, value) =>
  fs.writeFileSync(
    path.join(__dirname, relPath),
    JSON.stringify(value, undefined, 2),
    'utf-8',
  )

const mainPkgJson = readJson('../package.json')
const cliPkgJson = readJson('../package.cli.json')
const runtimePkgJson = readJson('../package.runtime.json')

const { dependencies } = mainPkgJson

writeJson('../dist/cli/package.json', { ...cliPkgJson, dependencies })
writeJson('../dist/runtime/package.json', { ...runtimePkgJson })
