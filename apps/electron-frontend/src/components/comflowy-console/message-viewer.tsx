/**
 * MessageViewer component  
 * @param props 
 * @returns 
 */
export function MessageViewer(props: {message: string}) {
  return (
    <div className="message-viewer">
      <pre >
        {props.message}
      </pre>
    </div>
  )
}