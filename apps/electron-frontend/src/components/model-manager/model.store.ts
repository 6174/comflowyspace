import { message } from 'antd';
import {create} from 'zustand';

const api = process.env.NEXT_PUBLIC_API_SERVER + "/api";

type Model = {
  image: string;
  title: string;
  subtitle: string;
  url: string;
  tag: string;
  size: string;
};

type ModelStore = {
  models: Model[];
  fetchModels: () => void;
  setModels: (models: Model[]) => void;
}

const useModelStore = create<ModelStore>((set) => ({
  models: [],
  setModels: (models) => set({ models }),
  fetchModels: async () => {
    try {
      const response = await fetch(`${api}/get-models`);
      const models: Model[] = await response.json();
      set({ models });
    } catch(err) {
      message.error("Failed to fetch models: " + err.message);
    }
  },
}));

export default useModelStore;