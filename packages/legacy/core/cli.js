/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */
/* eslint-disable no-console */

const path = require('path')

function yellow(text){
  return '\x1b[33m' + text + '\x1b[0m'
}
function green(text){
  return '\x1b[32m' + text + '\x1b[0m'
}
function cyan(text){
  return '\x1b[36m' + text + '\x1b[0m'
}
function red(text){
  return '\x1b[31m' + text + '\x1b[0m'
}
function syncPackageJson(sourcePackageJsonFilePath, destPackageJsonFilePath) {
  const { execSync } = require('child_process')
  //const pak = require('./package.json')
  function parseNameAndVersion(val) {
    const sep = val.lastIndexOf('@')
    return [val.substring(0, sep), val.substring(sep + 1)]
  }
  function run(command, cwd) {
    console.log(`cmd:\n  ${command}\n  cwd:${cwd}`)
    execSync(command, { stdio: 'inherit', cwd: cwd })
  }
  function mapPackages(jsonFile, section, aggregated) {
    const items = jsonFile[section]
    if (items) {
      for (const key in items) {
        const item = {section:section, version:items[key]}
        //item['$source']=jsonFile['$source']
        if (!aggregated[key]) {
          aggregated[key] = [item]
        } else{
          aggregated[key].push(item)
        }
      }
    }
  }
  const sourcePackageJsonFile = path.resolve(process.cwd(), sourcePackageJsonFilePath)
  const destPackageJsonFile = path.resolve(process.cwd(), destPackageJsonFilePath)
  const destPackageJsonFileDir = path.dirname(destPackageJsonFile)
  console.log(`Reading source dependencies from ${sourcePackageJsonFilePath}`)
  const sourceJsonFile = require(sourcePackageJsonFile)
  console.log(`Reading target dependencies from ${destPackageJsonFilePath}`)
  const dstJsonFile = require(destPackageJsonFile)
  const srcDependencies = {}
  const dstDependencies = {}
  sourceJsonFile['$source'] = sourcePackageJsonFile
  mapPackages(sourceJsonFile, 'dependencies', srcDependencies)
  mapPackages(sourceJsonFile, 'devDependencies', srcDependencies)
  mapPackages(sourceJsonFile, 'peerDependencies', srcDependencies)

  mapPackages(dstJsonFile, 'dependencies', dstDependencies)
  mapPackages(dstJsonFile, 'devDependencies', dstDependencies)
  mapPackages(dstJsonFile, 'peerDependencies', dstDependencies)

  console.log(`Reading source dependencies from ${sourcePackageJsonFile}`)
  console.log(`Reading target dependencies from ${destPackageJsonFile}`)
  //console.dir(srcDependencies)
  //console.dir(sourceJsonFile)
  //return;
  for (const srcDependencyName in srcDependencies) {
    const srcDependencyInfo = srcDependencies[srcDependencyName]
    if (srcDependencyInfo.length === 1) {
      const srcDependencyVersion = srcDependencyInfo[0].version
      if (!srcDependencyVersion.startsWith('workspace:')) {
        let dstDependencyInfo = dstDependencies[srcDependencyName]
        if (!dstDependencyInfo){
          //console.info(`${srcDependencyName}: Found in '${sourcePackageJsonFilePath}', but not in 'destPackageJsonFilePath'`)
          //dstDependencyInfo = [{section:'devDependencies'}, {section:'peerDependencies'}]
        }
        if (!dstDependencyInfo) {
          console.info(cyan(`${srcDependencyName}: Skipping! Found in '${sourcePackageJsonFilePath}', but not in '${destPackageJsonFilePath}'`))
        } else if (dstDependencyInfo.length === 1) {
          const dstDependencyVersion = dstDependencyInfo[0].version
          if (srcDependencyVersion !== dstDependencyVersion) {
            console.info(yellow(`${srcDependencyName}: Updating from ${dstDependencyVersion} to ${srcDependencyVersion}`))
            if (dstDependencyInfo[0].section === 'devDependencies') {
              run(`yarn add --dev ${srcDependencyName}@${srcDependencyVersion}`, destPackageJsonFileDir)
            } else if (dstDependencyInfo[0].section === 'peerDependencies') {
              run(`yarn add --peer ${srcDependencyName}@${srcDependencyVersion}`, destPackageJsonFileDir)
            } else if (dstDependencyInfo[0].section === 'dependencies') {
              run(`yarn add --peer ${srcDependencyName}@${srcDependencyVersion}`, destPackageJsonFileDir)
            }else{
              console.error(`${srcDependencyName}: Uknown '${dstDependencyInfo[0].section}' dependency section from ${destPackageJsonFilePath}`)
            }
          } else {
            console.info(green(`${srcDependencyName}: Already in sync at version ${srcDependencyVersion}`))
          }
        }else if (dstDependencyInfo.length === 2 && dstDependencyInfo[0].section === 'devDependencies' && dstDependencyInfo[1].section === 'peerDependencies'){
          const dstDependencyVersion = dstDependencyInfo[0].version
          if (srcDependencyVersion !== dstDependencyVersion) {
            run(`yarn add --dev --peer ${srcDependencyName}@${srcDependencyVersion}`, destPackageJsonFileDir)
          } else {
            console.info(green(`${srcDependencyName}: Already in sync at version ${srcDependencyVersion}`))
          }
        }else {
          console.error(`${srcDependencyName}: Found ${dstDependencyInfo.length} dependencies in target '${destPackageJsonFilePath}', but it was expected 1:\n ${JSON.stringify(dstDependencyInfo)}`)
        }
      }else{
        console.info(cyan(`${srcDependencyName}: Skipping because version is '${srcDependencyVersion}'`))
      }
    }else {
      console.error(`${srcDependencyName}: Found ${srcDependencyInfo.length} dependencies in source '${sourcePackageJsonFilePath}', but it was expected 1:\n ${JSON.stringify(srcDependencyInfo)}`)
    }
  }
  //console.dir(sourceDependencies, {depth: 3})
  //const lockedDependencies = execSync('yarn info --json', { cwd: __dirname })
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
      syncPackageJson(args[2], args[4])
    }
  },
}
