import * as React from 'react'
import styles from "./my-workflows.style.module.scss";
import { useLiveQuery } from "dexie-react-hooks";
import { documentDatabaseInstance } from '@comflowy/common/local-storage';
import { Button, Space } from 'antd';
import {PlusIcon} from "ui/icons";

function MyWorkflowsPage() {
  const docs = useLiveQuery(async () => {
    return await documentDatabaseInstance.getDoclistFromLocal();
  });
  console.log("docs", docs);
  return (
    <div className={styles.myWorkflows}>
      <h1>My Workflows</h1>
      <WorkflowCreateBox/>
      <WorkflowList/>
    </div>
  )
}

function WorkflowCreateBox() {
  return (
    <div className="workflow-create-box">
      <Space>
        <Button className='icon-button'> <PlusIcon/> Create New</Button>
        <Button type="primary" className='icon-button'> <PlusIcon/> Create From Template</Button>
      </Space>
    </div>
  )
}

function WorkflowList() {
  return (
    <div className="workflow-list">
      Workflow List
    </div>
  )
}

export default MyWorkflowsPage;
