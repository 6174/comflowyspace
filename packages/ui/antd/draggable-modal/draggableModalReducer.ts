import { getWindowSize } from './getWindowSize'
import { clamp } from './clamp'

const mapObject = <T>(o: { [key: string]: T }, f: (value: T) => T): { [key: string]: T } =>
    Object.assign({}, ...Object.keys(o).map(k => ({ [k]: f(o[k]) })))

// ID for a specific modal.
export type ModalID = string

// State for a specific modal.
export interface ModalState {
    x: number
    y: number
    width: number
    height: number
    zIndex: number
    open: boolean
}

// State of all modals.
export interface ModalsState {
    maxZIndex: number
    windowSize: {
        width: number
        height: number
    }
    modals: {
        [key: string]: ModalState
    }
}

export const initialModalsState: ModalsState = {
    maxZIndex: 0,
    windowSize: getWindowSize(),
    modals: {},
}

export const initialModalState: ModalState = {
    x: 0,
    y: 0,
    width: 800,
    height: 800,
    zIndex: 0,
    open: false,
}

const getInitialModalState = ({
    initialWidth = initialModalState.width,
    initialHeight = initialModalState.height,
}: {
    initialWidth?: number
    initialHeight?: number
}) => {
    return {
        ...initialModalState,
        width: initialWidth,
        height: initialHeight,
    }
}

export type Action =
    | { type: 'show'; id: ModalID }
    | { type: 'hide'; id: ModalID }
    | { type: 'focus'; id: ModalID }
    | { type: 'unmount'; id: ModalID }
    | { type: 'mount'; id: ModalID; intialState: { initialWidth?: number; initialHeight?: number } }
    | { type: 'windowResize'; size: { width: number; height: number } }
    | { type: 'drag'; id: ModalID; x: number; y: number }
    | {
          type: 'resize'
          id: ModalID
          x: number
          y: number
          width: number
          height: number
      }

export const getModalState = ({
    state,
    id,
    initialWidth,
    initialHeight,
}: {
    state: ModalsState
    id: ModalID
    initialWidth?: number
    initialHeight?: number
}): ModalState => state.modals[id] || getInitialModalState({ initialWidth, initialHeight })

const getNextZIndex = (state: ModalsState, id: string): number =>
    getModalState({ state, id }).zIndex === state.maxZIndex ? state.maxZIndex : state.maxZIndex + 1

const clampDrag = (
    windowWidth: number,
    windowHeight: number,
    x: number,
    y: number,
    width: number,
    height: number,
): { x: number; y: number } => {
    const maxX = windowWidth - width
    const maxY = windowHeight - height
    const clampedX = clamp(0, maxX, x)
    const clampedY = clamp(0, maxY, y)
    return { x: clampedX, y: clampedY }
}

const clampResize = (
    windowWidth: number,
    windowHeight: number,
    x: number,
    y: number,
    width: number,
    height: number,
): { width: number; height: number } => {
    const maxWidth = windowWidth - x
    const maxHeight = windowHeight - y
    const clampedWidth = clamp(200, maxWidth, width)
    const clampedHeight = clamp(200, maxHeight, height)
    return { width: clampedWidth, height: clampedHeight }
}

export const draggableModalReducer = (state: ModalsState, action: Action): ModalsState => {
    switch (action.type) {
        case 'resize':
            const size = clampResize(
                state.windowSize.width,
                state.windowSize.height,
                action.x,
                action.y,
                action.width,
                action.height,
            )
            return {
                ...state,
                maxZIndex: getNextZIndex(state, action.id),
                modals: {
                    ...state.modals,
                    [action.id]: {
                        ...state.modals[action.id],
                        ...size,
                        zIndex: getNextZIndex(state, action.id),
                    },
                },
            }
        case 'drag':
            return {
                ...state,
                maxZIndex: getNextZIndex(state, action.id),
                modals: {
                    ...state.modals,
                    [action.id]: {
                        ...state.modals[action.id],
                        ...clampDrag(
                            state.windowSize.width,
                            state.windowSize.height,
                            action.x,
                            action.y,
                            state.modals[action.id].width,
                            state.modals[action.id].height,
                        ),
                        zIndex: getNextZIndex(state, action.id),
                    },
                },
            }
        case 'show': {
            const modalState = state.modals[action.id]
            const centerX = state.windowSize.width / 2 - modalState.width / 2
            const centerY = state.windowSize.height / 2 - modalState.height / 2
            const position = clampDrag(
                state.windowSize.width,
                state.windowSize.height,
                centerX,
                centerY,
                modalState.width,
                modalState.height,
            )
            const size = clampResize(
                state.windowSize.width,
                state.windowSize.height,
                position.x,
                position.y,
                modalState.width,
                modalState.height,
            )
            return {
                ...state,
                maxZIndex: state.maxZIndex + 1,
                modals: {
                    ...state.modals,
                    [action.id]: {
                        ...modalState,
                        ...position,
                        ...size,
                        zIndex: state.maxZIndex + 1,
                        open: true,
                    },
                },
            }
        }
        case 'focus':
            const modalState = state.modals[action.id]
            return {
                ...state,
                maxZIndex: state.maxZIndex + 1,
                modals: {
                    ...state.modals,
                    [action.id]: {
                        ...modalState,
                        zIndex: state.maxZIndex + 1,
                    },
                },
            }
        case 'hide': {
            const modalState = state.modals[action.id]
            return {
                ...state,
                modals: {
                    ...state.modals,
                    [action.id]: {
                        ...modalState,
                        open: false,
                    },
                },
            }
        }
        case 'mount':
            const initialState = getInitialModalState(action.intialState)
            return {
                ...state,
                maxZIndex: state.maxZIndex + 1,
                modals: {
                    ...state.modals,
                    [action.id]: {
                        ...initialState,
                        x: state.windowSize.width / 2 - initialState.width / 2,
                        y: state.windowSize.height / 2 - initialState.height / 2,
                        zIndex: state.maxZIndex + 1,
                    },
                },
            }
        case 'unmount':
            const modalsClone = { ...state.modals }
            delete modalsClone[action.id]
            return {
                ...state,
                modals: modalsClone,
            }
        case 'windowResize':
            return {
                ...state,
                windowSize: action.size,
                modals: mapObject(state.modals, (modalState: ModalState) => {
                    if (!modalState.open) {
                        return modalState
                    }
                    const position = clampDrag(
                        state.windowSize.width,
                        state.windowSize.height,
                        modalState.x,
                        modalState.y,
                        modalState.width,
                        modalState.height,
                    )
                    const size = clampResize(
                        state.windowSize.width,
                        state.windowSize.height,
                        position.x,
                        position.y,
                        modalState.width,
                        modalState.height,
                    )
                    return {
                        ...modalState,
                        ...position,
                        ...size,
                    }
                }),
            }
        default:
            throw new Error()
    }
}
