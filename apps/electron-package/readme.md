# WHY use this?

pnpm does not include nested node_modules, eg express depend on body-parser, so I created a new folder to package electron app

# install

- Mac
    - `ELECTRON_MIRROR=http://npm.taobao.org/mirrors/electron/ npm install electron` 
    - `npm install`

- Windows
    -  `set ELECTRON_MIRROR=http://npm.taobao.org/mirrors/electron/ ; npm install electron` 