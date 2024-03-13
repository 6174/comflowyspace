import { MessageViewer } from "../message-viewer";
import { ComflowyConsoleLog } from "@comflowy/common/types";
import { openExternalURL } from '@/lib/electron-bridge';
import { Log } from './log';

/**
 * Log type for linear shape errors
 */
export function LogTypeLinearShapeError({log}: {log: ComflowyConsoleLog}) {
  return (
    <Log log={log} level="error" title="Using multiple different base models" className={`log-type-linear-shape-error`}>
      <div>
        Please switch all model files to the files from the same base model.
        For details on the solution, please check: 
        <a 
          onClick={() => openExternalURL("https://www.comflowy.com/blog/comflowy-faq#multiple-different-base-models")} 
          target="_blank"
        >Comflowy FAQ</a>
      </div>
    </Log>
  );
}