import { Input } from '@comflowy/common/types';
import { memo, useState, useEffect } from 'react';
import { Input as AntInput, InputNumber, Select, Switch, Image } from 'antd';
import {
	getImagePreviewUrl,
	getModelImagePreviewUrl,
} from '@comflowy/common/comfyui-bridge/bridge';
import { imageFallBack } from '@/assets/image-fallback';
const MAX_SELECT_NAME = 30;

interface InputProps {
	value: any;
	defaultValue?: any;
	name: string;
	input: Input;
	onChange: (val: any) => void;
}

const getOptions = (
	type: 'lora_name' | 'image' | 'ckpt_name',
	list: string[]
) => {
	if (type === 'lora_name') {
		return list.map((k) => {
			const lora = k.replace(/\.[^.]*$/, '') + '.png';
			const src = getModelImagePreviewUrl('lora', lora);
			const label = k.length > MAX_SELECT_NAME ? `${k.substring(0, MAX_SELECT_NAME)}...` : k
			return {
				label,
				value: k,
				image_url: src,
			};
		});
	}

	if (type === 'image') {
		return list.map((k) => {
			const parsedName = k.split('/');
			let src = getImagePreviewUrl(k);
			if (parsedName.length > 1) {
				src = getImagePreviewUrl(parsedName[1], 'input', parsedName[0]);
			}
			const label = k.length > MAX_SELECT_NAME ? `${k.substring(0, MAX_SELECT_NAME)}...` : k
			return {
				label,
				value: k,
				image_url: src,
			};
		});
	}
};

function InputComponent({
	value,
	defaultValue,
	name,
	input,
	onChange,
}: InputProps): JSX.Element {
	if (Input.isList(input)) {
		if (name === 'image' || name === 'lora_name') {
			const options = getOptions(name, input[0]);
			return (
				<Labelled name={name}>
					<Select
						value={value}
						defaultValue={defaultValue}
						showSearch
						popupMatchSelectWidth={false}
						onChange={onChange}
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
					label: k,
				};
			});
			return (
				<Labelled name={name}>
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
		return (
			<Labelled name={name}>
				<Switch size='small' checked={value} onChange={(ev) => onChange(ev)} />
			</Labelled>
		);
	}

	if (Input.isInt(input) || Input.isFloat(input)) {
		const numberProps = input[1];
		const isInt = Input.isInt(input);
		return (
			<Labelled name={name}>
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
			<Labelled name={name}>
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
}: {
	name: string;
	children: JSX.Element;
}): JSX.Element {
	return (
		<div className='node-input-label-box'>
			<div className='node-input-label-name'>
				<div className='label' style={{
					maxWidth: 10
				}}>{name}</div>
			</div>
			<div className='node-input-label-content nopan nodrag'>
				{children}
			</div>
		</div>
	);
}
