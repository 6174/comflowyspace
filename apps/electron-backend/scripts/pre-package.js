const path = require('path');
const fsExtra = require('fs-extra');

function cleanAndCopy() {
    fsExtra.removeSync(path.resolve(__dirname, "../package/layers"));
    fsExtra.ensureDirSync(path.resolve(__dirname, "../package/layers"));
    fsExtra.copySync(
        path.resolve(__dirname, '../layers/renderer'),
        path.resolve(__dirname, '../package/layers/renderer')
    )
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
}

module.exports = {
    cleanAndCopy
}