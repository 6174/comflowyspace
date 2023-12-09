import { EXTENTION_FOLDER, Extension, WEB_EXTENTION_FOLDER } from "./types";
import * as fs from "fs";
import * as path from "path"
import * as unzipper from "unzipper";
import {downloadUrl} from "../utils/download-url";
import { isValidGitUrl } from "../utils/is-valid-git-url";
import { TaskEventDispatcher } from "../task-queue/task-queue";
import { PIP_PATH, PYTHON_PATH, condaActivate, runCommand } from "../utils/run-command";
import { getAppTmpDir } from "../utils/get-appdata-dir";
import { checkIfInstalled } from "../comfyui/bootstrap";
import * as fsExtra from "fs-extra"
const appTmpDir = getAppTmpDir();

/**
 * Install extension
 * @param extension 
 * @returns 
 */
export async function installExtension(dispatcher: TaskEventDispatcher, extension: Extension): Promise<boolean> {
    dispatcher({
        message: `Start installing ${extension.title}`
    });

    const install_type: string = extension.install_type;

    let res: boolean = false;

    if (extension.files.length === 0) {
        dispatcher({
            message: "Extension has no file to install"
        });
        return false;
    }

    // from civizai zip file
    if (install_type === 'unzip') {
        res = await unzipInstall(dispatcher, extension.files);
    }

    // from some.py file in github
    if (install_type === 'copy') {
        const js_path_name: string = extension.js_path || '.';
        res = await copyInstall(dispatcher, extension.files, js_path_name);
    }

    // a full git repo
    if (install_type === 'git-clone') {
        res = await gitCloneInstall(dispatcher, extension.files);
    }

    if (extension.pip) {
        dispatcher({
            message: `Start installing pip packages ${extension.title}`
        });
        await runCommand(`${PIP_PATH} install ${extension.pip.join(" ")}`)
    }

    if (res) {
        dispatcher({
            message: `Install extension ${extension.title} success`,
            progress: 100,
            data: {
                success: true
            }
        });
    }
    return res;
}


async function unzipInstall(dispatcher: TaskEventDispatcher, files: string[]): Promise<boolean> {
    const tempFilePath: string = path.resolve(appTmpDir, 'install-zip-extension-tmp.zip');
    for (const url of files) {
        dispatcher({
            message: `Unzip ${url} to install`
        });
        let cleanUrl: string = url;
        if (cleanUrl.endsWith('/')) {
            cleanUrl = cleanUrl.slice(0, -1);
        }
        try {
            await downloadUrl(dispatcher, cleanUrl, tempFilePath);
            await fs.createReadStream(tempFilePath)
                .pipe(unzipper.Extract({ path: EXTENTION_FOLDER }));
            fs.unlinkSync(tempFilePath);
            dispatcher({
                message: `Install ${url} success to ${EXTENTION_FOLDER}`
            });
        } catch (e: any) {
            throw new Error(`Install(unzip) error: ${cleanUrl} / ${e.message}`)
        }
    }
    return true;
}


async function copyInstall(dispatcher: TaskEventDispatcher, files: string[], jsPathName: string | null = null): Promise<boolean> {
    for (const url of files) {
        let cleanUrl: string = url;
        if (cleanUrl.endsWith('/')) {
            cleanUrl = cleanUrl.slice(0, -1);
        }
        try {
            if (cleanUrl.endsWith('.py')) {
                dispatcher({
                    message: `Start copy ${cleanUrl} to install`
                });
                await downloadUrl(dispatcher, url, EXTENTION_FOLDER);
            } else {
                const targetPath: string = path.join(WEB_EXTENTION_FOLDER, jsPathName || '');
                if (!fs.existsSync(targetPath)) {
                    fs.mkdirSync(targetPath, { recursive: true });
                }
                await downloadUrl(dispatcher, url, targetPath);
            }
        } catch (e: any) {
            throw new Error(`Install(copy) error: ${cleanUrl} / ${e.message}`)
        }
    }
    return true;
}


async function gitCloneInstall(dispatcher: TaskEventDispatcher, files: string[]): Promise<boolean> {
    console.log(`git clone: ${files}`);
    const isGitInstall = await checkIfInstalled("git --version");
    if (!isGitInstall) {
        throw new Error(`Git is not installed, please install it.`)
    }
    for (const url of files) {
        dispatcher({
            message: `Start git clone ${url} to install`
        });

        if (!isValidGitUrl(url)) {
            throw new Error(`Invalid git url: '${url}'`)
        }

        let cleanUrl: string = url;
        if (cleanUrl.endsWith('/')) {
            cleanUrl = cleanUrl.slice(0, -1);
        }

        try {
            const repoName: string = path.basename(cleanUrl, path.extname(cleanUrl));
            const repoPath: string = path.join(EXTENTION_FOLDER, repoName);
            if (fs.existsSync(repoPath)) {
                fsExtra.removeSync(repoPath);
            }
            await runCommand(`git clone ${cleanUrl}`, dispatcher, {
                cwd: EXTENTION_FOLDER,
            });
            await executeInstallScript(dispatcher, cleanUrl, repoPath);
            dispatcher({
                message: `Git clone url: '${url}' success`
            });
        } catch (error) {
            throw new Error(`Install(git-clone) error: ${cleanUrl} / ${error}`)
        }
    }

    return true;
}


async function executeInstallScript(dispatcher: TaskEventDispatcher, url: string, repoPath: string, lazyMode: boolean = false): Promise<boolean> {
    const installScriptPath: string = path.join(repoPath, 'install.py');
    const requirementsPath: string = path.join(repoPath, 'requirements.txt');

    if (fs.existsSync(requirementsPath)) {
        dispatcher({
            message: 'Install: pip packages'
        });
        await runCommand(`${PIP_PATH} install -r requirements.txt`, dispatcher, {
            cwd: repoPath,
        });
    }

    if (fs.existsSync(installScriptPath)) {
        console.log('Install: install script');
        await runCommand(`${PYTHON_PATH} install.py`, dispatcher, {
            cwd: repoPath
        });
    }
    return true;
}