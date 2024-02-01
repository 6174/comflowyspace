import create from 'zustand';

const api = process.env.NEXT_PUBLIC_API_SERVER;

type TutorialStore = {
  tutorial: string;
  setTutorial: (tutorial: string) => void;
};

const useTutorialStore = create<TutorialStore>((set) => ({
  tutorial: '',
  setTutorial: (tutorial) => set({ tutorial }),
}));

export default useTutorialStore;
