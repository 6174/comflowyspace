import { isWindows } from "../utils/env";

type PythonPackageRequirement = {
  name: string;
  version: string;
}

const windowsPackages = `
diffusers                 0.27.0                   pypi_0    pypi
huggingface-hub           0.20.3                   pypi_0    pypi
insightface               0.7.3                    pypi_0    pypi
numpy                     1.25.2                   pypi_0    pypi
onnx                      1.15.0                   pypi_0    pypi
onnxruntime               1.17.0                   pypi_0    pypi
onnxruntime-gpu           1.15.1                   pypi_0    pypi
open-clip-torch           2.24.0                   pypi_0    pypi
opencv-contrib-python     4.9.0.80                 pypi_0    pypi
opencv-python             4.8.0.76                 pypi_0    pypi
opencv-python-headless    4.9.0.80                 pypi_0    pypi
safetensors               0.4.2                    pypi_0    pypi
scikit-image              0.22.0                   pypi_0    pypi
scikit-learn              1.4.1.post1              pypi_0    pypi
scipy                     1.12.0                   pypi_0    pypi
seaborn                   0.13.2                   pypi_0    pypi
segment-anything          1.0                      pypi_0    pypi
semantic-version          2.10.0                   pypi_0    pypi
setuptools                69.1.0                   pypi_0    pypi
transformers              4.37.2                   pypi_0    pypi
wheel                     0.42.0                   pypi_0    pypi
mpmath                    1.3.0                    pypi_0    pypi
`

const macPackages = `
diffusers                 0.25.0                   pypi_0    pypi
huggingface-hub           0.20.2                   pypi_0    pypi
insightface               0.7.3                    pypi_0    pypi
numpy                     1.26.3                   pypi_0    pypi
onnx                      1.15.0                   pypi_0    pypi
onnxruntime               1.17.0                   pypi_0    pypi
open-clip-torch           2.24.0                   pypi_0    pypi
opencv-contrib-python     4.9.0.80                 pypi_0    pypi
opencv-python             4.7.0.72                 pypi_0    pypi
opencv-python-headless    4.9.0.80                 pypi_0    pypi
safetensors               0.4.1                    pypi_0    pypi
scikit-image              0.22.0                   pypi_0    pypi
scikit-learn              1.4.0                    pypi_0    pypi
scipy                     1.12.0                   pypi_0    pypi
seaborn                   0.13.1                   pypi_0    pypi
segment-anything          1.0                      pypi_0    pypi
semantic-version          2.10.0                   pypi_0    pypi
transformers              4.36.2                   pypi_0    pypi
setuptools                68.0.0          py310hca03da5_0    anaconda
wheel                     0.41.2          py310hca03da5_0    anaconda
mpmath                    1.3.0                    pypi_0    pypi
`

/*
 * Get python package requirements
 */
export function getPythonPackageRequirements(): string {
  const packages = isWindows ? windowsPackages : macPackages;
  const lines = packages.split('\n');
  const requirements: PythonPackageRequirement[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line) {
      const words = line.split(/\s+/);
      requirements.push({
        name: words[0],
        version: words[1]
      });
    }
  }
  return requirements.map(r => `${r.name}==${r.version}`).join(' ');
}

