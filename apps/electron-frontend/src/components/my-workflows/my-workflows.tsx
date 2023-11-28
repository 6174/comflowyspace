import * as React from 'react'
import styles from "./my-workflows.style.module.scss";

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
  return (
    <div className="workflow-create-box">
      Workflow List
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
