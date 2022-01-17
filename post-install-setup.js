'use strict'
/* eslint-disable */
const libIndyVersion = '1.15.0'
const libJnaVersion = '5.5.0'
const archs = ['arm64', 'armv7', 'x86','x86_64']

const path = require('path');
const fs = require('fs');
const Axios = require('axios')
const {pathToFileURL} = require('url')
const CWD = process.env.INIT_CWD || process.cwd()
const JNI_LIBS_DIR = path.resolve(CWD, './android/app/src/main/jniLibs')

/**
 * Downloads file from remote HTTP[S] host and puts its contents to the
 * specified location.
 */
 async function download(url, filePath) {
    if (!fs.existsSync(filePath)) {
        console.info(`Downloading ${url}`);
        return new Promise(async (resolve, reject) => {
            const file = fs.createWriteStream(filePath);
            const response = await Axios({
                url: url.toString(),
                method: 'GET',
                responseType: 'stream'
            })
            response.data.pipe(file)
            file.on('finish', () => resolve(filePath))
            file.on('error',  (err) => reject(err))
        })
    }
 }

/**
 * Extracts zip file to the specified location
 * @param {string} filePath 
 * @param {string} file Optionaly define a single file to be stracted. Use 'null' for extract everything
 * @param {string} outputFileOrDir 
 * @returns 
 */
async function extractFile(filePath, file, outputFileOrDir) {
    if (file == null || (file && !fs.existsSync(path.resolve(outputFileOrDir)))) {
        const StreamZip = require('node-stream-zip');
        const zip = new StreamZip.async({ file: filePath });
        const count = await zip.extract(file, outputFileOrDir);
        console.info(`Extracted ${count || file} entries from ${path.basename(filePath)}`);
        await zip.close();
    }
    return Promise.resolve(filePath)
}

function archToJnaArch(arch) {
    if (arch === 'arm64' ) return 'aarch64'
    if (arch === 'x86_64' ) return 'x86-64'
    return arch
}

function archToJniLibName(arch) {
    if (arch === 'arm64' || arch === 'aarch64') return 'arm64-v8a'
    if (arch === 'armv7' ) return 'armeabi-v7a'
    return arch
}

async function downloadAndExtractIndyLib(arch){
    const url = new URL(`https://repo.sovrin.org/android/libindy/stable/${libIndyVersion}/libindy_android_${arch}_${libIndyVersion}.zip`)
    const download_dir_path = path.resolve(CWD, './android/app/build/tmp')
    const file_name = url.pathname.split('/').pop();
    const file_path = path.resolve(download_dir_path, file_name)
    fs.mkdirSync(download_dir_path, {recursive: true})
    await download(url, file_path)
    const jniLib_dir_path = path.resolve(JNI_LIBS_DIR, archToJniLibName(arch))
    fs.mkdirSync(jniLib_dir_path, {recursive: true})
    await extractFile(file_path, `libindy_${arch}/lib/libindy.so`, path.resolve(jniLib_dir_path, 'libindy.so'))
    return Promise.resolve(true)
}

async function downloadAndExtractJnaLib(arch){
    const url = new URL(`https://github.com/java-native-access/jna/raw/${libJnaVersion}/lib/native/android-${archToJnaArch(arch)}.jar`)
    const download_dir_path = path.resolve(CWD, './android/app/build/tmp')
    const file_name = url.pathname.split('/').pop();
    const file_path = path.resolve(download_dir_path, file_name)
    fs.mkdirSync(download_dir_path, {recursive: true})
    await download(url, file_path)
    const jniLib_dir_path = path.resolve(JNI_LIBS_DIR, archToJniLibName(arch))
    fs.mkdirSync(jniLib_dir_path, {recursive: true})
    await extractFile(file_path, `libjnidispatch.so`, path.resolve(jniLib_dir_path, 'libjnidispatch.so'))
    return Promise.resolve(true)
}

(async function() {
    console.log(`Installing Android libraries at '${JNI_LIBS_DIR}'`)
    for (const arch of archs) {
        await downloadAndExtractIndyLib(arch)
        await downloadAndExtractJnaLib(arch)
    }
    /* When bifold is used as a depency, copy ios framework embeded from within the package */
    /* todo: figure out how to consume ios framework as a binary dependency as well (a la android)*/
    if (process.env.npm_package_json && process.env.npm_package_json.indexOf('node_modules') > 0) {
        const fse = require('fs-extra')
        const srcPath = path.resolve(process.env.npm_package_json, '../ios/Pods/Frameworks/Indy.framework')
        const dstPath = path.resolve(CWD, './ios/Pods/Frameworks/Indy.framework')
        console.log(`Copying iOS library from '${srcPath}' to '${dstPath}'`)
        fs.mkdirSync(dstPath, {recursive: true})
        fse.copySync(srcPath, dstPath);
    }
})()
