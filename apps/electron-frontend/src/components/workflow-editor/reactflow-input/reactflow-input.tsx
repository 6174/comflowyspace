import { Input } from '@comflowy/common/comfui-interfaces'
import { memo, useState, useEffect } from 'react'
import {Input as AntInput, InputNumber, Select, Switch} from "antd";
const MAX_SELECT_NAME = 36

interface InputProps {
  value: any
  name: string
  input: Input
  onChange: (val: any) => void
}

function InputComponent({ value, name, input, onChange }: InputProps): JSX.Element {
  if (Input.isList(input)) {
    return (
      <Labelled name={name}>
        <Select
          style={{
            width: "100%",
            textAlign: "right"
          }}
          value={value} 
          onChange={(value) => onChange(value)}
          options={input[0].map((k) => {
            return {
              value: k,
              label: k.length > MAX_SELECT_NAME ? `…${k.substring(k.length - MAX_SELECT_NAME + 1)}` : k,
            }
          })}
        />
      </Labelled>
    )
  }
  if (Input.isBool(input)) {
    return (
      <div className='switch-wrapper'>
        <div className='switch-label'>{name}</div>
        <div className='switch-input'>
          <Switch
            size='small'
            checked={value}
            onChange={(ev) => onChange(ev)}
          />
        </div>
      </div>
    )
  }

  if (Input.isInt(input) || Input.isFloat(input)) {
    const numberProps = input[1];
    const isInt = Input.isInt(input) ;
    return (
      <InputNumber
        defaultValue={numberProps.default}
        min={numberProps.min || null}
        max={numberProps.max || null}
        prefix={name}
        className="nodrag"
        step={isInt ? 1 : 0.01}
        value={value}
        onChange={(value) => onChange(value)}
      />
    )
  }
  if (Input.isString(input)) {
    const args = input[1]
    if (args.multiline === true) {
      return (
        <AntInput.TextArea
          style={{ height: 128, width: 260 }}
          value={value}
          onChange={(ev) => onChange(ev.target.value)}
        />
      )
    }
    return (
      <AntInput prefix={name} type="text" className="px-1 grow nodrag" value={value} onChange={(ev) => onChange(ev.target.value)} />
    )
  }

  return <></>
}

export default memo(InputComponent)

function IntInput({ 
  value, 
  onChange,
  prefix
}: { value: number; onChange: (num: number) => void; prefix?: any }
): JSX.Element {
  const [{ text, failed }, setState] = useState({ text: value.toString(), failed: false })

  // update state on new props
  useEffect(() => {
    setState((st) => ({ ...st, text: value.toString() }))
  }, [value])

  return (
    <AntInput
      type="text"
      prefix={prefix}
      value={text}
      className='no-drag'
      onChange={(ev) => {
        const parsed = parseInt(ev.target.value)
        const failed = Object.is(NaN, parsed)
        setState({ text: ev.target.value, failed })
        if (!failed) {
          onChange(parsed)
        }
      }}
    />
  )
}

function Labelled({ name, children }: { name: string; children: JSX.Element }): JSX.Element {
  return (
    <div className="node-input-label-box">
      <div className="node-input-label-name">{name}</div>
      {children}
    </div>
  )
}
