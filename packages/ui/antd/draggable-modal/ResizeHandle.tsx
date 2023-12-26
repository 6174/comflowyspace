import * as React from 'react'

export const ResizeHandle = (
    props: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>,
): React.ReactElement => (
    <div className="ant-design-draggable-modal-resize-handle" {...props}>
        <div className="ant-design-draggable-modal-resize-handle-inner" />
    </div>
)
