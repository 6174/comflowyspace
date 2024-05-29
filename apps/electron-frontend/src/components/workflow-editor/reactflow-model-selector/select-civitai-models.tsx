import { use, useCallback, useEffect, useRef, useState } from "react"
import { useModelState } from "./reactflow-model.state";
import InfiniteScroll from "ui/infinite-scroller";
import { CivitAIModel, MarketModel, ModelType, getFilePathFromMarktModel, turnCivitAiModelToMarketModel } from "@comflowy/common/types/model.types";
import { Button, Carousel, Input, Progress, Select, Space, Tag, message } from "antd";
import { ArrowLeftIcon, SearchIcon } from "ui/icons";
import { Image } from "antd/lib";
import { debug } from "console";
import { ModelDownloadChannel } from "./model-download-channel";
import { GlobalEvents, SlotGlobalEvent } from "@comflowy/common/utils/slot-event";
import { find } from "lodash";

export function SelectCivitaiModels() {
  const civitai = useModelState(state => state.civitai);
  const models = civitai.models || [];
  const hasMoreDocs = civitai.hasMorePage;
  const scrollContainer = useRef(null);
  const loadCivitAIModels = useModelState(state => state.loadCivitAIModels);
  const loadMoreData = useCallback(() => {
    loadCivitAIModels();
  }, []);

  const modelDetail = useModelState(state => state.civitai.modelDetail);
  const [target, setTarget] = useState(null);
  useEffect(() => {
    setTarget(scrollContainer.current);
  }, [scrollContainer.current])

  return (
    <div className="civitai-models-list-page">
      {modelDetail && <CivitModelDetailPage />}
      <div style={{
        height: "100%",
        overflowY: modelDetail ? "hidden" : "auto",
        overflowX: "hidden",
        visibility: modelDetail ? "hidden" : "visible"
      }} ref={scrollContainer}>
          <CivitAIModelFilter />
          <InfiniteScroll
            scrollableTarget={target}
            dataLength={models.length}
            next={loadMoreData}
            hasMore={hasMoreDocs}
            loader={
              <div className='workflow-list-item'>
                <div className='carousel-wrapper'>
                </div>
                <div className="load-text">
                  Loading...
                </div>
              </div>
            }
            endMessage={
              <div className="load-text">

              </div>
            }
          >
            {models.map((model) => <ModelCardItem model={model} key={model.id} />)}
          </InfiniteScroll>
      </div>
    </div>
  )
}

