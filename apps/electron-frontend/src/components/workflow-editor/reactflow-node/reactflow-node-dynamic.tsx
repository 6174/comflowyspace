import { PreviewImage, Widget, WorkflowNodeRenderInfo } from "@comflowy/common/types";
import { NodeWrapperProps } from "./reactflow-node-wrapper";
import { Node } from "reactflow";
import { useAppStore } from "@comflowy/common/store";
import { NodeImagePreviews } from "./reactflow-node-imagepreviews";
import ImageCompare from "ui/image-compare/image-compare";
import { getImagePreviewUrl } from "@comflowy/common/comfyui-bridge/bridge";
/**
 * 动态渲染的部分内容
 * @param props 
 */
export function ReactFlowNodeDynamic(props: {
  node: NodeWrapperProps | Node,
  renderInfo: WorkflowNodeRenderInfo,
  imagePreviews?: PreviewImage[]
}) {
  const { renderInfo, node } = props;
  const {widget, params} = renderInfo;

  if (isImageCompareWidget(widget)) {
    return <ImageCompareWidget {...props}/>
  }

  return <NodeImagePreviews imagePreviews={props.imagePreviews || []} /> 
}

function isImageCompareWidget(widget: Widget): boolean {
  const name = widget.name;
  const compareWidgets = ["Image Comparer (rgthree)"];
  return compareWidgets.includes(name);
}

function ImageCompareWidget(props: {
  node: NodeWrapperProps | Node,
  renderInfo: WorkflowNodeRenderInfo,
  imagePreviews?: PreviewImage[]
}) {
  const imagePreviews = props.imagePreviews || [];
  console.log("image compare", imagePreviews);
  if (imagePreviews.length !== 2) {
    return null
  }
  const imagesWithSrc = imagePreviews.map((image, index) => {
    const imageSrc = getImagePreviewUrl(image.filename, image.type, image.subfolder)
    return {
      src: imageSrc,
      filename: image.filename
    }
  });
  const imageA = imagesWithSrc[0];
  const imageB = imagesWithSrc[1];
  return (
    <div className="compare-image-wrapper nodrag">
      <ImageCompare height={"auto"} leftImage={imageA.src} rightImage={imageB.src}/>
    </div>
  )
}
