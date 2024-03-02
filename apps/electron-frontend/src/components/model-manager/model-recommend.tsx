import React, { useEffect, useState } from 'react';
import styles from './model-manager.style.module.scss';
import { openExternalURL } from '@/lib/electron-bridge';
import useModelStore from './model.store';
import { Button, Card, Space } from 'antd';
import { FolderIcon } from "ui/icons";

interface ModelCardProps {
  image: string;
  title: string;
  url: string;
  tag: string;
  size: string;
}

const ModelCard: React.FC<ModelCardProps> = ({ image, title, url, tag, size }) => {
  return (
    <div 
      className="model-card" 
      onClick={() => openExternalURL(url)} 
    >
      <div
        style={{ 
        backgroundImage: `url(${process.env.NEXT_PUBLIC_API_SERVER + image})`,
        display: "flex",
        width: "100%",
        height: 200,
        borderRadius: 10,
        backgroundSize: "cover",
        backgroundPosition: "center"
        }}
      >
      </div>
      <div className="name">
        {title}
      </div>
      <div className="tag">
        {tag}
      </div>
      <div className="size">
        <FolderIcon />
        <div style={{
          marginLeft: 5,
          fontSize: 12,
        }}>
          Size: {size}
        </div>
      </div>
    </div>
  );
};

const countCardsByTag = (models) => {
  const counts = {};
  models.forEach(model => {
    const tag = model.tag;
    if (tag) {
      counts[tag] = (counts[tag] || 0) + 1;
    }
  });
  return counts;
}

export function PageCard({models, selectedTag}){
  return (
    <>
      {models.map((model) => {
        return (
          <ModelCard 
            key={model.title + model.url}
            image={model.image} 
            title={model.title} 
            url={model.url}
            tag={model.tag}
            size={model.size || "Unknown"}
          />
        );
      })}
    </>
  );
}

export default function ModelCards() {
  const { models, fetchModels } = useModelStore();
  const [selectedTag, setSelectedTag] = useState(null);
  const [tagCounts, setTagCounts] = useState({});

  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  useEffect(() => {
    setTagCounts(countCardsByTag(models));
  }, [models]);

  const totalCards = Object.keys(tagCounts).length > 0 ? Object.values(tagCounts).reduce((a: number, b: number) => a + b, 0) : 0;

  const uniqueTags = models.map(model => model.tag).filter((value, index, self) => self.indexOf(value) === index);

  return (
    <div className="model-recommend">
      <Space className='filters'>
        <div className={` ${selectedTag === null ? 'filter-type active' : 'filter-type'} `} onClick={() => setSelectedTag(null)}>
           {`All (${totalCards})`}
        </div>
        {
          uniqueTags.map(tag => (
            <div 
              key={tag}
              className={` ${selectedTag === tag ? 'filter-type active' : 'filter-type'} `}
              onClick={() => setSelectedTag(tag)}
            >
              {tag} ({tagCounts[tag] || 0})
            </div>
          ))
        }
      </Space>
      <div className='model-card-list'>
        <PageCard
          models={models.filter(model => !selectedTag || model.tag === selectedTag)}
          selectedTag={selectedTag}
        />
      </div>
    </div>
  );
}
