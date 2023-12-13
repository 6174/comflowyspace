import { uuid } from "@comflowy/common";
import config, { getBackendUrl } from "@comflowy/common/config";
import { useCallback, useEffect, useState } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";

export type TaskProps = {
    name: string,
    params?: any,
    [key: string]: any
}

export type TaskEvent = {
    type: "SUCCESS" | "PROGRESS" | "FAILED",
    task: TaskProps,
    progress?: number,
    message?: string,
    data?: any,
    error?: any
}

/**
 * use remote task
 * @param taskId 
 */
export function useRemoteTask(props: {
    onMessage?: (event: TaskEvent) => void,
    api?: string
} = {}) {
    const [running, setRunning] = useState(false);
    const [success, setSuccess] = useState(false);
    const [progress, setProgress] = useState(0);
    const [result, setResult] = useState(null);
    const [messages, setMessages] = useState([]);
    const [error, setError] = useState(null);
    const [socketUrl, setSocketUrl] = useState(null);
    const [taskId, setTaskId] = useState(null);

    useEffect(() => {
        if (taskId) {
          setSocketUrl(`ws://${config.host}/ws?clientId=${taskId}`);
        }
    }, [taskId]);

    const startTask = (task: TaskProps) => {
        try {
            setRunning(true);
            const taskId = uuid();
            setTaskId(taskId);
            setTimeout(() => {
                console.log("start task fetch");
                fetch(props.api ? props.api : getBackendUrl("/api/add_task"), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        data: {
                            ...task,
                            taskId
                        }
                    })
                });
            }, 100)
        } catch(err) {
            setError(err);
            setRunning(false);
        }
    }

    const onMessage = useCallback((ev) => {
        const msg = JSON.parse(ev.data) as TaskEvent;
        if (msg.type === "SUCCESS") {
            setSuccess(true);
            setResult(msg.data);
            if (msg.error) {
                setError(msg.error);
            }
            setRunning(false);
            getWebSocket().close();
        } else if (msg.type === "PROGRESS") {
            setProgress(msg.progress);
        } else if (msg.type === "FAILED") {
            console.log("FAILED", msg);
            setError(msg.error);
            setSuccess(false);
            setRunning(false);
            getWebSocket().close();
        }

        if (msg.message) {
            setMessages([
                ...messages,
                msg.message
            ]);
        }

        props.onMessage && props.onMessage(msg);
    }, [messages]);

    const { sendMessage, lastMessage, readyState, getWebSocket} = useWebSocket(socketUrl, {
        onMessage,
        onOpen: () => console.log('opened'),
        shouldReconnect: (closeEvent) => true,
    });

    const connectionStatus = {
        [ReadyState.CONNECTING]: 'Connecting',
        [ReadyState.OPEN]: 'Open',
        [ReadyState.CLOSING]: 'Closing',
        [ReadyState.CLOSED]: 'Closed',
        [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
      }[readyState];
      
    return {
        running,
        messages,
        success,
        result,
        error,
        progress,
        sendMessage,
        connectionStatus,
        startTask
    }
}