export function CivitAIModelFilter() {
  const changeFilter = useModelState(state => state.updateCivitAIModelFilters);
  const searchValue = useModelState(state => state.civitai.filters.query || "");
  const currentTags = useModelState.getState().civitai.filters.types || [];
  const onSearchCivitAI = useModelState(state => state.onSearchCivitAI);
  const [searching, setSearching] = useState(false);
  const handleSearch = useCallback(async () => {
    setSearching(true);
    try {
      await onSearchCivitAI();
    } catch(err) {
      console.error(err);
    }
    setSearching(false);
  }, [])

  const tags = [ModelType.Checkpoint, ModelType.LoRA, ModelType.Controlnet, ModelType.Upscaler, ModelType.VAE]

  return (
    <div className="model-filter">
      <div className="search">
        <div className="search-box">
          <Input
            prefix={<SearchIcon />}
            onChange={ev => {
              changeFilter({query: ev.target.value})
            }}
            onPressEnter={ev => {
              handleSearch();
            }}
            placeholder="Search models"
            value={searchValue}
          />
        </div>
        <Button loading={searching} disabled={searching} type="primary" size="small" onClick={ev => {
          handleSearch();
        }}>Search</Button>
      </div>
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


export function ModelCardItem(props: {
  model: CivitAIModel
}) {
  const { model } = props;
  const setCivitModelDetailPage = useModelState(state => state.setCivitModelDetailPage);
  return (
    <div className="model-card-item" onClick={ev => {
      setCivitModelDetailPage(model);
    }}>

      <div className="gallery">
        <Image preview={false} src={model.modelVersions[0].images.filter(image => image.nsfwLevel < 5)[0]?.url} />
      </div>
      <div className="model-card-item-header">
        <div className="model-card-item-header-title">
          {model.name}
        </div>
      </div>
      <div className="model-card-item-body">
        <div className="model-card-item-body-description">
          {/* {model.description} */}
        </div>
        <div className="model-card-item-body-tags">
          <Tag key="base-model" color="var(--primaryColor)">{model.modelVersions[0].baseModel}</Tag>
          <Tag key="base-model-type">{model.modelVersions[0].baseModelType}</Tag>
          {model.tags.map(tag => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </div>
      </div>
      <div className="model-card-item-footer">
        <Button type="link" size="small">Select</Button>
      </div>
    </div>
  )
}

export function CivitModelDetailPage() {
  const model = useModelState(state => state.civitai.modelDetail);
  const [modelVersion, setModelVersion] = useState(model?.modelVersions[0].id);
  const [selecting, setSelecting] = useState(false);
  const downloadInfo = useModelState(state => {
    const taskId = state.modelTaskMap[model.id];
    return state.downloadingTasks[taskId];
  });

  const modelVersionData = model?.modelVersions.find(version => version.id === modelVersion);

  const onChange = useModelState(st => st.selectContext?.onChange);
  const handleSelect = useCallback(async () => {
    setSelecting(true);
    try {
      const modelData = turnCivitAiModelToMarketModel(model, modelVersionData)
      const input = useModelState.getState().selectContext?.input;
      const { withHashPath, withOutHashPath } = getFilePathFromMarktModel(modelData);
      const options = input[0] as string[];
      const finded = options.find(option => {
        return option === withHashPath || option === withOutHashPath;
      });

      if (finded) {
        onChange(modelData);
        SlotGlobalEvent.emit({
          type: GlobalEvents.on_close_model_selector
        });
        return;
      }

      const runId = model.id + "";
      const response = await fetch("/api/models/install-model", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          runId,
          model: modelData
        })
      });
      const json = await response.json();
      console.log(json);
      if (json.status === "exist") {
        onChange(modelData)
        SlotGlobalEvent.emit({
          type: GlobalEvents.on_close_model_selector
        });
      } else if (json.status === "downloading") {
        message.info("Model download started...");
        useModelState.getState().updateDownloadInfo(runId, {
          taskId: runId,
          model,
          params: modelData,
          progress: 0,
          status: "downloading"
        });
      } else {
        message.error("Select model failed, please contact us to get support.");
      }

    } catch(err) {
      console.error(err);
    }
    setSelecting(false);
  }, [modelVersionData, model, onChange]);

  if (!model) return null;

  return (
    <div className="civit-model-detail-page">
      <div className="header">
        <div className="header-title">
          <Space>
            <div className="icon action" onClick={ev => {
              useModelState.getState().setCivitModelDetailPage();
            }}>
              <ArrowLeftIcon/>
            </div>
            <div className="action" onClick={ev => {
              window.open(`https://civitai.com/models/${model.id}`, "_blank")
            }}>
              {model.name}
            </div>
          </Space>
        </div>
      </div>     
      <div className="body">
        <div className="gallery">
          <Carousel arrows autoplay>
            {model.modelVersions[0].images.filter(image => image.nsfwLevel < 5).map(image => {
              return (
                <div className="slide" key={image.id}>
                  <Image src={image.url} />
                </div>
              )
            })}
          </Carousel>
        </div>
        <div className="description" dangerouslySetInnerHTML={{__html: model.description}}>
        </div>
        <div className="tags">
          {model.tags.map(tag => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </div>
      </div>
      <div className="footer">
        <div className="select-model">
          <Select placeholder="Select Model Version" value={modelVersion} popupMatchSelectWidth={false} style={{width: 200}} onChange={ev => {
            setModelVersion(ev);
          }}>
            {model.modelVersions.map(version => {
              const sizeMB = Math.floor((version.files[0].sizeKB || 0) / 1024);
              const sizeGB = sizeMB / 1024;
              const sizeStr = sizeGB > 1 ? `${sizeGB.toFixed(2)} GB` : `${sizeMB} MB`;

              return (
                <Select.Option key={version.id} value={version.id}>{version.name + `(${sizeStr})`}</Select.Option>
              )
            })}
          </Select>
        </div>
        <div className="actions">
          {
            (downloadInfo && downloadInfo.status === "downloading") ? (
              <Progress percent={downloadInfo.progress} />
            ) : (
              <Button type = "primary" loading={selecting} disabled={selecting} onClick={ handleSelect }>Select</Button>
            )
          }
        </div>
      </div>
      <ModelDownloadChannel runId={downloadInfo?.taskId}/>
    </div>
  )
}
