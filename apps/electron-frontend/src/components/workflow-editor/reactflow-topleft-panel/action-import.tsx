import { PersistedWorkflowDocument } from '@comflowy/common/comfui-interfaces';
import { readWorkflowFromFile, readWorkflowFromPng } from '@comflowy/common/comfyui-bridge/export-import';
import { useAppStore } from '@comflowy/common/store';
import { message } from 'antd';
import React, { useState, useRef } from 'react';

export const ImportWorkflow = () => {
  const onResetFromPersistedWorkflow = useAppStore(st => st.onResetFromPersistedWorkflow);
  const [setSelectedFile] = useState<File | null>(null);
  const persistedWorkflow = useAppStore(st => st.persistedWorkflow);
  const resetWorkflowEvent = useAppStore(st => st.resetWorkflowEvent);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const widgets = useAppStore(st => st.widgets);

  const onFileSelected = async (file: File) => {
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
        onResetFromPersistedWorkflow(
          {
            ...workflow,
            id: persistedWorkflow.id,
            title: persistedWorkflow.title
          }
        )
        resetWorkflowEvent.emit(null)
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
    event.target.value = null;
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div onClick={handleButtonClick}>
      <div style={{ display: 'none' }}>
        <input ref={fileInputRef} type="file" accept="image/png,application/json" onChange={handleFileChange} />
      </div>
      <div className="name">Reset via file</div>
    </div>
  );
}
