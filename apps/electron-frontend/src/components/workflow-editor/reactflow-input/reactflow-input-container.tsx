import { Input, NodeId, SDNode, Widget } from "@comflowy/common/types"
import { useAppStore } from "@comflowy/common/store"
import InputComponent from "./reactflow-input";
import { InputUploadImage } from "./input-upload-image";
import { memo, useCallback } from "react";
import { InputUploadVideo } from "./input-video-upload";

interface InputContainerProps {
    id: NodeId
    node: SDNode
    name: string
    input: Input
    widget: Widget,
    value?: any,
    onChange?: (val: any) => void;
}

function _InputContainer({ id, name, input, widget, node, onChange, value }: InputContainerProps): JSX.Element {
    value =  value || useAppStore((st) => st.graph[id]?.fields[name]);
    let defaultValue = undefined;
    if (input[1]) {
        defaultValue = (input[1] as any).default;
    }
    const onNodeFieldChange = useAppStore((st) => st.onNodeFieldChange);
    const isImageUpload = Input.isImageUpload(input);
    const isVideoUpload = Input.isVideoUpload(input);
    const _onChangeHandler = onChange || useCallback((val: any) => onNodeFieldChange(id, name, val), [onNodeFieldChange])
    return (
        <div className="node-input-container">
            <InputComponent defaultValue={defaultValue} value={value} name={name} input={input} onChange={_onChangeHandler} widget={widget}/>
            {isImageUpload && <InputUploadImage widget={widget} id={id} node={node}/>}
            {isVideoUpload && <InputUploadVideo widget={widget} id={id} node={node} />}
        </div>
    )
}

export const InputContainer = memo(_InputContainer);


