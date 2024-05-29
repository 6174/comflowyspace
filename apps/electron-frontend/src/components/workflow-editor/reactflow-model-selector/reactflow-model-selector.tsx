import { GlobalEvents, SlotGlobalEvent } from "@comflowy/common/utils/slot-event";
import { Modal, Space, Tabs } from "antd";
import { use, useEffect, useState } from "react";
import { SelectHuggingfaceModels } from "./select-huggingface-models";
import { SelectCivitaiModels } from "./select-civitai-models";
import styles from "./reactflow-model-selector.style.module.scss";
import { SelectFeaturedModels } from "./select-featured-models";
import { useModelState } from "./reactflow-model.state";
import { ModelType } from "@comflowy/common/types/model.types";

export function ReactFlowModelSelector() {
  const types = useModelState(st => st.filters.types || [ModelType.Checkpoint])
  const hasCheckpoint = types.includes(ModelType.Checkpoint)
  const hasLora = types.includes(ModelType.LoRA)
  
  const [isModalVisible, setIsModalVisible] = useState(false);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const tabs = [{
    key: "featured",
    label: "Featured",
    children: <SelectFeaturedModels />
  }, {
    key: "civitai",
    label: "Civitai",
    children: <SelectCivitaiModels />
  }, {
    key: "huggingface",
    label: "Huggingface",
    disabled: true,
    children: <SelectHuggingfaceModels />
  }]

  const currentTab = useModelState(state => state.currentTab);

  useEffect(() => {
    SlotGlobalEvent.on((ev) => {
      if (ev.type === GlobalEvents.on_select_model) {
        const tab = ev.data.tab;
        useModelState.getState().onChangeContext(ev.data);
        if (tab) {
          useModelState.getState().onChangeTab(tab);
        }
        const civitai = ev.data.civitai;
        useModelState.getState().updateFilters({
          types: ev.data.types,
          query: ev.data.query
        });
        if (civitai) {
          useModelState.getState().updateCivitAIModelFilters(civitai);
        }
        useModelState.getState().loadCivitAIModels();
        showModal();
      }

      if (ev.type === GlobalEvents.on_close_model_selector) {
        useModelState.getState().onChangeContext(null);
        handleCancel();
      }
    })
  }, [])

  const $title = (
    <Space style={{
      lineHeight: "14px"
    }}>
      <span>{hasCheckpoint && "Select Checkpoint"} {hasLora && "Select LoRA"}</span>
    </Space>
  )

  return (
    <>
      <Modal title={$title} className={styles.modelSelector} open={isModalVisible} onOk={handleOk} onCancel={handleCancel} footer={null}>
        <div className="main">
          <Tabs defaultActiveKey="civitai" items={tabs} activeKey={currentTab} onChange={ev => {
            useModelState.getState().onChangeTab(ev as any);
          }}>
          </Tabs>
        </div>
      </Modal>
    </>
  )
}


