import { Segmented } from "antd";
import styles from "./reactflow-share.module.scss";
/**
 * ReactFlow Share Panel
 */
export function ReactFlowShare() {
  return (
    <div className={styles.reactflowShare}>
      <Segmented options={["Subflow", "App", 'API']} block/>
    </div>
  )
}