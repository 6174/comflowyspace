import { openTabPage } from '@/lib/electron-bridge';
import { readWorkflowFromFile, readWorkflowFromPng } from '@comflowy/common/comfyui-bridge/export-import';
import { PersistedWorkflowDocument, documentDatabaseInstance } from '@comflowy/common/storage/document-database';
import { useAppStore } from '@comflowy/common/store';
import { message } from 'antd';
import { useRouter } from 'next/router';
import React, { useState, useRef } from 'react';
import { ImageIcon } from 'ui/icons';


export const ImportWorkflow = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const widgets = useAppStore(st => st.widgets);

  const onFileSelected = async (file: File) => {
    console.log(selectedFile);
    try {
      let workflow: PersistedWorkflowDocument | null = null;
      if (file.type === 'image/png') {
        workflow = await readWorkflowFromPng(file, widgets);
      }
  
      if (file.type === 'application/json') {
        workflow = await readWorkflowFromFile(file, widgets);
      }

      if (workflow) {
        console.log("workflow: ", workflow);
        const doc = await documentDatabaseInstance.createDocFromData(workflow);
        openTabPage({
          name: doc.title,
          pageName: "app",
          query: `id=${doc.id}`,
          id: 0,
          type: "DOC"
        });
      }

    } catch(err) {
      console.log(err);
      message.error("Unexpected error: " + err.message, 3);
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
