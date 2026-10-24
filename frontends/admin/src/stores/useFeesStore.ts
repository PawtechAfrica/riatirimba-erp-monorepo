import { createStore } from "zustand";
import * as f from "@/libs/types/fees.types.ts";


interface FeesStoreObj {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    
    // Quick cache / state
    voteHeads: f.VoteHeadObj[];
    setVoteHeads: (voteHeads: f.VoteHeadObj[]) => void;

    feeStructures: f.FeeStructureObj[];
    setFeeStructures: (feeStructures: f.FeeStructureObj[]) => void;
}

export const useFeesStore = createStore<FeesStoreObj>()((set) => ({
    activeTab: "dashboard",
    setActiveTab: (activeTab) => set({ activeTab }),

    voteHeads: [],
    setVoteHeads: (voteHeads) => set({ voteHeads }),

    feeStructures: [],
    setFeeStructures: (feeStructures) => set({ feeStructures }),
}));

export default useFeesStore;
