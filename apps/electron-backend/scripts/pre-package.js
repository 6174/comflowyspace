const path = require('path');
const fsExtra = require('fs-extra');

function cleanAndCopy() {
    console.log("current location:", __dirname)
    try {
        fsExtra.removeSync(path.resolve(__dirname, "../package/layers"));
        fsExtra.ensureDirSync(path.resolve(__dirname, "../package/layers"));
        fsExtra.copySync(
            path.resolve(__dirname, '../layers/renderer'),
            path.resolve(__dirname, '../package/layers/renderer')
        )
        console.log("copying electron-frontend/out to package/layers/renderer/out")
        fsExtra.copySync(
            path.resolve(__dirname, '../../electron-frontend/out'),
            path.resolve(__dirname, '../package/layers/renderer/out')
        )
        fsExtra.copySync(
            path.resolve(__dirname, '../layers/main/dist'),
            path.resolve(__dirname, '../package/layers/main/dist')
        )

        fsExtra.copySync(
            path.resolve(__dirname, '../layers/preload/dist'),
            path.resolve(__dirname, '../package/layers/preload/dist')
        )
    } catch(err) {
        console.log(err)
    }
}

cleanAndCopy();

module.exports = {
    cleanAndCopy
}