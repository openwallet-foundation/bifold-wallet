/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */
/* eslint-disable no-console */

const { execSync } = require('child_process')
const path = require('path')

function yellow(text) {
  return '\x1b[33m' + text + '\x1b[0m'
}
function green(text) {
  return '\x1b[32m' + text + '\x1b[0m'
}
function cyan(text) {
  return '\x1b[36m' + text + '\x1b[0m'
}
function red(text) {
  return '\x1b[31m' + text + '\x1b[0m'
}
function run(command, cwd) {
  console.log(`cmd:\n  ${command}\n  cwd:${cwd}`)
  execSync(command, { stdio: 'inherit', cwd: cwd })
}
function mapPackages(jsonFile, section, aggregated) {
  const items = jsonFile[section]
  if (items) {
    for (const key in items) {
      const item = { section: section, version: items[key] }
      //item['$source']=jsonFile['$source']
      if (!aggregated[key]) {
        aggregated[key] = { source: [item] }
      } else {
        aggregated[key].source.push(item)
      }
    }
  }
}

function syncPackageJson(sourcePackageJsonFilePath, destPackageJsonFilePath) {
  const sourcePackageJsonFile = path.resolve(process.cwd(), sourcePackageJsonFilePath)
  const destPackageJsonFile = path.resolve(process.cwd(), destPackageJsonFilePath)
  const destPackageJsonFileDir = path.dirname(destPackageJsonFile)
  console.log(`Reading source dependencies from ${sourcePackageJsonFile}`)
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
  mapPackages(dstJsonFile, 'resolutions', dstDependencies)

  console.log(`Reading source dependencies from ${sourcePackageJsonFile}`)
  console.log(`Reading target dependencies from ${destPackageJsonFile}`)
  //console.dir(srcDependencies)
  //console.dir(sourceJsonFile)
  //return;
  for (const srcDependencyName in srcDependencies) {
    const srcDependencyInfo = srcDependencies[srcDependencyName].source
    if (
      srcDependencyInfo.length === 1 ||
      (srcDependencyInfo.length === 2 &&
        srcDependencyInfo[0].section === 'devDependencies' &&
        srcDependencyInfo[1].section === 'peerDependencies')
    ) {
      const srcDependencyVersion = srcDependencyInfo[0].version
      if (!srcDependencyVersion.startsWith('workspace:')) {
        let dstDependencyInfo = dstDependencies[srcDependencyName]?.source
        if (!dstDependencyInfo) {
          //console.info(`${srcDependencyName}: Found in '${sourcePackageJsonFilePath}', but not in 'destPackageJsonFilePath'`)
          //dstDependencyInfo = [{section:'devDependencies'}, {section:'peerDependencies'}]
        }
        if (!dstDependencyInfo) {
          console.info(
            cyan(
              `${srcDependencyName}: Skipping! Found in '${sourcePackageJsonFilePath}', but not in '${destPackageJsonFilePath}'`
            )
          )
        } else if (dstDependencyInfo.length === 1) {
          const dstDependencyVersion = dstDependencyInfo[0].version
          if (srcDependencyVersion !== dstDependencyVersion) {
            console.info(
              yellow(`${srcDependencyName}: Updating from ${dstDependencyVersion} to ${srcDependencyVersion}`)
            )
            console.log(`  ${JSON.stringify(dstDependencyInfo)}`)
            if (dstDependencyInfo[0].section === 'devDependencies') {
              run(`yarn add --dev ${srcDependencyName}@${srcDependencyVersion}`, destPackageJsonFileDir)
            } else if (dstDependencyInfo[0].section === 'peerDependencies') {
              run(`yarn add --peer ${srcDependencyName}@${srcDependencyVersion}`, destPackageJsonFileDir)
            } else if (dstDependencyInfo[0].section === 'dependencies') {
              run(`yarn add ${srcDependencyName}@${srcDependencyVersion}`, destPackageJsonFileDir)
            } else if (dstDependencyInfo[0].section === 'resolutions') {
              if (dstDependencyInfo[0].version.startsWith('patch:')) {
                console.error(
                  red(
                    `${srcDependencyName}: Cannot overwrite '${dstDependencyInfo[0].section}' version from '${dstDependencyInfo[0].version}' to '${srcDependencyVersion}' in ${destPackageJsonFilePath}`
                  )
                )
              } else {
                run(`yarn set resolution ${srcDependencyName}@npm:* ${srcDependencyVersion}`, destPackageJsonFileDir)
              }
            } else {
              console.error(
                `${srcDependencyName}: Uknown '${dstDependencyInfo[0].section}' dependency section from ${destPackageJsonFilePath}`
              )
            }
          } else {
            console.info(green(`${srcDependencyName}: Already in sync at version ${srcDependencyVersion}`))
          }
        } else if (
          dstDependencyInfo.length === 2 &&
          dstDependencyInfo[0].section === 'devDependencies' &&
          dstDependencyInfo[1].section === 'peerDependencies'
        ) {
          const dstDependencyVersion = dstDependencyInfo[0].version
          if (srcDependencyVersion !== dstDependencyVersion) {
            run(`yarn add --dev --peer ${srcDependencyName}@${srcDependencyVersion}`, destPackageJsonFileDir)
          } else {
            console.info(green(`${srcDependencyName}: Already in sync at version ${srcDependencyVersion}`))
          }
        } else {
          console.error(
            `${srcDependencyName}: Found ${
              dstDependencyInfo.length
            } dependencies in target '${destPackageJsonFilePath}', but it was expected 1:\n ${JSON.stringify(
              dstDependencyInfo
            )}`
          )
        }
      } else {
        console.info(cyan(`${srcDependencyName}: Skipping because version is '${srcDependencyVersion}'`))
      }
    } else {
      console.error(
        `${srcDependencyName}: Found ${
          srcDependencyInfo.length
        } dependencies in source '${sourcePackageJsonFilePath}', but it was expected 1:\n ${JSON.stringify(
          srcDependencyInfo
        )}`
      )
    }
  }
}
/**
 *
 * @param {Object} opts
 * @param {string} opts.src
 * @param {string} opts.dst
 * @param {string} opts.fix
 */
