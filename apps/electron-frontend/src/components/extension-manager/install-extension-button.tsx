import { useRemoteTask } from "@/lib/utils/use-remote-task";
import { getBackendUrl } from "@comflowy/common/config";
import { Extension, useExtensionsState } from "@comflowy/common/store/extension-state";
import { Button, message } from "antd";
import { useCallback } from "react";

export function InstallExtensionButton(props: {extension: Extension}) {
    const {extension} = props;
    const {onInit} = useExtensionsState()
    const {startTask, running, messages} = useRemoteTask({
        api: getBackendUrl(`/api/install_extension`),
        onMessage: async (msg) => {
            console.log(msg);
            if (msg.type === "SUCCESS") {
                await onInit();
                message.success("Extension installed successfully");
            } 
            
            if (msg.type === "FAILED") {
                message.error("Extension install failed: " + msg.message);
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
            <Button type="primary" loading={isLoading} onClick={ev => {
                if (!running) {
                    installExtension();
                }
            }}>Install</Button>
            {/* <div className="messages">
                {messages.map(message => <div key={message}>{message}</div>)}
            </div> */}
        </div>
    )
}