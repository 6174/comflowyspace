import { ModelDownloadChannelEvents } from "@comflowy/common/types/model.types";
import { use, useCallback, useEffect, useState } from "react"
import { useModelState } from "@comflowy/common/store/model.state";

import { GlobalEvents, SlotGlobalEvent } from "@comflowy/common/utils/slot-event";
import { message } from "antd";
import { createChannel, getMainChannel } from "@comflowy/common/utils/channel.client";
import { IDisposable } from "xterm";

export function ModelDownloadChannel() {
  const updateDownloadInfo =  useModelState(st => st.updateDownloadInfo)
  const onModelDownloadSuccess = useCallback(({payload}) => {
    const {runId} = payload
    message.success("Model download success, you can use the model now...");
    updateDownloadInfo(runId, {
      progress: 100,
      status: "success"
    });
    SlotGlobalEvent.emit({
      type: ModelDownloadChannelEvents.onModelDownloadSuccess,
      data: payload
    })
  }, []);

  const onModelDownloadProgress = useCallback(({payload}) => {
    const {data, runId} = payload;
    console.log("progress", data);
    if (data && data.downloaded) {
      updateDownloadInfo(runId, {
        progress: Math.floor((data.downloaded / data.total) * 10000)/100,
        status: "downloading"
      });
    }
  }, []);

  const onModelDownloadFailed = useCallback((payload) => {
    const {error, runId} = payload;
    message.error("Model download failed, please contact us to get support." + error);
    console.log("onfailed");
    updateDownloadInfo(runId, {
      status: "failed"
    });
    SlotGlobalEvent.emit({
      type: ModelDownloadChannelEvents.onModelDownloadFailed,
      data: payload
    })
  }, []);

  useEffect(() => {
    const channel = getMainChannel();
    const disposables: IDisposable[] = [];
    disposables.push(channel.on(ModelDownloadChannelEvents.onModelDownloadProgress, onModelDownloadProgress));
    disposables.push(channel.on(ModelDownloadChannelEvents.onModelDownloadSuccess, onModelDownloadSuccess));
    disposables.push(channel.on(ModelDownloadChannelEvents.onModelDownloadFailed, onModelDownloadFailed));
    return () => {
      disposables.forEach(d => d.dispose());
    }
  }, [])

  return (
    <></>
  )
}