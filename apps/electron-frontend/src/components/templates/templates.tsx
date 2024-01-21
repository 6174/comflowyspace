import { useEffect, useState } from 'react';
import { Template, useTemplatesState } from './template-state';
import styles from './templates.style.module.scss';
import { Modal, message } from 'antd';
import { documentDatabaseInstance } from '@comflowy/common/storage';
import { openExternalURL, openTabPage } from '@/lib/electron-bridge';
import { useAppStore } from '@comflowy/common/store';

const Templates = () => {
  const {templates, onInit} = useTemplatesState();
  
  useEffect(() => {
    onInit();
  }, []);

  return (
    <div className={styles.templates}>
      <h2>Templates</h2>
      <p className="sub">Choose a template for creating your worklow</p>
      <div className="template-card-list">
        {templates.map((template) => {
          return <TemplateCard key={template.name} template={template} />
        })}
      </div>
    </div>
  )
}

function TemplateCard(props: {
  template: Template
}) {
  const [visible, setVisible] = useState(false);
  const handleVisibleChange = (visible: boolean) => {
    setVisible(visible);
  };
  const widgets = useAppStore(st => st.widgets);

  const handleOk = async () => {
    const {template} = props;
    try {
      const doc = await documentDatabaseInstance.createDocFromComfyUIData(template);
      openTabPage({
        name: doc.title,
        pageName: "app",
        query: `id=${doc.id}`,
        id: 0,
        type: "DOC"
      });
    } catch(err) {
      message.error("Unexpected error: " + err.message, 3);
    }
    handleVisibleChange(false);
  }

  const handleCancel = () => {
    handleVisibleChange(false);
  }

  const {template} = props;
  const image = (
    <div className="image" onClick={ev => {
      handleVisibleChange(true);
    }} style={{
      backgroundImage: `url(${template.thumbnail})`
    }}>
    </div>
  )
  return (
    <div className="template-card">
      <Modal
        title={template.name}
        open={visible}
        rootClassName={styles.templateModal}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        {template.thumbnail && image}
        {template.description 
          ? <p>{template.description} <a onClick={ev => {
            openExternalURL(template.reference_url)
          }}> Learn more </a></p> 
          : <p>Click ok to create a new workfow from {template.name}</p>
        }
        
      </Modal>
      {image}
      <div className="name">{template.name}</div>
    </div>
  )
}

export default Templates;
