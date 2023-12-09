import * as React from 'react'
import styles from "./my-workflows.style.module.scss";
import { useLiveQuery } from "dexie-react-hooks";
import { documentDatabaseInstance } from '@comflowy/common/local-storage';
import { Button, Space, message } from 'antd';
import {PlusIcon} from "ui/icons";
import { useRouter } from 'next/router';
import { openTabPage } from '@/lib/electron-bridge';

function MyWorkflowsPage() {

  return (
    <div className={styles.myWorkflows}>
      <h1>My Workflows</h1>
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
      <Space>
        <Button className='icon-button' onClick={createNewDoc}> <PlusIcon/> Create New</Button>
        <Button type="primary" className='icon-button'> <PlusIcon/> Create From Template</Button>
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
      {docs.map(doc => {
        return (
          <div key={doc.id} className='workflow-list-item'>
            <div className='title'>
              {doc.title || "untitled"}
            </div>
            <div className='actions'>
              <Button onClick={ev => {
                // router.push(`/app/${doc.id}`)
                openTabPage({
                  name: doc.title,
                  pageName: "app",
                  query: `id=${doc.id}`,
                  id: 0,
                  type: "DOC"
                });
              }}>Edit</Button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default MyWorkflowsPage;
