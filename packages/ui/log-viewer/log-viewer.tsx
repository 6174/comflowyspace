import styles from "./log-viewer.style.module.scss";
export type LogViewerProps = {
  messages: string[],
  oneline: boolean
}
export function LogViewer(props: LogViewerProps) {
  const {messages = [], oneline} = props;
  if (messages.length === 0) {
    return null;
  }

  return (
    <div className={styles.logViewer + " " + oneline ? styles.oneline : ""}>
      {
        oneline ? (
          <div key="oneline" className="log-viewer-message">
            {messages[messages.length - 1]}
          </div>
        ) : (
          <div className="message-list">
            {messages.map((message, i) => (
              <div key={i} className="log-viewer-message">
                {message}
              </div>
            ))}
          </div>
        )
      }
    </div>
  )
}