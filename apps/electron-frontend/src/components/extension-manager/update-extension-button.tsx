import config, { getBackendUrl } from "@comflowy/common/config";
import { Extension, useExtensionsState } from "@comflowy/common/store/extension-state";
import { Button, message } from "antd";
import { useCallback, useState } from "react";
import {KEYS, t} from "@comflowy/common/i18n";

export function UpdateExtensionButton(props: {
    extensions: Extension[],
    buttonSize?: "small" | "middle" | "large"
}) {
    const {extensions} = props;
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
                    extensions: extensions,
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
    }, [extensions, onInit]);

    if (extensions.length === 0) {
        return null
    }

    return (
        <div className="update-extension-button-wrapper">
            <Button size={props.buttonSize || "middle"} loading={running} disabled={running} onClick={ev => {
                if (!running) {
                    action();
                }
            }}>{t(KEYS.update)}</Button>
        </div>
    )
}