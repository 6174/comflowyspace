import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function verifyPythonPath(pythonPath: string): Promise<boolean> {
  try {
    const { stdout, stderr } = await execAsync(`${pythonPath} --version`);
    if (stderr) {
      throw new Error(stderr)
    }
    console.log(`Python found: ${stdout}`);
    return true;
  } catch (error: any) {
    throw new Error(`Python not found at ${pythonPath}`);
  }
}

// verifyPythonPath("/Users/chenxuejia/comflowy/tmp/python");