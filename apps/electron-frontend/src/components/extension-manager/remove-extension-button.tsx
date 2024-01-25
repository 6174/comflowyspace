import config, { getBackendUrl } from "@comflowy/common/config";
import { Extension, useExtensionsState } from "@comflowy/common/store/extension-state";
import { Button, message } from "antd";
import { useCallback, useState } from "react";

export function RemoveExtensionButton(props: {extension: Extension}) {
    const {extension} = props;
    const disabled = extension.disabled
    const {onInit} = useExtensionsState()
    const [running, setRunning] = useState(false);
    const api = getBackendUrl("/api/remove_extensions");
    const removeExtension = useCallback(async () => {
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
                setRunning(false);
                await onInit();
            } else {
                message.error(ret.error)
            }
        } catch(err) {
            message.error("Unexpected error: ", err);
        }
        setRunning(false);
    }, [extension]);

    if (!extension.installed) {
        return null
    }

    return (
        <div className="remove-extension-button-wrapper">
            <Button loading={running} disabled={running} onClick={ev => {
                if (!running) {
                    removeExtension();
                }
            }}>Remove</Button>
        </div>
    )
}