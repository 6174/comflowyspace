import styles from "./log-viewer.style.module.scss";
export type LogViewerProps = {
  messages: string[]
}
export function LogViewer(props: LogViewerProps) {
  return (
    <div className={styles.logViewer}>
      {props.messages.map((message, i) => (
        <div key={i} className="log-viewer-message">
          {message}
        </div>
      ))}
    </div>
  )
}