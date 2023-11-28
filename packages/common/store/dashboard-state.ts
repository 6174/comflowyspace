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

/**
 * Load docs from localstorage
 */
async function getDoclistFromLocal() {

}

async function createDocToLocal() {

}

async function updateDocToLocal() {

}

async function removeDocToLocal() {

}

export {useDashboardState}
