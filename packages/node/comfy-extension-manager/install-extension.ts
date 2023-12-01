import { EXTENTION_FOLDER, Extension, WEB_EXTENTION_FOLDER } from "./comfy-extension-manager";
import * as fs from "fs";
import * as path from "path"
import * as crypto from "crypto";
import * as unzipper from "unzipper";
import * as os from 'os';
import simpleGit, { SimpleGit } from "simple-git";
import { runScript } from "../utils";

/**
 * Install extension
 * @param extension 
 * @returns 
 */
export async function installExtension(extension: Extension) {
    const install_type: string = extension.install_type;

    console.log(`Installing Extension '${extension.title}'`);

    let res: boolean = false;

    if (extension.files.length === 0) {
        throw new Error("Extension has no files to install")
    }

    if (install_type === 'unzip') {
        res = await unzipInstall(extension.files);
    }

    if (install_type === 'copy') {
        const js_path_name: string = extension.js_path || '.';
        res = await copyInstall(extension.files, js_path_name);
    }

    if (install_type === 'git-clone') {
        res = await gitCloneInstall(extension.files);
    }

    if (extension.pip) {
        for (const pname of extension.pip) {
            const installCmd: string[] = [process.execPath, '-m', 'pip', 'install', pname];
            tryInstallScript(extension.files[0], '.', installCmd);
        }
    }

    if (res) {
        console.log('After restarting ComfyUI, please refresh the browser.');
    }

    return res;
}

async function copyInstall(files: string[], jsPathName: string | null = null): Promise<boolean> {
    for (const url of files) {
        let cleanUrl: string = url;
        if (cleanUrl.endsWith('/')) {
            cleanUrl = cleanUrl.slice(0, -1);
        }

        try {
            if (cleanUrl.endsWith('.py')) {
                await downloadUrl(url, EXTENTION_FOLDER);
            } else {
                const targetPath: string = path.join(WEB_EXTENTION_FOLDER, jsPathName || '');
                if (!fs.existsSync(targetPath)) {
                    fs.mkdirSync(targetPath, { recursive: true });
                }
                await downloadUrl(url, targetPath);
            }
        } catch (e) {
            console.error(`Install(copy) error: ${url} / ${e}`);
            return false;
        }
    }

    console.log('Installation was successful.');
    return true;
}

async function downloadUrl(url: string, targetPath: string, md5?: string): Promise<void> {
    const filename: string = path.basename(url);
    const filePath: string = path.join(targetPath, filename);

    if (fs.existsSync(filePath)) {
        console.log(`File ${filename} already exists. Skipping download.`);
        if (md5) {
            await verifyFileMd5(filePath, md5);
        }
        return;
    }

    try {
        const response: Response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Failed to download from ${url}. Status: ${response.status} ${response.statusText}`);
        }

        const buffer: Buffer = Buffer.from(await response.arrayBuffer());

        fs.writeFileSync(filePath, buffer);

        console.log(`Downloaded ${filename} to ${targetPath}`);

        if (md5) {
            await verifyFileMd5(filePath, md5);
        }
    } catch (error) {
        console.error(`Error downloading from ${url}: ${error}`);
        throw error;
    }
}

async function verifyFileMd5(filePath: string, expectedMd5: string): Promise<void> {
    const fileBuffer: Buffer = fs.readFileSync(filePath);
    const fileMd5: string = crypto.createHash('md5').update(fileBuffer).digest('hex');

    if (fileMd5 !== expectedMd5) {
        throw new Error(`MD5 verification failed for ${path.basename(filePath)}`);
    }

    console.log(`MD5 verification successful for ${path.basename(filePath)}`);
}


async function unzipInstall(files: string[]): Promise<boolean> {
    const tempFilename: string = 'manager-temp.zip';

    for (const url of files) {
        let cleanUrl: string = url;
        if (cleanUrl.endsWith('/')) {
            cleanUrl = cleanUrl.slice(0, -1);
        }

        try {
            const headers: { [key: string]: string } = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
            };

            const response: Response = await fetch(cleanUrl, { headers });
            const buffer: Buffer = Buffer.from(await response.arrayBuffer());

            fs.writeFileSync(tempFilename, buffer);

            await fs.createReadStream(tempFilename)
                .pipe(unzipper.Extract({ path: EXTENTION_FOLDER }));

            fs.unlinkSync(tempFilename);
        } catch (e) {
            console.error(`Install(unzip) error: ${cleanUrl} / ${e}`);
            return false;
        }
    }

    console.log('Installation was successful.');
    return true;
}

async function gitCloneInstall(files: string[]): Promise<boolean> {
    console.log(`install: ${files}`);

    for (const url of files) {
        if (!isValidGitUrl(url)) {
            console.log(`Invalid git url: '${url}'`);
            return false;
        }

        let cleanUrl: string = url;
        if (cleanUrl.endsWith('/')) {
            cleanUrl = cleanUrl.slice(0, -1);
        }

        try {
            console.log(`Download: git clone '${cleanUrl}'`);
            const repoName: string = path.basename(cleanUrl, path.extname(cleanUrl));
            const localPath: string = path.join(EXTENTION_FOLDER, repoName);

            // Clone the repository from the remote URL
            if (os.platform() === 'win32') {
                const res: number = await runScript([process.execPath, 'path/to/git-script.js', '--clone', EXTENTION_FOLDER, cleanUrl]);
                if (res !== 0) {
                    return false;
                }
            } else {
                const git: SimpleGit = simpleGit({
                    progress({ method, stage, progress }) {
                        console.log(`git.${method} ${stage} stage ${progress}% complete`);
                    }
                });
                await git.clone(cleanUrl, localPath);
                await git.cwd(localPath);

                if (!await executeInstallScript(cleanUrl, localPath)) {
                    return false;
                }
            }
        } catch (error) {
            console.error(`Install(git-clone) error: ${cleanUrl} / ${error}`);
            return false;
        }
    }

    console.log('Installation was successful.');
    return true;
}

function isValidGitUrl(url: string): boolean {
    // Git URL pattern: https://git-scm.com/docs/git-clone#_git_urls
    const gitUrlPattern: RegExp = /^(https?|git):\/\/[^\s]+\.git$/;

    return gitUrlPattern.test(url);
}

async function executeInstallScript(url: string, repoPath: string, lazyMode: boolean = false): Promise<boolean> {
    const installScriptPath: string = path.join(repoPath, 'install.py');
    const requirementsPath: string = path.join(repoPath, 'requirements.txt');

    if (lazyMode) {
        const installCmd: string[] = ['#LAZY-INSTALL-SCRIPT', process.execPath];
        await tryInstallScript(url, repoPath, installCmd);
    } else {
        if (fs.existsSync(requirementsPath)) {
            console.log('Install: pip packages');
            const requirementsFile: string[] = fs.readFileSync(requirementsPath, 'utf-8').split('\n');
            for (const line of requirementsFile) {
                const packageName: string = line.trim();
                if (packageName) {
                    const installCmd: string[] = [process.execPath, '-m', 'pip', 'install', packageName];
                    await tryInstallScript(url, repoPath, installCmd);
                }
            }
        }

        if (fs.existsSync(installScriptPath)) {
            console.log('Install: install script');
            const installCmd: string[] = [process.execPath, 'install.py'];
            await tryInstallScript(url, repoPath, installCmd);
        }
    }

    return true;
}


const comfy_ui_revision = "Unknown"
const comfy_ui_required_revision = 1240

async function tryInstallScript(url: string, repo_path: string, installCmd: string[]) {
    let intComfyUIRevision: number = 0;
    const ret = await runScript(installCmd, { cwd: repo_path });

    return true;
}