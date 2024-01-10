import * as React from 'react'
import styles from "./my-workflows.style.module.scss";
import { PersistedFullWorkflow, documentDatabaseInstance } from '@comflowy/common/storage';
import { Button, Modal, Popover, Space, message } from 'antd';
import {PlusIcon, NewIcon, ImageIcon, TemplateIcon, DeleteIcon} from "ui/icons";
import { useRouter } from 'next/router';
import { openTabPage } from '@/lib/electron-bridge';
import { ImportWorkflow } from './import';

function MyWorkflowsPage() {

  return (
    <div className={styles.myWorkflows}>
      <WorkflowCreateBox/>
      <h2>My Workflows</h2>
      <WorkflowList/>
    </div>
  )
}

function WorkflowCreateBox() {
  const router = useRouter();
  const createNewDoc = React.useCallback(async (open: boolean = true) => {
    const doc = await documentDatabaseInstance.createDocFromTemplate();
    if (open) {
      openTabPage({
        name: doc.title,
        pageName: "app",
        query: `id=${doc.id}`,
        id: 0,
        type: "DOC"
      });
      message.success("Workflow created");
    }
  }, [router]);

  React.useEffect(() => {
    const disposable = SlotGlobalEvent.on((ev) => {
      if (ev.type === GlobalEvents.initial_launch) {
        createNewDoc(false);
      }
    });
    return () => {
      disposable.dispose();
    }
  }, []);

  return (
    <div className="workflow-create-box">
      <h2>Create New Workflow</h2>
      <p className="sub">Choose the method for creating your worklow</p>
      <Space>
        <div className="create-button" onClick={ev => {
          createNewDoc();
        }}>
          <div className="icon">
            <NewIcon/>
          </div>
          <div className="info">
            <div className="title">New workflow</div>
            <div className="description">Create default workflow</div>
          </div>
        </div>
        <ImportWorkflow/>
        <div className="create-button" onClick={() => {
          router.push("/templates");
        }}>
          <div className="icon">
            <TemplateIcon/>
          </div>
          <div className="info">
            <div className="title">Template</div>
            <div className="description">Select a template to start</div>
          </div>
        </div>
        {/* <Button className='icon-button' onClick={createNewDoc}> <PlusIcon/> Create New</Button>
        <Button type="primary" className='icon-button'> <PlusIcon/> Create From Template</Button> */}
      </Space>
    </div>
  )
}

import { Carousel } from 'antd';
import { getImagePreviewUrl } from '@comflowy/common/comfyui-bridge/bridge';
import { GalleryItem, PreviewImage } from '@comflowy/common/comfui-interfaces';
import { EllipsisOutlined } from '@ant-design/icons';
import { JSONDBClient } from '@comflowy/common/jsondb/jsondb.client';
import { GlobalEvents, SlotGlobalEvent } from '@comflowy/common/utils/slot-event';

function WorkflowList() {
  const docs = (JSONDBClient.useLiveJSONDB<PersistedFullWorkflow[]>({
    collectionName: "workflows",
    queryFn: async (): Promise<PersistedFullWorkflow[]> => {
      try {
        const docs = await documentDatabaseInstance.getDocs();
        return docs;
      } catch (err) {
        const message = err.message;
        if (message.includes("Collection not found")) {   
          SlotGlobalEvent.emit({
            type: GlobalEvents.initial_launch,
            data: null
          })
        } else {
          console.log(err);
        }
      }
      return [];
    }
  }) || []).filter(doc => !doc.deleted);
  

  const [modal, contextHolder] = Modal.useModal();
  return (
    <div className="workflow-list">
      {contextHolder}
      {docs.map((doc) => {
        const galleryImages = (doc.gallery || []).slice(0, 3).map((image: PreviewImage) => {
          return getImagePreviewUrl(image.filename, image.type, image.subfolder);
        });

        const openPage = () => {
          openTabPage({
            name: doc.title,
            pageName: "app",
            query: `id=${doc.id}`,
            id: 0,
            type: "DOC"
          });
        }

        const deleteItem = async () => {
          modal.confirm({
            title: 'Do you want to delete this item?',
            content: 'When clicked the OK button, this dialog will be closed after 1 second',
            onOk: async () => {
              const ret = await documentDatabaseInstance.deleteDocSoft(doc.id); 
            },
            onCancel() { },
          });
        }

        return (
          <div key={doc.id} className="workflow-list-item" onClick={openPage}>
            <div className="carousel-wrapper" onClick={ev => {
              if (galleryImages.length > 0) {
                ev.stopPropagation();
              }
            }} style={{height: 200}}>
              <Carousel>
                {galleryImages.map((image, index) => (
                  <div key={index} className='carousel-item'>
                    <div className="image-wrapper" 
                      onClick={ev => {
                        openPage();
                      }}
                      style={{
                        display: "flex",
                        width: "100%",
                        height: 200,
                        borderRadius: 4,
                        backgroundImage: `url(${image})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center"
                      }}>
                    </div>
                  </div>
                ))}
              </Carousel>
            </div>
            <div className="flex">
              <div className="title">
                {doc.title || "untitled"} 
              </div>
              <div className="action item-menu" onClick={ev => {
                ev.stopPropagation();
              }}>
                <Popover content={(
                  <div className={styles.popoverActions}>
                    <div className='action' onClick={ev => {
                      ev.stopPropagation();
                      deleteItem();
                    }}>
                      <DeleteIcon/> Remove
                    </div>
                  </div>
                )} title={null} >
                  <EllipsisOutlined/>
                </Popover>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}


export default MyWorkflowsPage;
