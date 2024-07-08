import { Input, NODE_GET, NODE_GET_SELECT_FIELD_NAME, NODE_SET, NodeId, SDNode, Widget } from "@comflowy/common/types"
import { useAppStore } from "@comflowy/common/store"
import InputComponent from "./reactflow-input";
import { InputUploadImage } from "./input-upload-image";
import { memo, useCallback } from "react";
import { InputUploadVideo } from "./input-video-upload";
import { InputGetNodeField, InputSetNodeField } from "./input-get-set-node";

interface InputContainerProps {
    id: NodeId
    node: SDNode
    name: string
    input: Input
    widget: Widget,
    value?: any,
    env: "main" | "controlboard" | "other"
    onChange?: (val: any) => void;
}

function _InputContainer({ id, name, input, widget, node, onChange, value, env}: InputContainerProps): JSX.Element {
    value =  value || useAppStore((st) => st.graph[id]?.fields[name]);
    let defaultValue = undefined;
    if (input[1]) {
        defaultValue = (input[1] as any).default;
    }
    const onNodeFieldChange = useAppStore((st) => st.onNodeFieldChange);
    const isImageUpload = Input.isImageUpload(input);
    const isVideoUpload = Input.isVideoUpload(input);
    const isGetNodeSelectField = node.widget === NODE_GET && name === NODE_GET_SELECT_FIELD_NAME
    const isSetNodeSelectField = node.widget === NODE_SET && name === NODE_GET_SELECT_FIELD_NAME

    const _onChangeHandler = onChange || useCallback((val: any) => onNodeFieldChange(id, name, val), [onNodeFieldChange])

    if (isGetNodeSelectField) {
        return (
            <div className="node-input-container">
                <InputGetNodeField widget={widget} node={node} id={id} value={value} name={name} input={input} onChange={_onChangeHandler} />
            </div>
        )
    }

    if (isSetNodeSelectField) {
        return (
            <div className="node-input-container">
                <InputSetNodeField widget={widget} node={node} id={id} value={value} name={name} input={input} onChange={_onChangeHandler} />
            </div>
        )
    }
    
    return (
        <div className="node-input-container">
            <InputComponent defaultValue={defaultValue} value={value} name={name} input={input} onChange={_onChangeHandler} widget={widget}/>
            {isImageUpload && <InputUploadImage editable={env === "main"} widget={widget} id={id} node={node}/>}
            {isVideoUpload && <InputUploadVideo widget={widget} id={id} node={node} />}
        </div>
    )
}

export const InputContainer = memo(_InputContainer);


