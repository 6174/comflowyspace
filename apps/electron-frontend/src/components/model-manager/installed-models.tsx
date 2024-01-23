import React, { useState } from 'react';
import { Button, Card, Space } from 'antd';

// Your model data
// const installedModels = {
//     type1: [
//         { name: 'Model A', size: 1 },
//         { name: 'Model B', size: 2 },
//     ],
//     type2: [
//         { name: 'Model C', size: 1.5 },
//         { name: 'Model D', size: 3 },
//     ],
//     // Add more types and models as needed
// };

import { useModelState } from '@comflowy/common/store/model-state';
import { comfyElectronApi, useIsElectron } from '@/lib/electron-bridge';

const InstalledModels = () => {
    const {installedModels} = useModelState();
    const [selectedType, setSelectedType] = useState('checkpoints'); // State to keep track of the selected model type

    // Function to handle type filter change
    const handleTypeFilterChange = (type) => {
        setSelectedType(type);
    };

    // Function to get all unique model types
    const getModelTypes = () => {
        const types = Object.keys(installedModels).map((type) => {
            return {
                type,
                count: installedModels[type].length,
            }
        }).filter((it) => it.count > 0);
        return types;
    };

    // Function to get models for the selected type
    const getModelsForType = () => {
        return selectedType ? installedModels[selectedType] || [] : [];
    };

    return (
        <div className="installed-models">
            <Space className="filters">
                {getModelTypes().map((it) => (
                    <div className={`${it.type === selectedType && "active"} action filter-type`} key={it.type} onClick={() => handleTypeFilterChange(it.type)}>
                        {`${it.type} (${it.count})`}
                    </div>
                ))}
            </Space>
            <div>
                <ModelList models={getModelsForType()} />
            </div>
        </div>
    );
};

const ModelList = ({ models }) => {
    const isElectron = useIsElectron();
    return (
        <div className='model-list' style={{ width: '100%' }}>
            {models.map((model, index) => {
                return (
                    <div className="model-list-item" key={index}>
                        <Space>
                            {
                                isElectron ? (
                                    <a className='title' onClick={ev => {
                                        comfyElectronApi.openDirectory(model.dir);
                                    }}>{model.name}</a>
                                ) : (
                                    <div className="title">{model.name}</div>
                                )
                            }
                            <div className="size">{"("}{model.size}{")"}</div>
                        </Space>
                    </div>
                )
            })}
        </div>
    );
};

export default InstalledModels;