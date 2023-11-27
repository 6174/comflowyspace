import { Input } from '@comflowy/common/comfui-interfaces'
import { memo, useState, useEffect } from 'react'

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
        <select className="px-1 grow nodrag" value={value} onChange={(ev) => onChange(ev.target.value)}>
          {input[0].map((k) => (
            <option key={k} value={k}>
              {k.length > MAX_SELECT_NAME ? `…${k.substring(k.length - MAX_SELECT_NAME + 1)}` : k}
            </option>
          ))}
        </select>
      </Labelled>
    )
  }
  if (Input.isBool(input)) {
    return (
      <Labelled name={name}>
        <input
          type="checkbox"
          className="px-1 grow nodrag"
          value={value}
          onChange={(ev) => onChange(ev.target.checked)}
        />
      </Labelled>
    )
  }
  if (Input.isInt(input)) {
    return (
      <Labelled name={name}>
        <IntInput value={value} onChange={onChange} />
      </Labelled>
    )
  }
  if (Input.isFloat(input)) {
    return (
      <Labelled name={name}>
        <input
          type="number"
          className="px-1 grow nodrag"
          value={value}
          onChange={(ev) => onChange(ev.target.valueAsNumber)}
        />
      </Labelled>
    )
  }
  if (Input.isString(input)) {
    const args = input[1]
    if (args.multiline === true) {
      return (
        <textarea
          style={{ height: 128, width: 260 }}
          className="px-1 grow nodrag text-xs"
          value={value}
          onChange={(ev) => onChange(ev.target.value)}
        />
      )
    }
    return (
      <Labelled name={name}>
        <input type="text" className="px-1 grow nodrag" value={value} onChange={(ev) => onChange(ev.target.value)} />
      </Labelled>
    )
  }
  return <></>
}

export default memo(InputComponent)

function IntInput({ value, onChange }: { value: number; onChange: (num: number) => void }): JSX.Element {
  const [{ text, failed }, setState] = useState({ text: value.toString(), failed: false })

  // update state on new props
  useEffect(() => {
    setState((st) => ({ ...st, text: value.toString() }))
  }, [value])

  const defaultClasses = ['px-1', 'grow', 'nodrag']
  const borderClasses = failed ? ['border', 'border-1', 'border-rose-500'] : []

  return (
    <input
      type="text"
      className={defaultClasses.concat(borderClasses).join(' ')}
      value={text}
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
    <div className="flex w-full justify-between">
      <span className="pr-2">{name}</span>
      {children}
    </div>
  )
}
