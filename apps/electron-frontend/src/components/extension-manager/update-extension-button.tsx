import config, { getBackendUrl } from "@comflowy/common/config";
import { Extension, useExtensionsState } from "@comflowy/common/store/extension-state";
import { Button, message } from "antd";
import { useCallback, useState } from "react";
import {KEYS, t} from "@comflowy/common/i18n";

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
                await onInit();
                message.success(t(KEYS.success));
            } else {
                message.error(ret.error)
            }
        } catch(err) {
            message.error("Unexpected error: ", err);
        }
        setRunning(false);
    }, [extension, onInit]);

    if (!extension.need_update || extension.disabled) {
        return null
    }

    return (
        <div className="update-extension-button-wrapper">
            <Button loading={running} disabled={running} onClick={ev => {
                if (!running) {
                    action();
                }
            }}>{t(KEYS.update)}</Button>
        </div>
    )
}