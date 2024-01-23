import { Button, Col, Input, Row, Space } from 'antd';
import React, { useEffect, useState } from 'react';
import { useModelState } from '@comflowy/common/store/model-state';
import { openExternalURL, openTabPage } from '@/lib/electron-bridge';

const ModelMarket = () => {
    const { marketModels} = useModelState();
    return (
        <ModelList models={marketModels || []} />
    );
};

const ModelList = ({ models }) => {
    const [searchQuery, setSearchQuery] = useState('');

    const [typeFilter, setTypeFilter] = useState('');

    const handleTypeFilterChange = (type) => {
        setTypeFilter(type);
    };

    const handleSearchInputChange = (event) => {
        const searchQuery = event.target.value.toLowerCase();
        setSearchQuery(searchQuery);
    };

    const filteredModels = models.filter(
        (model) =>
            (typeFilter === '' || model.type === typeFilter) &&
            (model.description.toLowerCase().includes(searchQuery) ||
                model.filename.toLowerCase().includes(searchQuery) ||
                model.name.toLowerCase().includes(searchQuery))
    );

    return (
        <div className="model-market">
            <Row>
                <Col span={18} className="filters">
                    <Space wrap>
                        {Array.from(new Set(models.map((model) => model.type))).map((type: string) => (
                            <div className={`${type === typeFilter && "active"} action filter-type`} key={type} onClick={() => {
                                if (type === typeFilter) {
                                    handleTypeFilterChange("")
                                } else {
                                    handleTypeFilterChange(type)
                                }
                            }}>
                                {type}
                            </div>
                        ))}
                    </Space>
                </Col>
                <Col span={6}>
                    <Space style={{paddingRight: 10}}>
                        <span>Search:</span>
                        <Input type="text" placeholder='Type to search models' onChange={handleSearchInputChange} />
                    </Space>
                </Col>
            </Row>
            <div className="model-list">
                {filteredModels.map((model) => (
                    <ModelListItem key={model.filename + model.description} model={model} />
                ))}
            </div>
        </div>
    );
};

const ModelListItem = ({ model }) => {
    return (
        <div className="model-list-item">
            <div className="name" onClick={ev => {
                openExternalURL(model.reference)
            }}>
                <a>{model.name}</a>
            </div>
            <div className="description">{model.description}</div>
            <Space>
                <div className="type">Type: {model.type}</div>
                <div className="size">Size: {model.size}</div>
            </Space>
        </div>
    );
};


export default ModelMarket;

