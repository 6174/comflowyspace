import { describe, expect, test } from '@jest/globals';
import { parseComflowyLogs } from '../comflowy-log-parser';
const testString = `
Total VRAM 196608 MB, total RAM 196608 MB
Set vram state to: SHARED
Device: mps
VAE dtype: torch.float32
/opt/homebrew/lib/python3.11/site-packages/transformers/utils/generic.py:441: UserWarning: torch.utils._pytree._register_pytree_node is deprecated. Please use torch.utils._pytree.register_pytree_node instead.
  _torch_pytree._register_pytree_node(
Using sub quadratic optimization for cross attention, if you have memory or speed issues try using: --use-split-cross-attention
### Loading: ComfyUI-Manager (V2.7.2)
### ComfyUI Revision: 2008 [f81dbe26] | Released on '2024-02-21'
Traceback (most recent call last):
  File "/Users/chenxuejia/comflowy/CmofyUI2/nodes.py", line 1887, in load_custom_node
    module_spec.loader.exec_module(module)
  File "<frozen importlib._bootstrap_external>", line 936, in exec_module
  File "<frozen importlib._bootstrap_external>", line 1073, in get_code
  File "<frozen importlib._bootstrap_external>", line 1130, in get_data
FileNotFoundError: [Errno 2] No such file or directory: '/Users/chenxuejia/comflowy/CmofyUI2/custom_nodes/Test-Frontend-Extension/__init__.py'

Cannot import /Users/chenxuejia/comflowy/CmofyUI2/custom_nodes/Test-Frontend-Extension module for custom nodes: [Errno 2] No such file or directory: '/Users/chenxuejia/comflowy/CmofyUI2/custom_nodes/Test-Frontend-Extension/__init__.py'

Import times for custom nodes:
   0.0 seconds (IMPORT FAILED): /Users/chenxuejia/comflowy/CmofyUI2/custom_nodes/Test-Frontend-Extension
   0.1 seconds: /Users/chenxuejia/comflowy/CmofyUI2/custom_nodes/ComfyUI-Manager

Starting server

To see the GUI go to: http://127.0.0.1:8188
`

describe('Logs module', () => {
  const logs = parseComflowyLogs(testString);
  console.log("logs:", logs);
  test('logs has extensions', () => {
    expect(logs.length).toBe(3);
  });

  test('logs has import results', () => {
    expect(logs.length).toBe(3);
  });

});
