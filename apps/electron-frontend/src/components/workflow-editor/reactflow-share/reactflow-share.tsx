import { Segmented } from "antd";
import styles from "./reactflow-share.module.scss";
import { useState } from "react";
import { ShareAsSubflow } from "./react-share-subflow";
import { ShareAsApp } from "./react-share-app";
import { ShareAsApi } from "./react-share-api";
/**
 * ReactFlow Share Panel
 */
export function ReactFlowShare() {
  const [currentTab, setCurrentTab] = useState("SUBFLOW");
  return (
    <div className={styles.reactflowShare}>
      <Segmented value={currentTab} onChange={val => {
        setCurrentTab(val.toString())
      }} options={["SUBFLOW", "APP", 'API']} block/>
      <div className="content">
        {currentTab === "SUBFLOW" && <ShareAsSubflow/>}
        {currentTab === "APP" && <ShareAsApp />}
        {currentTab === "API" && <ShareAsApi />}
      </div>
    </div>
  )
}