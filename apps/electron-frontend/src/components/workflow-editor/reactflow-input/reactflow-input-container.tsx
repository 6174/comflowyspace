import { Input, NodeId, SDNode, Widget } from "@comflowy/common/comfui-interfaces"
import { useAppStore } from "@comflowy/common/store"
import InputComponent from "./reactflow-input";
import { InputUploadImage } from "./input-upload-image";
import { memo } from "react";

interface InputContainerProps {
    id: NodeId
    node: SDNode
    name: string
    input: Input
    widget: Widget
}

function _InputContainer({ id, name, input, widget, node }: InputContainerProps): JSX.Element {
    const value = useAppStore((st) => st.graph[id]?.fields[name]);
    let defaultValue = undefined;
    if (input[1]) {
        defaultValue = (input[1] as any).default;
    }
    const onNodeFieldChange = useAppStore((st) => st.onNodeFieldChange);
    const isImageUpload = Input.isImageUpload(input);
    return (
        <div className="node-input-container nodrag nopan">
            <InputComponent defaultValue={defaultValue} value={value} name={name} input={input} onChange={(val) => onNodeFieldChange(id, name, val)} />
            {isImageUpload && <InputUploadImage widget={widget} id={id} node={node}/>}
        </div>
    )
}

export const InputContainer = memo(_InputContainer);


