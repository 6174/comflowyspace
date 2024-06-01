import { execa } from "execa";
export async function getGPUType(): Promise<string> {
    try {
        // 使用 nvidia-smi 命令获取 NVIDIA GPU 信息
        await execa('nvidia-smi');
        return 'nvidia';
    } catch (errorNVIDIA) {
        // 使用 rocm-smi 命令获取 AMD GPU 信息
        try {
            await execa('rocm-smi');
            return 'amd';
        } catch (errorAMD) {
            try {
                const { stdout } = await execa('wmic', ['path', 'win32_VideoController', 'get', 'name']);
                if (stdout.includes('AMD')) {
                    return 'amd';
                } else if (stdout.includes('Intel')) {
                    return 'intel';
                } else {
                    // 如果都失败，则可能没有 GPU 或者其他类型的 GPU
                    return 'unknown';
                }
            } catch (error) {
                // 如果 wmic 命令失败，则可能没有 GPU 或者其他类型的 GPU
                return 'unknown';
            }
        }
    }
}
