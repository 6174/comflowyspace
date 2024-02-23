import { ComflowyConsoleLogLevel } from "@comflowy/common/types/comflowy-console.types";
import { PropsWithChildren, ReactElement, useState } from "react";

/**
 * log
 * @param param0 
 */
export function Log({ level, title, children, className}: { 
  level: ComflowyConsoleLogLevel;
  title: string;
  className?: string
} & PropsWithChildren) {
  const [open, setOpen] = useState(false);
  const toggleOpen = () => setOpen(!open);
  return (
    <div className={`log log-${level} ${open ? "open" : "close"} ${className || ""}`}>
      <div className="log-header">
        <div className="log-icon">{title}</div>
        <div className="log-title">{level}</div>
        <div className="toggle" onClick={toggleOpen}>
          <span className="icon">{open ? "-" : "+"}</span>
        </div>
      </div>
      <div className="log-content">
        {children}
      </div>
    </div>
  )
}