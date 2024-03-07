import { useRemoteTask } from "@/lib/utils/use-remote-task";
import { getBackendUrl } from "@comflowy/common/config";
import { Extension, useExtensionsState } from "@comflowy/common/store/extension-state";
import { Button, Input, Modal, Space, message } from "antd";
import { useCallback, useState } from "react";
import { start } from "repl";
import {KEYS, t} from "@comflowy/common/i18n";

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

export function InstallExtensionFromGitUrl() {
    const [visible, setVisible] = useState(false);
    const { onInit } = useExtensionsState()
    const showModal = () => {
        setVisible(true);
    };

    const handleCancel = useCallback(e => {
        setVisible(false);
    }, [setVisible]);

    const [url, setUrl] = useState("");
    const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUrl(e.target.value);
        // onTitleChange(e.target.value);
    };

    const { startTask, running, messages } = useRemoteTask({
        api: getBackendUrl(`/api/install_extension`),
        onMessage: async (msg) => {
            console.log(msg);
            if (msg.type === "SUCCESS") {
                await onInit();
                setVisible(false);
                message.success("Extension installed successfully");
            }

            if (msg.type === "FAILED") {
                message.error("Extension install failed: " + msg.message);
            }
        }
    });

    const handleOk = useCallback(() => {
        if (running) {
            return;
        }

        if (!url || url.trim() === "") {
            return message.warning("should input a valid github url");
        }

        startTask({
            name: "installExtension",
            params: {
                custom_extension: true,
                install_type: "git-clone",
                files: [url]
            }
        });
    }, [url]);

    return (
        <>
            <Modal 
                title={t(KEYS.installExtensionsFromGithub)} 
                open={visible}
                cancelText={t(KEYS.cancel)}
                onCancel={handleCancel}
                okButtonProps={{
                    loading: running,
                    disabled: running,
                }}
                okText={t(KEYS.install)}
                onOk={handleOk}
            >
                <Input value={url} style={{width: "100%"}} placeholder={t(KEYS.inputGithubUrl)} onChange={handleUrlChange} />
            </Modal>
            <Button size='small' onClick={() => {
                showModal();
            }}> 
                {t(KEYS.installFromGitUrl)}
            </Button>
        </>
    )
}