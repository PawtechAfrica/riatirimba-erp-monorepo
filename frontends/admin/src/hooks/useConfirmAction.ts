import {useContext} from "react";
import {ConfirmActionContext} from "@/contexts/ConfirmActionContext.tsx";

export const useConfirmAction = () => {
    const context = useContext(ConfirmActionContext);
    if (!context) {
        throw new Error('useConfirm must be used within a ConfirmProvider');
    }
    return context;
};