import { useEffect, useRef } from "react";
import styles from "./log-viewer.style.module.scss";
export type LogViewerProps = {
  messages: string[],
  oneline?: boolean
}
export function LogViewer(props: LogViewerProps) {
  const {messages = [], oneline = false} = props;
  if (messages.length === 0) {
    return null;
  }

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  useEffect(scrollToBottom, [messages]);
  
  return (
    <div className={styles.logViewer} >
      <div className="message-list">
        {messages.map((message, i) => (
          <div key={i} className="log-viewer-message">
            {message}
          </div>
        ))}
      </div>
      <div ref={messagesEndRef} />
    </div>
  )
}