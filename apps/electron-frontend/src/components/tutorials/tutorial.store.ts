import {create} from 'zustand';

const api = process.env.NEXT_PUBLIC_API_SERVER + "/api";

type Tutorial = {
  image: string;
  title: string;
  url: string;
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
    const response = await fetch(`${api}/gettutorial`);
    const tutorials: Tutorial[] = await response.json();
    set({ tutorials });
  },
}));

export default useTutorialStore;
