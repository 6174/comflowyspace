import { Input, NodeId, Widget } from "@comflowy/common/comfui-interfaces"
import { useAppStore } from "@comflowy/common/store"
import { shallow } from 'zustand/shallow';
import InputComponent from "./reactflow-input";
import { InputUploadImage } from "./input-upload-image";

interface InputContainerProps {
    id: NodeId
    name: string
    input: Input,
    widget: Widget
}

export function InputContainer({ id, name, input, widget }: InputContainerProps): JSX.Element {
    const { value, onPropChange } = useAppStore(
        (st) => ({
            value: st.graph[id]?.fields[name],
            onPropChange: st.onPropChange,
        }),
        shallow
    )

    const isImageUpload = Input.isImageUpload(input);
    return (
        <div className="node-input-container nodrag nopan">
            <InputComponent value={value} name={name} input={input} onChange={(val) => onPropChange(id, name, val)} />
            {isImageUpload && <InputUploadImage widget={widget} id={id}/>}
        </div>
    )
}
