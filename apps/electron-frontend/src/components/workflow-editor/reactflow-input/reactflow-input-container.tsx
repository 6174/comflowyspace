import { Input, NodeId } from "@comflowy/common/comfui-interfaces"
import { useAppStore } from "@comflowy/common/store"
import { shallow } from 'zustand/shallow';
import InputComponent from "./reactflow-input";

interface InputContainerProps {
    id: NodeId
    name: string
    input: Input
}

export function InputContainer({ id, name, input }: InputContainerProps): JSX.Element {
    const { value, onPropChange } = useAppStore(
        (st) => ({
            value: st.graph[id]?.fields[name],
            onPropChange: st.onPropChange,
        }),
        shallow
    )
    return <InputComponent value={value} name={name} input={input} onChange={(val) => onPropChange(id, name, val)} />
}
