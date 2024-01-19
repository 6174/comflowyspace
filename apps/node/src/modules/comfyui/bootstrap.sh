#!/bin/bash

CONDA_ENV_NAME="comflowy" # 定义conda环境名

# 检查命令是否已经安装
is_installed() {
    command -v $1 >/dev/null 2>&1
    return $?
}

# Function to install and check PyTorch
install_torch() {
    pip3 install --pre torch torchvision torchaudio --extra-index-url https://download.pytorch.org/whl/nightly/cpu

    if [ $? -ne 0 ]; then
        echo "PyTorch installation failed"
        exit 1
    fi

    python3 -c "
import torch
if torch.__version__:
    print(f'Torch version: {torch.__version__} installed successfully.')
else:
    print('Torch verification failed.')
"
}

# 通过conda安装Python
install_python() {
    if conda env list | grep -q "^${CONDA_ENV_NAME}.*"; then
        echo "Python=3.10.8 already installed in Conda environment ${CONDA_ENV_NAME}"
        return 0
    fi

    echo "Start installing Python=3.10.8 in conda..."
    conda create -n ${CONDA_ENV_NAME} python=3.10.8 -y
    if [ $? -eq 0 ]; then
        echo "Installed Python=3.10.8 successfully."
    else
        echo "Failed to install Python=3.10.8."
        return 1
    fi
}

# 安装conda
install_conda() {
    if is_installed conda; then
        echo "conda already installed"
        install_python
        conda activate ${CONDA_ENV_NAME} 
        install_torch
        return $?
    fi

    echo "Installing conda..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        ARCHITECTURE=$(uname -m)
        if [[ "$ARCHITECTURE" == "arm64" ]]; then
            wget https://repo.anaconda.com/miniconda/Miniconda3-latest-MacOSX-arm64.sh -O miniconda.sh
        else
            wget https://repo.anaconda.com/miniconda/Miniconda3-latest-MacOSX-x86_64.sh -O miniconda.sh
        fi

        bash miniconda.sh -b
        if [ $? -eq 0 ]; then
            echo "Installed conda successfully."
        else
            echo "Failed to install conda."
            return 1
        fi

        install_python
        install_torch
        return $?
    else
        echo "Unsupported OS"
        return 1
    fi
}



# 运行函数
install_conda