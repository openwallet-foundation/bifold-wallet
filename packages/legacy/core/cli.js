/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */
/* eslint-disable no-console */

function syncPackageJson() {
  const { execSync } = require('child_process')
  const pak = require('./package.json')
  function parseNameAndVersion(val) {
    const sep = val.lastIndexOf('@')
    return [val.substring(0, sep), val.substring(sep + 1)]
  }
  function npmInstall(command) {
    console.log(`cmd\n${command}`)
    execSync(command, { stdio: 'inherit', cwd: process.cwd() })
  }
  const lockedDependencies = execSync('npm ls --package-lock-only', { cwd: __dirname })
    .toString()
    .trim()
    .split('\n')
    .splice(1)
    .map((item) => {
      return item.substring(4)
    })
    .reduce((prev, val) => {
      const [name, version] = parseNameAndVersion(val)
      prev[name] = version
      return prev
    }, {})

  //const peerDependencies = pak.peerDependencies
  //console.log(`peerDependencies:${ Object.keys(pak.peerDependencies).length}`)
  for (const item of Object.keys(pak.peerDependencies)) {
    pak.peerDependencies[item] = '' + lockedDependencies[item]
  }
  console.log(JSON.stringify(pak.peerDependencies, undefined, 2))

  //console.log(`devDependencies:${ Object.keys(pak.devDependencies).length}`)
  for (const item of Object.keys(pak.devDependencies)) {
    if (pak.devDependencies[item].startsWith('npm:')) {
      const curVersion = pak.devDependencies[item]
      const [name] = parseNameAndVersion(curVersion)
      pak.devDependencies[item] = name + '@' + lockedDependencies[item + '@' + name]
    } else {
      pak.devDependencies[item] = '' + lockedDependencies[item]
    }
  }
  console.log('Installing Dependencies ...')
  for (const item of Object.keys(pak.peerDependencies)) {
    npmInstall(`npm install ${item}@${pak.peerDependencies[item]} --force --save-exact`, {
      stdio: 'inherit',
      cwd: process.cwd(),
    })
  }
  console.log('Installing Dev Dependencies ...')
  const devAllowList = [
    '@babel/core',
    '@babel/runtime',
    '@types/lodash.merge',
    '@types/react',
    '@types/react-native',
    'babel-plugin-module-resolver',
    'metro-react-native-babel-preset',
    'react-native-svg-transformer',
    'typescript',
  ]
  for (const item of Object.keys(pak.devDependencies)) {
    if (devAllowList.includes(item)) {
      npmInstall(`npm install -D ${item}@${pak.devDependencies[item]} --force --save-exact`, {
        stdio: 'inherit',
        cwd: process.cwd(),
      })
    }
  }
  //console.log(JSON.stringify(pak.devDependencies, undefined, 2))
  /*
  fs.writeFile(
    'app-package.json',
    JSON.stringify({ dependencies: pak.peerDependencies, devDependencies: pak.devDependencies }, undefined, 2),
    'utf8',
    (err) => {
      if (err) {
        console.log('An error occured while writing JSON Object to File.')
        return console.log(err)
      }
      console.log('JSON file has been saved.')
    }
  )
  */
}
module.exports = {
  cli: (_args) => {
    const args = _args.splice(2)
    console.log(args)
    if (args[0] === 'sync-package-json') {
      syncPackageJson()
    }
  },
}
