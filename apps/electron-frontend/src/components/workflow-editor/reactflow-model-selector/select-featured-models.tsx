import { MarketModel, ModelType } from "@comflowy/common/types/model.types"
import { useModelState } from "@comflowy/common/store/model.state";
import { Button, Carousel, Progress, Space, Tag } from "antd";
import { useCallback, useState } from "react";
import { GlobalEvents, SlotGlobalEvent } from "@comflowy/common/utils/slot-event";
import {Image} from "antd";
import { CHECKPOINT_MODELS, LORA_MODELS } from "@comflowy/common/models/model-meta-defs";
import styles from "./reactflow-model-selector.style.module.scss";
import { ModelDownloadOrSelectButton } from "./select-or-download-model-button";
/**
 * 显示所有内部提供的模型
 * @returns 
 */
export function SelectFeaturedModels() {
  const types = useModelState(st => st.filters.types || [ModelType.Checkpoint])
  const hasCheckpoint = types.includes(ModelType.Checkpoint)
  const hasLora = types.includes(ModelType.LoRA)
  return (
    <div className={styles.curated_models}>
      <ModelFilters/>
      {hasCheckpoint && (
        <div className="model-list">
          {CHECKPOINT_MODELS.map(model => {
            return (
              <ModelCard model={model} key={model.filename}/>
            )
          })}
        </div>
      )}

      {hasLora && (
        <div className="model-list">
          {LORA_MODELS.map(model => {
            return (
              <ModelCard model={model} key={model.filename} />
            )
          })}
        </div>
      )}
    </div>
  )
}


export function ModelFilters() {
  const currentTags = useModelState.getState().filters.types || [ModelType.Checkpoint];
  const tags = [ModelType.Checkpoint, ModelType.LoRA, ModelType.Controlnet, ModelType.Upscaler, ModelType.VAE]
  return (
    <div className="model-filter">
      <Space>
        {tags.map(tag => {
          const checked = currentTags.indexOf(tag) > -1
          return (
            <span className={`filter-type ${checked ? "active" : "inactive"}`} key={tag} onClick={ev => {
              // const tags = checked ? [...currentTags, tag] : currentTags.filter(t => t !== tag);
              const tags = checked ? [] : [tag]
              useModelState.getState().updateFilters({
                types: tags
              })
            }}>{tag}</span>
          )
        })}
      </Space>
    </div>
  )
}

function ModelCard(props: {
  model: MarketModel
}) {
  const model = props.model;
  const onChange = useModelState(st => st.selectContext?.onChange);
  const selectModel = useCallback(() => {
    onChange(model.filename);
    SlotGlobalEvent.emit({
      type: GlobalEvents.on_close_model_selector
    });
  }, [onChange, model]);

  const imgs = model.meta?.image_urls ?? (model.meta.image_url ? [model.meta.image_url] : []);

  return (
    <div className="model-card">
      <div className="model-card__gallery">
        <Carousel arrows autoplay>
          {imgs.map(image => {
            return (
              <div className="slide" key={image}>
                <Image src={image} />
              </div>
            )
          })}
        </Carousel>
      </div>
      <div className="model-card__header">
        <div className="model-card__title">
          <span className="action" onClick={ev => {
            window.open(model.reference, "_blank");
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
      <div className="model-card__footer">
        <ModelDownloadOrSelectButton model={model}/>
      </div>
    </div>
  )
}