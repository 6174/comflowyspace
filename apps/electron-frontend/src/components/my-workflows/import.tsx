import { readWorkflowFromFile, readWorkflowFromPng } from '@comflowy/common/comfyui-bridge/export-import';
import { message } from 'antd';
import React, { useState, useRef } from 'react';
import { ImageIcon } from 'ui/icons';


export const ImportWorkflow = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onFileSelected = async (file: File) => {
    console.log(selectedFile);
    try {
      let workflow
      if (file.type === 'image/png') {
        workflow = await readWorkflowFromPng(file);
      }
  
      if (file.type === 'application/json') {
        workflow = await readWorkflowFromFile(file);
      }

      console.log(workflow);
      
    } catch(err) {
      message.error("Unexpected error: ", err.message);
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && (file.type === 'image/png' || file.type === 'application/json')) {
      setSelectedFile(file);
      onFileSelected(file);
    } else {
      setSelectedFile(null);
      onFileSelected(null);
    }
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className='create-button' onClick={handleButtonClick}>
      <div style={{ display: 'none' }}>
        <input ref={fileInputRef} type="file" accept="image/png,application/json" onChange={handleFileChange} />
      </div>
      <div className="icon">
          <ImageIcon/>
      </div>
      <div className="info">
        <div className="title">Import</div>
        <div className="description">Create from an image or JSON</div>
      </div>
    </div>
  );
}
