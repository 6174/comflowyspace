import { message } from 'antd';
import {create} from 'zustand';

const api = process.env.NEXT_PUBLIC_API_SERVER + "/api";

type Tutorial = {
  image: string;
  title: string;
  subtitle: string;
  url: string;
  tag: string;
};

type TutorialStore = {
  tutorials: Tutorial[];
  fetchTutorials: () => void;
  setTutorials: (tutorials: Tutorial[]) => void;
}

const useTutorialStore = create<TutorialStore>((set) => ({
  tutorials: [],
  setTutorials: (tutorials) => set({ tutorials }),
  fetchTutorials: async () => {
    try {
      const response = await fetch(`${api}/get-tutorial`);
      const tutorials: Tutorial[] = await response.json();
      set({ tutorials });
    } catch(err) {
      message.error("Failed to fetch tutorials: " + err.message);
    }
  },
}));

export default useTutorialStore;
