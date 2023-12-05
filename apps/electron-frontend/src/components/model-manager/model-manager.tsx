import { Button, Col, Input, Row, Space } from 'antd';
import React, { useState } from 'react';
import styles from "./model-manager.style.module.scss";

const ModelManagement = () => {
  // Replace with your actual models data
  const models = [
    {
      name: "TAESDXL Decoder",
      type: "TAESD",
      base: "SDXL",
      save_path: "vae_approx",
      description: "(SDXL Verison) To view the preview in high quality while running samples in ComfyUI, you will need this model.",
      reference: "https://github.com/madebyollin/taesd",
      filename: "taesdxl_decoder.pth",
      url: "https://github.com/madebyollin/taesd/raw/main/taesdxl_decoder.pth",
    },
    {
      name: "TAESDXL Encoder",
      type: "TAESD",
      base: "SDXL",
      save_path: "vae_approx",
      description: "(SDXL Verison) To view the preview in high quality while running samples in ComfyUI, you will need this model.",
      reference: "https://github.com/madebyollin/taesd",
      filename: "taesdxl_encoder.pth",
      url: "https://github.com/madebyollin/taesd/raw/main/taesdxl_encoder.pth",
    },
    // Add more models as needed
  ];

  return (
    <ModelList models={models} />
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
    <div className={styles.modelManagement}>
      <div className="header">
        <h1>Model Management</h1>
      </div>
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
          <ModelListItem key={model.filename} model={model} />
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


export default ModelManagement;

