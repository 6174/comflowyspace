import React, { useCallback, useEffect, useState } from 'react';
import { UploadOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { Button, message, Upload} from 'antd';
import { SDNode, Widget } from '@comflowy/common/types';
import { useAppStore } from '@comflowy/common/store';
import { RcFile } from 'antd/es/upload';
import { getImagePreviewUrl, getUploadImageUrl } from '@comflowy/common/comfyui-bridge/bridge';
import { ImageWithDownload } from '../reactflow-gallery/image-with-download';
import { AsyncVideoPlayer } from './input-video-player-async';

export function InputUploadVideo({widget, node, id}: {
    widget: Widget,
    node: SDNode,
    id: string
}) {
    const onUpdateWidgets = useAppStore(st => st.onUpdateWidgets);
    const graph = useAppStore(st => st.graph);
    const onNodeFieldChange = useAppStore(st => st.onNodeFieldChange);
    const value = graph[id]?.fields.video;
    const isGif = value?.endsWith(".gif");
    const onChange = useCallback(async (val) => {
        try {
            await onUpdateWidgets();
            onNodeFieldChange(id, 'video', val);
        } catch(err) {
            console.log(err);
        }
    }, [value]);

    const [previewImage, setPreviewImage] = useState<string>(null);
    useEffect(() => {
        if (value) {
            const parsedName = value.split("/");
            let imgsrc = getImagePreviewUrl(value);
            if (parsedName.length > 1) {
                imgsrc = getImagePreviewUrl(parsedName[1], "input", parsedName[0]);
            }
            setPreviewImage(imgsrc);
        }
    }, [value]);

    const customRequest = async ({file, onSuccess, onError}: any ) => {
        const formData = new FormData();
        formData.append('image', file as RcFile);
        try {
            const response = await fetch(getUploadImageUrl(), {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            if (response.ok) {
                console.log("data", data);
                onChange(data.name);
                onSuccess(data, file);
            } else {
                onError(data);
            }
        } catch(err) {
            onError(err);
        }
    }

    const props: UploadProps = {
        name: 'video',
        multiple: false,
        accept: "video/webm, video/mp4, video/mkv, image/gif",
        showUploadList: false,
        customRequest: customRequest,
        style: {
            width: "100%"
        },
        headers: {
            'X-Requested-With':null
        },
        onChange(info) {
          const { status } = info.file;
          if (status !== 'uploading') {
            console.log(info.file, info.fileList);
          }
          if (status === 'done') {
            message.success(`${info.file.name} file uploaded successfully.`);
          } else if (status === 'error') {
            message.error(`${info.file.name} file upload failed.`);
          }
        },
        onDrop(e) {
            console.log('Dropped files', e.dataTransfer.files);
        },
    };
    return (
        <div className='upload-image-wrapper'>
            <Upload {...props}>
                <Button style={{
                    fontSize: 10,
                    width: "100%",
                    display: "block"
                }} icon={<UploadOutlined />}>Click to Upload</Button>
            </Upload>
            <div className="image-preview" style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginTop: 10
            }}>
                {isGif && <ImageWithDownload
                    src={previewImage}
                    fileName={'image'}
                    editable={true}
                    editHandler={() => {
                        // 
                    }}
                />}
                {!isGif && previewImage && (
                    <AsyncVideoPlayer url={previewImage}/>
                )}
            </div>
        </div>
    )
}

