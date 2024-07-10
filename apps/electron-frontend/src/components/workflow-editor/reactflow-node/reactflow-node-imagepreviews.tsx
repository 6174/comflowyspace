import { getImagePreviewUrl } from "@comflowy/common/comfyui-bridge/bridge";
import { PreviewImage } from "@comflowy/common/types";
import { PreviewGroupWithDownload } from "../reactflow-gallery/image-with-download";
import { Image } from 'antd';
import {memo} from "react";
import { VideoPreview } from "../reactflow-input/input-video-player-async";

export const NodeImagePreviews = memo(({ imagePreviews }: {
  imagePreviews: PreviewImage[]
}) => {
  const {images: imagePreviewsWithSrc, videos} = usePreviewImages(imagePreviews)

  return (
    <div className={`node-images-preview ${imagePreviews.length > 1 ? "multiple" : "single"}`} >
      <div className="inner">
        <PreviewGroupWithDownload images={imagePreviewsWithSrc}>
          {
            imagePreviewsWithSrc.map((image, index) => {
              return (
                <Image
                  key={image.src + index}
                  className="node-preview-image"
                  src={image.src}
                />
              )
            })
          }
        </PreviewGroupWithDownload>
        {videos.map((video, index) => {
          return (
            <div className="video-preview-card" key={video.src + index} style={{
              width: "100%",
              height: 300
            }}>
              <VideoPreview key={video.src + index} url={video.src} />
            </div>
          )
        })}
      </div>
    </div>
  )
});


export function usePreviewImages(imagePreviews: PreviewImage[]) {
  const imagePreviewsWithSrc = (imagePreviews || []).map((image, index) => {
    if (image.blobUrl) {
      return {
        src: image.blobUrl,
        filename: image.filename || "Untitled",
        image,
        isImage: true,
        isVideo: false
      }
    }
    const imageSrc = getImagePreviewUrl(image.filename, image.type, image.subfolder)
    const isVideo = image.filename.endsWith("mp4") || image.filename.endsWith("mov") || image.filename.endsWith("avi") || image.filename.endsWith("webm")
    const isImage = image.filename.endsWith("png") || image.filename.endsWith("jpg") || image.filename.endsWith("jpeg") || image.filename.endsWith("gif")
    return {
      src: imageSrc,
      filename: image.filename,
      image,
      isVideo,
      isImage
    }
  });

  const videos = imagePreviewsWithSrc.filter(img => {
    return img.isVideo;
  });

  const images = imagePreviewsWithSrc.filter(img => {
    return img.isImage;
  });

  return { mixed: imagePreviewsWithSrc, images, videos };

}
