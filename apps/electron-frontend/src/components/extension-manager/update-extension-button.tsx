import config, { getBackendUrl } from "@comflowy/common/config";
import { Extension, useExtensionsState } from "@comflowy/common/store/extension-state";
import { Button, message } from "antd";
import { useCallback, useState } from "react";

export function UpdateExtensionButton(props: {extension: Extension}) {
    const {extension} = props;
    const [running, setRunning] = useState(false);
    const api = getBackendUrl("/api/update_extensions");
    const {onInit} = useExtensionsState()
    const action = useCallback(async () => {
        try {
            setRunning(true);
            const res = await fetch(api, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    extensions: [extension],
                }),
            });
            const ret = await res.json();
            if (ret.success) {
                message.success("Success");
                await onInit(false);
                setTimeout(() => {
                    onInit()
                }, 3000)
            } else {
                message.error(ret.error)
            }
        } catch(err) {
            message.error("Unexpected error: ", err);
        }
        setRunning(false);
    }, [extension]);

    if (!extension.need_update || extension.disabled) {
        return null
    }

    return (
        <div className="update-extension-button-wrapper">
            <Button loading={running} disabled={running} onClick={ev => {
                if (!running) {
                    action();
                }
            }}>Update</Button>
        </div>
    )
}