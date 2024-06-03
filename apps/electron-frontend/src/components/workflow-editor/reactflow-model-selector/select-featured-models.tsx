import { MarketModel, ModelType } from "@comflowy/common/types/model.types"
import { useModelState } from "@comflowy/common/store/model.state";
import { Button, Carousel, Modal, Progress, Space, Tag } from "antd";
import { useCallback, useState } from "react";
import { GlobalEvents, SlotGlobalEvent } from "@comflowy/common/utils/slot-event";
import {Image} from "antd";
import { CHECKPOINT_MODELS, LORA_MODELS } from "@comflowy/common/models/model-meta-defs";
import styles from "./reactflow-model-selector.style.module.scss";
import { ModelDownloadOrSelectButton } from "./select-or-download-model-button";
import { comfyElectronApi } from "@/lib/electron-bridge";
import CoverSvg from "../../my-workflows/default-workflow-cover.svg";

/**
 * 显示所有内部提供的模型
 * @returns 
 */
export function SelectFeaturedModels() {
  const types = useModelState(st => st.featuredModels.filters.types || [ModelType.Checkpoint])
  const hasCheckpoint = types.includes(ModelType.Checkpoint)
  const hasLora = types.includes(ModelType.LoRA)
  const modelDetail = useModelState(st => st.featuredModels.modelDetail);

  return (
    <div className={styles.curated_models}>
      <ModelFilters/>
      {hasCheckpoint && (
        <div className={styles.modelCardList}>
          {CHECKPOINT_MODELS.map(model => {
            return (
              <ModelCard model={model} key={model.filename}/>
            )
          })}
        </div>
      )}

      {hasLora && (
        <div className={styles.modelCardList}>
          {LORA_MODELS.map(model => {
            return (
              <ModelCard model={model} key={model.filename} />
            )
          })}
        </div>
      )}

      <Modal
        className={styles.civitai_models_detail_modal}
        title={modelDetail ? (
          <div className="text action" onClick={ev => {
            comfyElectronApi.openURL(modelDetail.reference)
          }}>
            {modelDetail.name} {modelDetail.meta?.size ? `(${modelDetail.meta.size})` : ""}
          </div>
        ): "Model detail"}
        open={!!modelDetail}
        onCancel={ev => {
          useModelState.getState().setFeaturedDetailPage();
        }}
        footer={null}
        width={800}>
        {modelDetail && <ModelDetailPage model={modelDetail}/>}
      </Modal>
    </div>
  )
}

function ModelDetailPage({model}: {model: MarketModel}) {
  const tags = [model.base_model, ...model.meta?.tags || []]
  return (
    <div className={styles.civitai_models_detail_page}>
      <div className="body">
        <div className="gallery">
          <Carousel arrows autoplay>
            {(model.meta?.image_urls || []).map(image => {
              return (
                <div className="slide" key={image}>
                  <Image src={image} />
                </div>
              )
            })}
          </Carousel>
        </div>
        <div className="description" dangerouslySetInnerHTML={{ __html: model.description }}>
        </div>
        <div className="metaInfo">
          <p><span>Size: {model.meta?.size}</span></p>
          <p><span>SHA256: {model.sha256}</span></p>
          <p><span>Reference: <a onClick={ev => {
            comfyElectronApi.openURL(model.reference)
          }}>{model.reference}</a> </span></p>
        </div>
        <div className="tags">
          {tags.map(tag => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </div>
      </div>
      <div className="footer">
        <div className="actions">
          <ModelDownloadOrSelectButton model={model} />
        </div>
      </div>
    </div>
  )
}

function ModelFilters() {
  const currentTags = useModelState.getState().featuredModels.filters.types || [ModelType.Checkpoint];
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
              useModelState.getState().updateFeaturedFilters({
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
  const img = imgs[0];
  return (
    <div className="model-card" onClick={() => {
      useModelState.getState().setFeaturedDetailPage(model)
    }}>
      <div className="model-card__gallery">
        {img ? <Image src={img} preview={false} /> : <Image src={CoverSvg.src} width={30} preview={false} />}
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
    </div>
  )
}