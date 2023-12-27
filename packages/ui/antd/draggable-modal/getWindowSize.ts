export const getWindowSize = (): { width: number; height: number } => {
    if (typeof window === 'undefined') {
        return { width: 100, height: 100 }
    }
    return  ({
        width: window.innerWidth || 0,
        height: window.innerHeight || 0,
    })
}
