import config, { getBackendUrl } from "@comflowy/common/config";
import { Extension, useExtensionsState } from "@comflowy/common/store/extension-state";
import { Button, message } from "antd";
import { useCallback, useState } from "react";

export function DisableExtensionButton(props: {extension: Extension}) {
    const {extension} = props;
    const disabled = extension.disabled
    const [running, setRunning] = useState(false);
    const disable_api = getBackendUrl("/api/disable_extensions");
    const enable_api = getBackendUrl("/api/enable_extensions");
    const onInit = useExtensionsState(st => st.onInit);
    const onDisableExtension = useExtensionsState(st => st.onDisableExtension);
    const diableExtension = useCallback(async (disable: boolean) => {
        try {
            setRunning(true);
            const res = await fetch(disable ? disable_api : enable_api, {
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
                onDisableExtension(extension, disable);
                message.success("Success");
            } else {
                message.error(ret.error)
            }
        } catch(err) {
            message.error("Unexpected error: ", err);
        }
        setRunning(false);
    }, [extension, onInit, onDisableExtension]);

    if (!extension.installed) {
        return null
    }
    return (
        <div className="install-extension-button-wrapper">
            <Button loading={running} disabled={running} onClick={ev => {
                if (!running) {
                    diableExtension(!disabled);
                }
            }}>{disabled ? "Enable" : "Disable"}</Button>
        </div>
    )
}