import { useAppStore } from "@comflowy/common/store";
import { Button, Input, Popover, Space } from "antd"
import IconDown from "ui/icons/icon-down";
import styles from "./reactflow-topleft-panel.style.module.scss";
import { useCallback, useEffect, useState } from "react";
export default function ReactflowTopLeftPanel() {
    return (
        <div className={styles.topLeftPanel}>
            <Space size={2}>
                <div className="action action-file-dropdown">
                    <span>File</span>
                    <span className="icon">
                        <IconDown style={{
                            transform: "scale(.8)",
                            opacity: .9
                        }}/>
                    </span>
                </div>
                <div className="spliter"></div>
                <ChangeTitle/>
                <UndoRedo/>
            </Space>
        </div>
    )
}

function ChangeTitle() {
    const initialTitle = useAppStore(st => st.persistedWorkflow?.title);
    const onDocAttributeChange = useAppStore(st => st.onDocAttributeChange);
    const [visible, setVisible] = useState(false);
    const [title, setTitle] = useState(initialTitle);
    const handleVisibleChange = (visible: boolean) => {
        setVisible(visible);
    };
    useEffect(() => {
        setTitle(initialTitle);
    }, [initialTitle])
    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(e.target.value);
        console.log("change title");
        // onTitleChange(e.target.value);
    };
    const handleTitleSubmit = useCallback(() => {
        console.log("change title");
        onDocAttributeChange({ 'title': title });
        handleVisibleChange(false);
    }, [title]);
    
    const content = (
        <div className="content">
            <Space>
                <Input value={title} onChange={handleTitleChange} />
                <Button type="primary" size="small" onClick={handleTitleSubmit}>Save</Button>
            </Space>
        </div>
    )

    return (
        <Popover
            content={content}
            title={null}
            trigger="click"
            open={visible}
            placement='bottom'
            onOpenChange={handleVisibleChange}
        >
            <div className="action action-file-name">
                {title || "Untitled"}
            </div>
        </Popover>
    );

}

export function UndoRedo() {
    const undoManager = useAppStore(st => st.undoManager);
    const onSyncFromYjsDoc = useAppStore(st => st.onSyncFromYjsDoc);
    const inActiveColor = '#1c1c1e54';
    const activeColor = '#1C1C1E';
    const canUndo = undoManager? undoManager.canUndo() : false;
    const canRedo = undoManager? undoManager.canRedo() : false;
    return (
        <Space>
            <div className="action action-undo" onClick={() => {
               undoManager.undo(); 
               onSyncFromYjsDoc();
            }}>
                <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    >
                    <path
                        d="M19.2171 14.5739C19.2171 11.5756 17.1981 9.50389 13.7779 9.50389H9.04687L7.30664 9.58676L8.625 8.47181L10.5385 6.6035C10.6892 6.46037 10.7871 6.27203 10.7871 6.02342C10.7871 5.54882 10.4556 5.20981 9.96596 5.20981C9.75502 5.20981 9.52148 5.30774 9.35575 5.46595L5.03906 9.72236C4.86579 9.8881 4.77539 10.1141 4.77539 10.3476C4.77539 10.5736 4.86579 10.7997 5.03906 10.9654L9.35575 15.2218C9.52148 15.38 9.75502 15.4779 9.96596 15.4779C10.4556 15.4779 10.7871 15.1389 10.7871 14.6643C10.7871 14.4157 10.6892 14.2349 10.5385 14.0843L8.625 12.2159L7.30664 11.1085L9.04687 11.1839H13.8156C16.2263 11.1839 17.5597 12.555 17.5597 14.5137C17.5597 16.4724 16.2263 17.9037 13.8156 17.9037H12.0527C11.5555 17.9037 11.2015 18.2804 11.2015 18.7399C11.2015 19.1995 11.5555 19.5762 12.0603 19.5762H13.8758C17.2358 19.5762 19.2171 17.5949 19.2171 14.5739Z"
                        fill={canUndo ? activeColor : inActiveColor}
                    />
                </svg>
            </div>
            <div className="action action-redo" onClick={() => {
               undoManager.redo(); 
               onSyncFromYjsDoc();           
             }}>
                <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                >
                <path
                    d="M4.77539 14.5739C4.77539 17.5949 6.7567 19.5762 10.1166 19.5762H11.9397C12.4445 19.5762 12.791 19.1995 12.791 18.7399C12.791 18.2804 12.4445 17.9037 11.9397 17.9037H10.1769C7.76618 17.9037 6.43276 16.4724 6.43276 14.5137C6.43276 12.555 7.76618 11.1839 10.1769 11.1839H14.9456L16.6858 11.1085L15.3675 12.2159L13.454 14.0843C13.3033 14.2349 13.2129 14.4157 13.2129 14.6643C13.2129 15.1389 13.5368 15.4779 14.034 15.4779C14.2374 15.4779 14.471 15.38 14.6367 15.2218L18.9534 10.9654C19.1267 10.7997 19.2171 10.5736 19.2171 10.3476C19.2171 10.1141 19.1267 9.8881 18.9534 9.72236L14.6367 5.46595C14.471 5.30774 14.2374 5.20981 14.034 5.20981C13.5368 5.20981 13.2129 5.54882 13.2129 6.02342C13.2129 6.27203 13.3033 6.46037 13.454 6.6035L15.3675 8.47181L16.6858 9.58676L14.9456 9.50389H10.2146C6.8019 9.50389 4.77539 11.5756 4.77539 14.5739Z"
                    fill={canRedo ? activeColor : inActiveColor}
                />
                </svg>
            </div>
        </Space>
    )
}