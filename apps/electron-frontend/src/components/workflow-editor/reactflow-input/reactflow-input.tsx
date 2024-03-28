import { Input, Widget } from '@comflowy/common/types';
import { memo, useState, useEffect } from 'react';
import { Input as AntInput, InputNumber, Select, Switch, Image, Space } from 'antd';
import {
	getImagePreviewUrl,
	getModelImagePreviewUrl,
} from '@comflowy/common/comfyui-bridge/bridge';
import { imageFallBack } from '@/assets/image-fallback';
import { dt } from '@comflowy/common/i18n';
const MAX_SELECT_NAME = 30;

interface InputProps {
	value: any;
	defaultValue?: any;
	name: string;
	input: Input;
	widget: Widget;
	onChange: (val: any) => void;
}


function InputComponent({
	value,
	defaultValue,
	name,
	input,
	widget,
	onChange,
}: InputProps): JSX.Element {
	if (Input.isList(input)) {
		if (name === 'image' || name === 'lora_name') {
			const options = getOptions(name, input[0]);
			const hasRealValue = options[0].realValue;
			return (
				<Labelled name={name} widget={widget}>
					<Select
						value={value?.content || value}
						defaultValue={defaultValue}
						showSearch
						popupMatchSelectWidth={false}
						onChange={(value) => {
							if (hasRealValue) {
								const realValue = options.find((it) => it.value === value)?.realValue;
								onChange(realValue);
							} else {
								onChange(value);
							}
						}}
						options={options}
						optionRender={(option) => (
							<div
								style={{
									display: 'flex',
									flexDirection: 'row',
									gap: '10px',
									alignItems: 'center',
								}}>
								<Image
									preview={false}
                  style={{borderRadius: '2px'}}
									src={option.data.image_url}
									width={50}
									fallback={imageFallBack}
								/>
								<div
									style={{
										flex: 1,
										whiteSpace: 'nowrap',
										overflow: 'hidden',
										textOverflow: 'ellipsis',
										fontSize: '0.7em',
									}}>
									{option.label}
								</div>
							</div>
						)}
					/>
				</Labelled>
			);
		} else {
			const options = input[0].map((k) => {
				return {
					value: k,
					label: dt(`Nodes.${widget.name}.widgets.${k}`, k),
				};
			});

			if (name === "control_after_generated") {
				value = value || defaultValue
			}

			return (
				<Labelled name={name} widget={widget}>
					<Select
						value={value}
						defaultValue={defaultValue}
						showSearch
						popupMatchSelectWidth={false}
						onChange={onChange}
						options={options}
					/>
				</Labelled>
			);
		}
	}
	if (Input.isBool(input)) {
		let label = "";
		if (input[1].label_on && value === true) {
			label = input[1].label_on;
		}

		if (input[1].label_off && value === false) {
			label = input[1].label_off;
		}


		return (
			<Labelled name={name} widget={widget}>
				<Space>
					<div className="label">{label}</div>
					<Switch size='small' checked={value} onChange={(ev) => onChange(ev)} />
				</Space>
			</Labelled>
		);
	}

	if (Input.isInt(input) || Input.isFloat(input)) {
		const numberProps = input[1];
		const isInt = Input.isInt(input);
		return (
			<Labelled name={name} widget={widget}>
				<InputNumber
					defaultValue={numberProps.default}
					min={numberProps.min || null}
					max={numberProps.max || null}
					className='nodrag'
					step={isInt ? 1 : 0.01}
					value={value}
					onChange={(value) => onChange(value)}
				/>
			</Labelled>
		);
	}
	if (Input.isString(input)) {
		const args = input[1];
		if (args.multiline === true) {
			return (
				<AntInput.TextArea
					autoSize
					className='nopan nodrag'
					placeholder={name}
					style={{ minHeight: 128, width: '100%', marginBottom: 10 }}
					value={value}
					onChange={(ev) => onChange(ev.target.value)}
				/>
			);
		}
		return (
			<Labelled name={name} widget={widget}>
				<AntInput
					type='text'
					value={value}
					onChange={(ev) => onChange(ev.target.value)}
				/>
			</Labelled>
		);
	}

	return <></>;
}

export default memo(InputComponent);

function Labelled({
	name,
	children,
	widget
}: {
	name: string;
	children: JSX.Element;
	widget: Widget;
}): JSX.Element {
	return (
		<div className='node-input-label-box'>
			<div className='node-input-label-name'>
				<div className='label' style={{
					maxWidth: 10
				}}>{dt(`Nodes.${widget.name}.widgets.${name}`, name)}</div>
			</div>
			<div className='node-input-label-content nopan nodrag'>
				{children}
			</div>
		</div>
	);
}

const getOptions = (
	type: 'lora_name' | 'image' | 'ckpt_name',
	list: (string | { content: string, image: string })[]
) => {
	if (type === 'lora_name') {
		return list.map((it) => {
			let k = "";
			let src = "";
			if (typeof it === "string") {
				const lora = k.replace(/\.[^.]*$/, '') + '.png';
				k = it;
				src = getModelImagePreviewUrl('lora', lora);
			} else {
				k = it.content;
				src = it.image;
			}
			const label = k.length > MAX_SELECT_NAME ? `${k.substring(0, MAX_SELECT_NAME)}...` : k
			return {
				label,
				value: k,
				realValue: it,
				image_url: src,
			};
		});
	}

	if (type === 'image') {
		return list.map((it) => {
			let k = ""
			if (typeof it === "string") {
				k = it;
			} else {
				k = it.content;
			}
			const parsedName = k.split('/');
			let src = getImagePreviewUrl(k);
			if (parsedName.length > 1) {
				src = getImagePreviewUrl(parsedName[1], 'input', parsedName[0]);
			}
			const label = k.length > MAX_SELECT_NAME ? `${k.substring(0, MAX_SELECT_NAME)}...` : k
			return {
				label,
				value: k,
				realValue: it,
				image_url: src,
			};
		});
	}
};
