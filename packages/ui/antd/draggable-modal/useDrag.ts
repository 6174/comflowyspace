import * as React from 'react'
import { useState, useEffect, useCallback } from 'react'

export const useDrag = (
    x: number,
    y: number,
    onDrag: (args: { x: number; y: number }) => void,
): ((e: React.MouseEvent) => void) => {
    const [dragging, setDragging] = useState(false)
    const [initialDragState, setInitialDragState] = useState({
        initX: 0,
        initY: 0,
        mouseDownX: 0,
        mouseDownY: 0,
    })

    const onMouseDown = useCallback(
        (e: React.MouseEvent) => {
            e.preventDefault()
            setInitialDragState({
                initX: x,
                initY: y,
                mouseDownX: e.clientX,
                mouseDownY: e.clientY,
            })
            setDragging(true)
        },
        [x, y, setDragging, setInitialDragState],
    )

    useEffect(() => {
        const onMouseMove = (e: MouseEvent): void => {
            if (dragging) {
                const { initX, mouseDownX, initY, mouseDownY } = initialDragState
                let dx = e.clientX - mouseDownX
                let dy = e.clientY - mouseDownY
                const x = initX + dx
                const y = initY + dy
                onDrag({ x, y })
            }
        }
        window.addEventListener('mousemove', onMouseMove, { passive: true })
        return () => window.removeEventListener('mousemove', onMouseMove)
    }, [initialDragState, dragging, onDrag])

    useEffect(() => {
        const onMouseUp = (): void => {
            setDragging(false)
        }
        window.addEventListener('mouseup', onMouseUp)
        return () => window.removeEventListener('mouseup', onMouseUp)
    }, [setDragging])

    return onMouseDown
}
