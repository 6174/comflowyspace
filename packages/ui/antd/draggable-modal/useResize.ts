import * as React from 'react'
import { useState, useEffect, useCallback } from 'react'

interface InitialState {
    initX: number
    initY: number
    initWidth: number
    initHeight: number
    mouseDownX: number
    mouseDownY: number
}

export const useResize = (
    x: number,
    y: number,
    width: number,
    height: number,
    onResize: (args: { x: number; y: number; width: number; height: number }) => void,
): ((e: React.MouseEvent) => void) => {
    const [dragging, setDragging] = useState(false)
    const [initialDragState, setInitialDragState] = useState<InitialState>({
        initX: 0,
        initY: 0,
        initWidth: 0,
        initHeight: 0,
        mouseDownX: 0,
        mouseDownY: 0,
    })

    const onMouseDown = useCallback(
        (e: React.MouseEvent) => {
            e.preventDefault()
            setInitialDragState({
                initX: x,
                initY: y,
                initWidth: width,
                initHeight: height,
                mouseDownX: e.clientX,
                mouseDownY: e.clientY,
            })
            setDragging(true)
        },
        [width, height, setDragging, setInitialDragState, x, y],
    )

    useEffect(() => {
        const onMouseMove = (e: MouseEvent): void => {
            if (dragging) {
                const {
                    initX,
                    initY,
                    initWidth,
                    mouseDownX,
                    initHeight,
                    mouseDownY,
                } = initialDragState
                let dx = e.clientX - mouseDownX
                let dy = e.clientY - mouseDownY
                const width = initWidth + dx
                const height = initHeight + dy
                return onResize({ x: initX, y: initY, width, height })
            }
        }
        window.addEventListener('mousemove', onMouseMove, { passive: true })
        return () => window.removeEventListener('mousemove', onMouseMove)
    }, [initialDragState, dragging, onResize])

    useEffect(() => {
        const onMouseUp = (): void => {
            setDragging(false)
        }
        window.addEventListener('mouseup', onMouseUp)
        return () => window.removeEventListener('mouseup', onMouseUp)
    }, [setDragging])

    return onMouseDown
}
