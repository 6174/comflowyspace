import { MarketModel, ModelType } from "@comflowy/common/types/model.types"
import { useModelState } from "@comflowy/common/store/model.state";
import { Button, Carousel, Space, Tag } from "antd";
import { useCallback, useState } from "react";
import { GlobalEvents, SlotGlobalEvent } from "@comflowy/common/utils/slot-event";
import {Image} from "antd";

const CHECKPOINT_MODELS = []
const LORA_MODELS = []
/**
 * 显示所有内部提供的模型
 * @returns 
 */
export function SelectFeaturedModels() {
  const types = useModelState(st => st.filters.types || [ModelType.Checkpoint])
  const hasCheckpoint = types.includes(ModelType.Checkpoint)
  const hasLora = types.includes(ModelType.LoRA)

  return (
    <div className="curated-models">
      <CivitAIModelFilter/>
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
export function CivitAIModelFilter() {
  const currentTags = useModelState.getState().filters.types || [];
  const tags = [ModelType.Checkpoint, ModelType.LoRA, ModelType.Controlnet, ModelType.Upscaler, ModelType.VAE]
  return (
    <div className="model-filter">
      <Space>
        {tags.map(tag => {
          const checked = currentTags.indexOf(tag) > -1
          return (
            <Tag.CheckableTag className={checked ? "active" : "inactive"} checked={checked} key={tag} onChange={checked => {
            }}>{tag}</Tag.CheckableTag>
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
        <Button type={"link"} className="model-card__button" onClick={selectModel}>Select</Button>
      </div>
    </div>
  )
}

