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
          value={value} 
          onChange={(value) => onChange(value)}
          popupMatchSelectWidth={false}
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
      <Labelled name={name}>
        <Switch
          size='small'
          checked={value}
          onChange={(ev) => onChange(ev)}
        />
      </Labelled>
    )
  }

  if (Input.isInt(input) || Input.isFloat(input)) {
    const numberProps = input[1];
    const isInt = Input.isInt(input) ;
    return (
      <Labelled name={name}>
        <InputNumber
          defaultValue={numberProps.default}
          min={numberProps.min || null}
          max={numberProps.max || null}
          className="nodrag"
          step={isInt ? 1 : 0.01}
          value={value}
          onChange={(value) => onChange(value)}
        />
      </Labelled>
    )
  }
  if (Input.isString(input)) {
    const args = input[1]
    if (args.multiline === true) {
      return (
        <AntInput.TextArea
          autoSize
          placeholder={name}
          style={{ minHeight: 128, width: "100%", marginBottom: 10 }}
          value={value}
          onChange={(ev) => onChange(ev.target.value)}
        />
      )
    }
    return (
      <Labelled name={name}>
        <AntInput type="text" value={value} onChange={(ev) => onChange(ev.target.value)} />
      </Labelled>
    )
  }

  return <></>
}

export default memo(InputComponent)

function Labelled({ name, children }: { name: string; children: JSX.Element }): JSX.Element {
  return (
    <div className="node-input-label-box">
      <div className="node-input-label-name">
        <div className="label" style={{
          maxWidth: 10
        }}>{name}</div>
      </div>
      {children}
    </div>
  )
}
