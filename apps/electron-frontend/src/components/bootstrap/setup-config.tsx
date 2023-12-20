import { Alert, Button, Input, Space } from "antd";
import { useState } from "react";

export function SetupConfig() {
  const Default = "$HOME/.comflowy/ComfyUI";
  const [value, setValue] = useState(Default);
  return (
    <div className="SetupConfig">
      <div className="field">
        <Alert message="If you already installed comfyUI, you can choose the exist comfyUI path" type="info" showIcon />
        <br />
        <div className="field-label" style={{
          marginBottom: "10px"
        }}>ComfyUI Path:</div>
        <Space>
          <Input disabled value={value} style={{width: 400}}/>
          <Button type="link">Select folder..</Button>
          <Button type="link">Use Default</Button>
        </Space>
      </div>
      <div className="field">
        <Button type="primary">Save</Button>
      </div>
    </div>
  )
}