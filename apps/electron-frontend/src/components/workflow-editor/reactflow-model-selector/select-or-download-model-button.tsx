import { getBackendUrl } from "@comflowy/common/config";
import { useModelState } from "@comflowy/common/store/model.state";
import { MarketModel, getFilePathFromMarktModel } from "@comflowy/common/types/model.types";
import { Button, Progress, message } from "antd";
import React, { useCallback, useState } from "react";
import { ModelDownloadChannel } from "./model-download-channel";
import { GlobalEvents, SlotGlobalEvent } from "@comflowy/common/utils/slot-event";

export function ModelDownloadOrSelectButton(props: {
  model: MarketModel,
  text?: React.ReactNode 
}) {
  const model = props.model
  const uuid = model?.id || model.filename;
  const downloadInfo = useModelState(state => {
    const taskId = state.modelTaskMap[uuid];
    return state.downloadingTasks[taskId];
  });
  const [selecting, setSelecting] = useState(false);
  const onChange = useModelState(st => st.selectContext?.onChange);
  const handleSelect = useCallback(async () => {
    const selectMode = !!onChange
    try {
      const { withHashPath, withOutHashPath } = getFilePathFromMarktModel(model);
      if (selectMode) {
        const input = useModelState.getState().selectContext?.input;
        const options = input[0] as string[];
        const finded = options.find(option => {
          return option === withHashPath || option === withOutHashPath;
        });

        if (finded) {
          onChange(model);
          SlotGlobalEvent.emit({
            type: GlobalEvents.on_close_model_selector
          });
          return;
        }
      }
      const response = await fetch(getBackendUrl("/api/install_model"), {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          runId: uuid,
          model
        })
      });
      const json = await response.json();
      if (json.status === "exist") {
        message.info("Model already exist, you can use it now...");
      } else if (json.status === "downloading") {
        useModelState.getState().updateDownloadInfo(uuid, {
          taskId: uuid,
          params: model,
          progress: 0,
          status: "downloading"
        });
        message.info("Model download started...");
      } else {
        message.error("Select model failed.");
      }
    } catch (err) {
      message.error("Select model failed.");
    }
  }, [model, uuid]);

  const onInit = useModelState(st => st.onInit);
  const context = useModelState(st => st.selectContext);
  const onSuccessHandler = useCallback(async () => {
    onInit();
    context?.onChange(useModelState.getState().downloadingTasks[uuid].params);
  }, [uuid])

  const onFailedHandler = useCallback(async () => {
    message.error("Model download failed.");
  }, [])

  return (
    <>
      {
        (downloadInfo && downloadInfo.status === "downloading") ? (
          <Progress percent={downloadInfo.progress} />
        ) : (
          <Button type="primary" size="small" loading={selecting} disabled={selecting} onClick={handleSelect}>{props.text || "Download"}</Button>
        )
      }
    </>
  )
}

