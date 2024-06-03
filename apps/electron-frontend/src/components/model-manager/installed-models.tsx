import React, { useState } from 'react';
import { Button, Card, Space, Image, Tag } from 'antd';
import styles from "../workflow-editor/reactflow-model-selector/reactflow-model-selector.style.module.scss"
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

import { useModelState } from '@comflowy/common/store/model.state';
import { comfyElectronApi, useIsElectron } from '@/lib/electron-bridge';
import { BaseModel, MarketModel } from '@comflowy/common/types/model.types';

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
    return (
        <div className={styles.modelCardList} style={{ width: '100%' }}>
            {models.map((model, index) => {
                let modelData: MarketModel = {
                    name: model.name,
                    type: model.folder,
                    filename: model.name,
                    save_path: model.folder,
                    reference: '',
                    source: "other",
                    base_model: BaseModel.OTHER,
                    sha256: '',
                    download_url: ''
                }
                if (model.meta.filename) {
                    modelData = model.meta
                }
                return (
                   <ModelCard model={modelData} key={model.id}/>
                )
            })}
        </div>
    );
};

function ModelCard(props: {
    model: MarketModel
}) {
    const model = props.model;
    const imgs = model.meta?.image_urls ?? (model.meta?.image_url ? [model.meta.image_url] : []);
    const img = imgs[0];
    let reference = "";
    if (model.source === "civitai") {
        reference = "https://civitai.com/models/" + (model.source_data?.modelId || model.meta.modelId);
    }
    return (
        <div className="model-card">
            <div className="model-card__gallery">
                {img &&<Image src={img} preview={false} />}
            </div>
            <div className="model-card__header">
                <div className="model-card__title">
                    <span className="action" onClick={ev => {
                        if (reference  !== "") {
                            comfyElectronApi.openURL(reference);
                        } 
                    }}> {props.model.name} </span>
                </div>
            </div>
            <div className="model-card__content">
                <div className="metas">
                    <Space>
                        <Tag>{props.model.base_model}</Tag>
                    </Space>
                </div>
            </div>
        </div>
    )
}

export default InstalledModels;