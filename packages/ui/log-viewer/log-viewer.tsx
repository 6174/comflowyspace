import styles from "./log-viewer.style.module.scss";
export type LogViewerProps = {
  messages: string[]
}
export function LogViewer(props: LogViewerProps) {
  const {messages = []} = props;
  if (messages.length === 0) {
    return null;
  }
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