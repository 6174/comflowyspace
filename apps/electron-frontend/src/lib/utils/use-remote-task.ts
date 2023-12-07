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
    type: "RESULT" | "PROGRESS",
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

    const startTask = async (task: TaskProps) => {
        try {
            setRunning(true);
            const taskId = uuid();
            setTaskId(taskId);
            const res = await fetch(props.api ? props.api : getBackendUrl("/api/add_task"), {
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
        } catch(err) {
            setError(err);
            setRunning(false);
        }
    }

    const onMessage = useCallback((ev) => {
        const msg = JSON.parse(ev.data) as TaskEvent;
        props.onMessage && props.onMessage(msg);
        if (msg.type === "RESULT") {
            setSuccess(true);
            setResult(msg.data);
            if (msg.error) {
                setError(msg.error);
            }
            setRunning(false);
            getWebSocket().close();
        } else if (msg.type === "PROGRESS") {
            setProgress(msg.progress);
        }
        if (msg.message) {
            setMessages([
                ...messages,
                msg.message
            ]);
        }
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