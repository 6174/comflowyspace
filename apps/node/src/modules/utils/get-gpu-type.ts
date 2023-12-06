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
            // 如果都失败，则可能没有 GPU 或者其他类型的 GPU
            return 'unknown';
        }
    }
}
