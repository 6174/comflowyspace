import React, { useCallback, useEffect, useState } from 'react';
import { UploadOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { Button, message, Upload , Image} from 'antd';
import { SDNode, Widget } from '@comflowy/common/comfui-interfaces';
import { useAppStore } from '@comflowy/common/store';
import { RcFile } from 'antd/es/upload';
import { getImagePreviewUrl, getUploadImageUrl } from '@comflowy/common/comfyui-bridge/bridge';
import ImgCrop from 'antd-img-crop';
import { ImageWithDownload } from '../reactflow-gallery/image-with-download';
import { AsyncImageEditor } from '../reactflow-context-menu/context-menu-item-edit-image/context-menu-item-edit-image-async';
const { Dragger } = Upload;


export function InputUploadImage({widget, node, id}: {
    widget: Widget,
    node: SDNode,
    id: string
}) {
    const onUpdateWidgets = useAppStore(st => st.onUpdateWidgets);
    const graph = useAppStore(st => st.graph);
    const onNodeFieldChange = useAppStore(st => st.onNodeFieldChange);
    const value = graph[id]?.fields.image;

    const onChange = useCallback(async (val) => {
        try {
            await onUpdateWidgets();
            onNodeFieldChange(id, 'image', val);
        } catch(err) {
            console.log(err);
        }
    }, [value]);

    const [previewImage, setPreviewImage] = useState(null);
    useEffect(() => {
        const imgsrc = getImagePreviewUrl(value);
        setPreviewImage(imgsrc);
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
        name: 'image',
        multiple: false,
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

    /**
     * onSave Image after edited
     * @param blob 
     */
    const onSave = async (blob: Blob) => {
        const formData = new FormData();
        formData.append('image', blob, `${node.fields.image.split(".")[0]}_${new Date().getTime()}.png`);
        const response = await fetch(getUploadImageUrl(), {
            method: 'POST',
            body: formData
        });
        const data = await response.json();
        if (response.ok) {
            onChange(data.name);
            message.success("Save successfully");
        } else {
            throw new Error("Save failed");
        }
    }

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
                {previewImage && <ImageWithDownload src={previewImage} fileName={'image'}/>}
            </div>
            <AsyncImageEditor id={id} node={node} onSave={onSave}/>
        </div>
    )
}

