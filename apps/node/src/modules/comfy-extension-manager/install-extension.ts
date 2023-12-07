import { EXTENTION_FOLDER, Extension, WEB_EXTENTION_FOLDER } from "./comfy-extension-manager";
import * as fs from "fs";
import * as path from "path"
import * as unzipper from "unzipper";
import {downloadUrl} from "../utils/download-url";
import { isValidGitUrl } from "../utils/is-valid-git-url";
import { TaskEventDispatcher } from "../task-queue/task-queue";
import { runCommand } from "../utils/run-command";
import { getAppTmpDir } from "../utils/get-appdata-dir";
import { checkIfInstalled, condaActivate } from "../comfyui/bootstrap";

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
        await runCommand(`${condaActivate} pip install ${extension.pip.join(" ")}`)
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
        } catch (e) {
            dispatcher({
                message: `Install(unzip) error: ${cleanUrl} / ${e}`,
                error: e
            });
            return false;
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
        } catch (e) {
            dispatcher({
                message: `Install(copy) error: ${url} / ${e}`,
                error: e
            });
            return false;
        }
    }
    return true;
}


async function gitCloneInstall(dispatcher: TaskEventDispatcher, files: string[]): Promise<boolean> {
    console.log(`install: ${files}`);
    if (!await checkIfInstalled("git --version")) {
        dispatcher({
            message: `Git is not installed, please install it.`
        });
        return false;
    }

    for (const url of files) {
        dispatcher({
            message: `Start git clone ${url} to install`
        });

        if (!isValidGitUrl(url)) {
            dispatcher({
                message: `Invalid git url: '${url}'`
            });
            return false;
        }

        let cleanUrl: string = url;
        if (cleanUrl.endsWith('/')) {
            cleanUrl = cleanUrl.slice(0, -1);
        }

        try {
            const repoName: string = path.basename(cleanUrl, path.extname(cleanUrl));
            const repoPath: string = path.join(EXTENTION_FOLDER, repoName);

            const res = await runCommand(`git clone ${cleanUrl}`, dispatcher, {
                cwd: EXTENTION_FOLDER,
            });
            if (res.exitCode !== 0) {
                dispatcher({
                    message: `Git clone url: '${url}' failed`,
                    error: res.stderr,
                });
            }
            if (!await executeInstallScript(dispatcher, cleanUrl, repoPath)) {
                return false;
            }
            dispatcher({
                message: `Git clone url: '${url}' success`
            });
        } catch (error) {
            dispatcher({
                message: `Install(git-clone) error: ${cleanUrl} / ${error}`,
                error
            });
            return false;
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
        const res = await runCommand(`${condaActivate} pip install -r requirements.txt`, dispatcher, {
            cwd: repoPath,
        });
        if (res.exitCode !== 0) {
            dispatcher({
                message: `Install(pip) error: ${url} / ${res.stderr}`,
                error: res.stderr,
            });
            return false;
        }
    }

    if (fs.existsSync(installScriptPath)) {
        console.log('Install: install script');
        const installCmd: string[] = [process.execPath, 'install.py'];

        const res = await runCommand(`${condaActivate} python install.py`, dispatcher, {
            cwd: repoPath
        });
        if (res.exitCode !== 0) {
            dispatcher({
                message: `Run install.py error: ${url} / ${res.stderr}`,
                error: res.stderr,
            });
            return false;
        }
    }
    return true;
}