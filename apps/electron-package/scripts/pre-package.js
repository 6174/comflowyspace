const path = require('path');
const fsExtra = require('fs-extra');

async function cleanAndCopy() {
    console.log("current location:", __dirname)
    try {
        await fsExtra.remove(path.resolve(__dirname, "../layers"));
        await fsExtra.ensureDir(path.resolve(__dirname, "../layers"));
        await fsExtra.copy(
            path.resolve(__dirname, '../../electron-backend/layers/renderer/dist'),
            path.resolve(__dirname, '../layers/renderer/dist')
        )
        console.log("copying electron-frontend/out to package/layers/renderer/out")
        await fsExtra.copy(
            path.resolve(__dirname, '../../electron-frontend/out'),
            path.resolve(__dirname, '../layers/renderer/out')
        )
        await fsExtra.copy(
            path.resolve(__dirname, '../../electron-backend/layers/main/dist'),
            path.resolve(__dirname, '../layers/main/dist')
        )

        await fsExtra.copy(
            path.resolve(__dirname, '../../electron-backend/layers/preload/dist'),
            path.resolve(__dirname, '../layers/preload/dist')
        )
    } catch(err) {
        console.log(err)
    }
}

cleanAndCopy();

module.exports = {
    cleanAndCopy
}