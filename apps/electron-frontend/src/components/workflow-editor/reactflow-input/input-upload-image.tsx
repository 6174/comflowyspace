import React from 'react';
import { InboxOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { message, Upload } from 'antd';
import { Widget } from '@comflowy/common/comfui-interfaces';
import { useAppStore } from '@comflowy/common/store';
import { RcFile } from 'antd/es/upload';
import { getUploadImageUrl } from '@comflowy/common/comfyui-bridge/bridge';

const { Dragger } = Upload;


export function InputUploadImage({widget, id}: {
    widget: Widget,
    id: string
}) {
    const {graph, onPropChange} = useAppStore();
    const value = graph[id]?.fields.image;

    const customRequest = async ({file, onSuccess, onError}: any ) => {
        const formData = new FormData();
        formData.append('image', file as RcFile);
        const response = await fetch(getUploadImageUrl(), {
            method: 'POST',
            body: formData
        });
        const data = await response.json();
        if (response.ok) {
            console.log("data", data);
            onSuccess(data, file);
        } else {
            onError(data);
        }
    }

    const props: UploadProps = {
        name: 'image',
        multiple: false,
        showUploadList: false,
        customRequest: customRequest,
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
        <Dragger {...props}>
            <p className="ant-upload-drag-icon" style={{
                margin: "4px"
            }}>
                <InboxOutlined style={{
                    transform: 'scale(.6)'
                }}/>
            </p>
            <p className="ant-upload-hint" style={{
                padding: "0 10px",
                fontSize: 10
            }}>Click or drag file to this area to upload</p>
        </Dragger>
    )
}