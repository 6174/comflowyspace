import { useAppStore } from "@comflowy/common/store";
import { NodeMenuProps } from "./types";
import { DownloadOutlined } from "@ant-design/icons";
import { useCallback } from "react";
import { message } from "antd";
import {downloadFile, downloadImagesAsZip} from "@comflowy/common/utils/download-helper";
import { getImagePreviewUrl } from "@comflowy/common/comfyui-bridge/bridge";
import { usePreviewImages } from "../reactflow-node/reactflow-node-imagepreviews";

export function SaveImageMenuItem(props: NodeMenuProps) {
  const {id, node} = props;
  const st = useAppStore.getState()
  const images = st.graph[id]?.images || [];
  if (images.length === 0) {
    return null;
  }
  const {mixed: imageWithPreview} = usePreviewImages(images)
  const doDownload = useCallback(async () => {
    try {
      if (imageWithPreview.length === 1) {
        await downloadFile(imageWithPreview[0].src, imageWithPreview[0].filename)
      } else {
        await downloadImagesAsZip(imageWithPreview);
      }
      props.hide();
    } catch(err) {
      message.error("Download images failed: " + err.message);
      console.error(err);
    }
    message.success("Download success");
  }, [imageWithPreview]) 

  return (
    <div className="context-menu-item-edit-image ">
      <div className="menu-item-title" onClick={ev => { 
        doDownload()
      }}><DownloadOutlined />Download Images</div>
    </div>
  )
}

export function shouldShowSaveImageNode(id: string) {
  const st = useAppStore.getState()
  const images = st.graph[id]?.images || [];
  return images.length > 0
}
