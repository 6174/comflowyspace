import { execa } from "execa";

export async function getMacArchitecture(): Promise<string> {
    // 使用 uname -m 获取系统架构信息
    const { stdout } = await execa('uname', ['-m']);
    const architecture = stdout.trim();

    return architecture === 'arm64' ? 'arm64' : 'x86_64';
}