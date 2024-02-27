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

  let $levelIcon = <InfoIcon/>
  switch (level) {
    case "warn":
      $levelIcon = <WarningIcon/>
      break;
    case "error":
      $levelIcon = <ErrorIcon/>
      break;
  }
  return (
    <div className={`log log-${level} ${open ? "open" : "close"} ${className || ""}`}>
      <div className="log-header">
        <div className="log-icon">{$levelIcon}</div>
        <div className="log-title">{title}</div>
        <div className="toggle" onClick={toggleOpen}>
          {/* <span className="icon">{open ? "-" : "+"}</span> */}
        </div>
      </div>
      <div className="log-content">
        {children}
      </div>
    </div>
  )
}

function InfoIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" clipRule="evenodd" d="M14 25C20.0751 25 25 20.0751 25 14C25 7.92487 20.0751 3 14 3C7.92487 3 3 7.92487 3 14C3 20.0751 7.92487 25 14 25ZM12.2963 10.1546C12.2963 9.51684 12.8133 8.99982 13.451 8.99982C14.0888 8.99982 14.6058 9.51684 14.6058 10.1546C14.6058 10.7924 14.0888 11.3094 13.451 11.3094C12.8133 11.3094 12.2963 10.7924 12.2963 10.1546ZM12.6008 20.3568C12.2968 20.2043 12.2654 19.8035 12.2967 19.4077L12.5045 12.9509C12.5433 12.4585 13.0198 12.1441 13.5138 12.1441C14.0078 12.1441 14.4903 12.5239 14.5292 13.0164L14.7104 19.4077C14.7417 19.8035 14.6987 20.2206 14.4267 20.3568C14.1552 20.493 13.8556 20.5639 13.5518 20.5639H13.4757C13.172 20.5639 12.8724 20.493 12.6008 20.3568Z" fill="#444657" />
    </svg>
  )
}

function WarningIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" clipRule="evenodd" d="M14 25C20.0751 25 25 20.0751 25 14C25 7.92487 20.0751 3 14 3C7.92487 3 3 7.92487 3 14C3 20.0751 7.92487 25 14 25ZM14.9131 7.7874C15.2681 7.96538 15.4798 8.34068 15.4485 8.73652L15.0095 15.1932C14.9706 15.6857 14.4942 16.0001 14.0002 16.0001C13.5062 16.0001 13.0237 15.6203 12.9848 15.1278L12.5519 8.73649C12.5206 8.34067 12.7323 7.96539 13.0872 7.7874C13.3588 7.65123 13.6584 7.58032 13.9621 7.58032H14.0382C14.342 7.58032 14.6416 7.65123 14.9131 7.7874ZM15.1548 18.1669C15.1548 18.8047 14.6378 19.3217 14 19.3217C13.3622 19.3217 12.8452 18.8047 12.8452 18.1669C12.8452 17.5291 13.3622 17.0121 14 17.0121C14.6378 17.0121 15.1548 17.5291 15.1548 18.1669Z" fill="#F4BD50" />
    </svg>
  )
}

function ErrorIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" clipRule="evenodd" d="M14 25C20.0751 25 25 20.0751 25 14C25 7.92487 20.0751 3 14 3C7.92487 3 3 7.92487 3 14C3 20.0751 7.92487 25 14 25ZM18.6143 10.6018C18.9467 10.2625 18.9411 9.71804 18.6018 9.38567C18.2625 9.0533 17.718 9.05891 17.3856 9.3982L13.9874 12.8672L10.5185 9.469C10.1792 9.13663 9.63466 9.14224 9.30229 9.48154C8.96992 9.82083 8.97553 10.3653 9.31483 10.6977L12.7838 14.0959L9.38562 17.5649C9.05325 17.9042 9.05887 18.4487 9.39816 18.781C9.73746 19.1134 10.282 19.1078 10.6143 18.7685L14.0125 15.2995L17.4815 18.6977C17.8208 19.0301 18.3653 19.0245 18.6977 18.6852C19.03 18.3459 19.0244 17.8014 18.6851 17.469L15.2161 14.0708L18.6143 10.6018Z" fill="#F26344" />
    </svg>
  )
}
