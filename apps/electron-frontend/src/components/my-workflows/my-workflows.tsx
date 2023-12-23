import * as React from 'react'
import styles from "./my-workflows.style.module.scss";
import { useLiveQuery } from "dexie-react-hooks";
import { documentDatabaseInstance } from '@comflowy/common/local-storage';
import { Button, Space, message } from 'antd';
import {PlusIcon, NewIcon, ImageIcon, TemplateIcon} from "ui/icons";
import { useRouter } from 'next/router';
import { openTabPage } from '@/lib/electron-bridge';
import { ImportWorkflow } from './import';

function MyWorkflowsPage() {

  return (
    <div className={styles.myWorkflows}>
      <WorkflowCreateBox/>
      <WorkflowList/>
    </div>
  )
}

function WorkflowCreateBox() {
  const router = useRouter();
  const createNewDoc = React.useCallback(async () => {
    const ret = await documentDatabaseInstance.createDocFromTemplate();
    message.success("Workflow created");
  }, [router]);

  return (
    <div className="workflow-create-box">
      <h2>Create New Workflow</h2>
      <p className="sub">Choose the method for creating your worklow</p>
      <Space>
        <div className="create-button" onClick={createNewDoc}>
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

function WorkflowList() {
  const router = useRouter();
  const docs = useLiveQuery(async () => {
    return await documentDatabaseInstance.getDoclistFromLocal();
  }) || [];
  console.log("docs", docs);
  return (
    <div className="workflow-list">
      <h2>My Workflows</h2>
      {docs.map(doc => {
        return (
          <div key={doc.id} className='workflow-list-item' onClick={ev => {
            // router.push(`/app/${doc.id}`)
            openTabPage({
              name: doc.title,
              pageName: "app",
              query: `id=${doc.id}`,
              id: 0,
              type: "DOC"
            });
          }} >
            <div className="gallery-card">
            </div>
            <div className='title'>
              {doc.title || "untitled"}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default MyWorkflowsPage;