function syncPackageLock(opts) {
  const sourcePackageJsonFilePath = opts.src
  const destPackageJsonFilePath = opts.dst
  const fix = (opts?.fix || 'false') === 'true'
  const sourcePackageJsonFile = path.resolve(process.cwd(), sourcePackageJsonFilePath)
  const destPackageJsonFile = path.resolve(process.cwd(), destPackageJsonFilePath)
  const sourcePackageJsonFileDir = path.dirname(sourcePackageJsonFile)
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
  mapPackages(dstJsonFile, 'resolutions', dstDependencies)

  console.log(`Reading source dependencies from ${sourcePackageJsonFile}`)
  console.log(`Reading target dependencies from ${destPackageJsonFile}`)
  for (const dependencyName in srcDependencies) {
    const srcDependencyInfo = srcDependencies[dependencyName]
    //console.log(`processing ${srcDependencyName}`)
    const yarnInfo = JSON.parse(
      execSync(`yarn info ${dependencyName} --json`, { cwd: sourcePackageJsonFileDir }).toString()
    )
    srcDependencyInfo.resolved = yarnInfo.children.Version
  }
  for (const dependencyName in dstDependencies) {
    const dependencyInfo = dstDependencies[dependencyName]
    if (srcDependencies[dependencyName]) {
      const yarnInfo = JSON.parse(
        execSync(`yarn info ${dependencyName} --json`, { cwd: destPackageJsonFileDir }).toString()
      )
      dependencyInfo.resolved = yarnInfo.children.Version
    }
  }
  for (const dependencyName in srcDependencies) {
    const srcDependencyInfo = srcDependencies[dependencyName]
    const dstDependencyInfo = dstDependencies[dependencyName]
    if (srcDependencyInfo && dstDependencyInfo) {
      if (srcDependencyInfo.resolved !== dstDependencyInfo.resolved) {
        console.log(
          yellow(
            `${dependencyName} mismatch: source is ${srcDependencyInfo.resolved}, target is ${dstDependencyInfo.resolved}`
          )
        )
        if (fix) {
          console.log('Fixing ...')
          console.dir(dstDependencyInfo)
          if (
            dstDependencyInfo.source.length === 2 &&
            dstDependencyInfo.source[0].section === 'devDependencies' &&
            dstDependencyInfo.source[1].section === 'peerDependencies'
          ) {
            run(
              `yarn add --dev --peer --exact --mode=skip-build ${dependencyName}@${srcDependencyInfo.resolved}`,
              destPackageJsonFileDir
            )
          } else if (
            dstDependencyInfo.source.length === 1 &&
            dstDependencyInfo.source[0].section === 'devDependencies'
          ) {
            run(
              `yarn add --dev --exact --mode=skip-build ${dependencyName}@${srcDependencyInfo.resolved}`,
              destPackageJsonFileDir
            )
          } else if (
            dstDependencyInfo.source.length === 1 &&
            dstDependencyInfo.source[0].section === 'peerDependencies'
          ) {
            run(
              `yarn add --peer --exact --mode=skip-build ${dependencyName}@${srcDependencyInfo.resolved}`,
              destPackageJsonFileDir
            )
          } else if (dstDependencyInfo.source.length === 1 && dstDependencyInfo.source[0].section === 'dependencies') {
            run(
              `yarn add --exact --mode=skip-build ${dependencyName}@${srcDependencyInfo.resolved}`,
              destPackageJsonFileDir
            )
          }
          //execSync(`yarn add ${dependencyName} --json`, { cwd: destPackageJsonFileDir }).toString()
        }
      } else {
        console.log(
          green(`${dependencyName} source: ${srcDependencyInfo.resolved} , target: ${dstDependencyInfo.resolved}`)
        )
      }
    }
  }
}

module.exports = {
  cli: (_args) => {
    /** @type {string[]} */
    let args = _args.splice(2)
    console.log(args)
    const opt = {}
    const cmd = args[0]
    args.shift()
    while (args.length > 0) {
      const eq = args[0].indexOf('=')
      if (args[0].startsWith('--')) {
        if (eq > 0) {
          const key = args[0].substring(2, eq)
          const value = args[0].substring(eq + 1)
          opt[key] = value
        } else {
          const key = args[0].substring(2)
          const value = args[1]
          opt[key] = value
          args.shift()
        }
      }
      //console.log(`${args[0]}    length ${args.length}`)
      args.shift()
    }
    if (cmd === 'sync-package-json') {
      syncPackageJson(args[2], args[4])
    } else if (cmd === 'sync-package-lock') {
      syncPackageLock(opt)
    }
  },
}
