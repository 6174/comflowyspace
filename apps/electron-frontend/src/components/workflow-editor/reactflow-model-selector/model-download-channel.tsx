import { ModelDownloadChannelEvents } from "@comflowy/common/types/model.types";
import { use, useCallback, useEffect, useState } from "react"
import { useModelState } from "@comflowy/common/store/model.state";

import { GlobalEvents, SlotGlobalEvent } from "@comflowy/common/utils/slot-event";
import { message } from "antd";
import { createChannel } from "@comflowy/common/utils/channel.client";

export function ModelDownloadChannel(props: {
  runId: string
}) {
  const runId = props.runId;
  const updateDownloadInfo =  useModelState(st => st.updateDownloadInfo)
  const onInit = useModelState(st => st.onInit);
  const context = useModelState(st => st.selectContext);
  const onModelDownloadSuccess = useCallback(() => {
    console.log("onsuccess");
    message.success("Model download success, you can use the model now...");
    updateDownloadInfo(runId, {
      progress: 100,
      status: "success"
    });
    onInit();
    context?.onChange(useModelState.getState().downloadingTasks[runId].params);
    SlotGlobalEvent.emit({
      type: GlobalEvents.on_close_model_selector
    });

  }, [runId]);

  const onModelDownloadProgress = useCallback((ev) => {
    const ret = ev.data;
    console.log("progress", ret);
    if (ret && ret.downloaded) {
      updateDownloadInfo(runId, {
        progress: Math.floor((ret.downloaded / ret.total) * 10000)/100,
      });
    }
  }, [runId]);

  const onModelDownloadFailed = useCallback((ev) => {
    console.log("error message", ev)
    message.error("Model download failed, please contact us to get support." + ev.error);
    console.log("onfailed");
    updateDownloadInfo(runId, {
      status: "failed"
    });
  }, [runId]);

  useEffect(() => {
    if (runId && runId !== "") {
      const channel = createChannel(runId)
      channel.on(ModelDownloadChannelEvents.onModelDownloadProgress, onModelDownloadProgress)
      channel.on(ModelDownloadChannelEvents.onModelDownloadSuccess, onModelDownloadSuccess)
      channel.on(ModelDownloadChannelEvents.onModelDownloadFailed, onModelDownloadFailed)
      
      channel.subscribe();
      return () => {
        setTimeout(() => {
          channel.unsubscribe();
        }, 5000);
      }
    } else {
      console.log("unsubscribing to comfyui channel")
    }
  }, [runId, onModelDownloadProgress, onModelDownloadSuccess, onModelDownloadFailed])
  
  return (
    <></>
  )
}