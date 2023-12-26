export const getWindowSize = (): { width: number; height: number } => ({
    width: window.innerWidth || 0,
    height: window.innerHeight || 0,
})
