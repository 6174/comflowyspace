# Extension Architecture

1. Extensions arch is learn from figma and vscode
2. Extension main parts:
  1. manifest.json: to register `main.js` and `ui.js` like figma
    ```json
     {
        "name": "Plugin name",
        "id": "00000000",
        "version": "1.0.0",
        "main": "dist/main.js",
        "ui": "dist/ui.html",
      }
    ```
  2. Extension/main: works in a web worker for safety and consistense consideration
    - `Main.js` can interact with Comflowy frontend app through `comfylowy-extension-api` 
    - `Main.js` can interact with `ui.js`
  3. Extension UI:
    - Popup Window: Main UI like figma
    - Button Hooks: Such as context menu options can be registerd from main

# Extension API

1. `comflowy.showUI` 
2. `comflowy.onMessage`
3. `comflowy.ui.onMessage`
4. `comflowy.editor.getNodes`
5. `comflowy.editor.updateNodes`
6. `comflowy.editor.removeNodes`
7. `comflowy.editor.createNodes`
8. `comflowy.editor.getConnections`
9. `comflowy.editor.removeConnections`
11. `comflowy.editor.getWidgets`
12. `comflowy.editor.xxx`

# Extension lifecycle

1. After start the editor, find all valid frontend extensions 
2. Load all plugins, for plugin in plugins:
  - fetch plugin/manifest.json and parse it
  - fetch main.js and start main in web work enviroment
    - If there is some errors when load plugin, show errors with alert messages like vscode
  - get register UI hooks