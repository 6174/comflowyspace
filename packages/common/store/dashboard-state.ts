import {create} from "zustand";

type DashboardState = {
    docs: any[]
}

type DashboardAction = {
    onInit: () => void
}

const useDashboardState = create<DashboardState & DashboardAction>((set, get) => ({
    docs: [],
    onInit: async () => {

    }
}));

export {useDashboardState}
