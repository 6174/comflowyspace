import * as React from 'react'
import { useEffect, useMemo, useCallback, memo } from 'react'
import { Modal } from 'antd'
import { ModalProps } from 'antd/lib/modal'
import { ResizeHandle } from './ResizeHandle'
import { useDrag } from './useDrag'
import { DraggableModalContextMethods } from './DraggableModalContext'
import { usePrevious } from './usePrevious'
import { ModalID, ModalState } from './draggableModalReducer'
import { useResize } from './useResize'
import styles from "./style.module.scss";
const modalStyle: React.CSSProperties = { margin: 0, paddingBottom: 0, pointerEvents: 'auto' }

interface ContextProps extends DraggableModalContextMethods {
    id: ModalID
    modalState: ModalState
    initialWidth?: number
    initialHeight?: number
}

export type DraggableModalInnerProps = ModalProps & { children?: React.ReactNode } & ContextProps

function DraggableModalInnerNonMemo({
    id,
    modalState,
    dispatch,
    open,
    children,
    title,
    initialWidth,
    initialHeight,
    ...otherProps
}: DraggableModalInnerProps) {
    // Call on mount and unmount.
    useEffect(() => {
        dispatch({ type: 'mount', id, intialState: { initialWidth, initialHeight } })
        return () => dispatch({ type: 'unmount', id })
    }, [dispatch, id, initialWidth, initialHeight])

    // Bring this to the front if it's been opened with props.
    const openPrevious = usePrevious(open)
    useEffect(() => {
        if (open !== openPrevious) {
            if (open) {
                dispatch({ type: 'show', id })
            } else {
                dispatch({ type: 'hide', id })
            }
        }
    }, [open, openPrevious, id, dispatch])

    const { zIndex, x, y, width, height } = modalState

    const style: React.CSSProperties = useMemo(() => ({ ...modalStyle, top: y, left: x, height }), [
        y,
        x,
        height,
    ])

    const onFocus = useCallback(() => dispatch({ type: 'focus', id }), [id, dispatch])

    // @ts-ignore
    const onDragWithID = useCallback(args => dispatch({ type: 'drag', id, ...args }), [
        dispatch,
        id,
    ])

    // @ts-ignore
    const onResizeWithID = useCallback(args => dispatch({ type: 'resize', id, ...args }), [
        dispatch,
        id,
    ])

    const onMouseDrag = useDrag(x, y, onDragWithID)
    const onMouseResize = useResize(x, y, width, height, onResizeWithID)

    const titleElement = useMemo(
        () => (
            <div
                className="ant-design-draggable-modal-title"
                onMouseDown={onMouseDrag}
                onClick={onFocus}
            >
                {title}
            </div>
        ),
        [onMouseDrag, onFocus, title],
    )

    return (
        <Modal
            wrapClassName={styles.draggableModal}
            style={style}
            width={width}
            destroyOnClose={true}
            mask={false}
            maskClosable={false}
            zIndex={zIndex}
            title={titleElement}
            open={open}
            {...otherProps}
        >
            {children}
            <ResizeHandle onMouseDown={onMouseResize} />
        </Modal>
    )
}

export const DraggableModalInner = memo(DraggableModalInnerNonMemo)

if (process.env.NODE_ENV !== 'production') {
    DraggableModalInner.displayName = 'DraggableModalInner'
}
