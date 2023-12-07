import { useRemoteTask } from "@/lib/utils/use-remote-task";
import config, { getBackendUrl } from "@comflowy/common/config";
import { Extension } from "@comflowy/common/store/extension-state";
import { Button, message } from "antd";
import { useCallback } from "react";

export function InstallExtensionButton(props: {extension: Extension}) {
    const {extension} = props;
    const {startTask, running, messages} = useRemoteTask({
        api: getBackendUrl(`/api/install_extension`),
        onMessage: (msg) => {
            console.log(msg);
            if (msg.type === "RESULT") {
                message.success("Extension installed successfully");
            }
        }
    });

    const isLoading = running;
    const installExtension = useCallback(() => {
        startTask({
            name: "installExtension",
            params: extension
        })
    }, [extension]);
    return (
        <div className="install-extension-button-wrapper">
            <Button loading={isLoading} onClick={ev => {
                if (!running) {
                    installExtension();
                }
            }}>Install</Button>
            <div className="messages">
                {messages.map(message => <div key={message}>{message}</div>)}
            </div>
        </div>
    )
}