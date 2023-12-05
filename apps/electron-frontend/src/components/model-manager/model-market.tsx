import { Button, Col, Input, Row, Space } from 'antd';
import React, { useEffect, useState } from 'react';
import { useModelState } from '@comflowy/common/store/model-state';

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
                    {Array.from(new Set(models.map((model) => model.type))).map((type: string) => (
                        <Button key={type} onClick={() => handleTypeFilterChange(type)}>
                            {type}
                        </Button>
                    ))}
                </Col>
                <Col span={6}>
                    <Space>
                        <span>Search:</span>
                        <Input type="text" onChange={handleSearchInputChange} />
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
            <div className="name">{model.name}</div>
            <div className="description">{model.description}</div>
            <div className="type">{model.type}</div>
        </div>
    );
};


export default ModelMarket;

