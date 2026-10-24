// ConfirmProvider.tsx
import {createContext, type ReactNode, useState} from 'react';
import {Modal} from '@mantine/core';
import ConfirmActionForm from "@/components/forms/ConfirmActionForm.tsx";

interface ConfirmOptions {
    question: string;
    acceptFn: () => Promise<any>;
}

type ConfirmContextType = (options: ConfirmOptions) => Promise<boolean>;

export const ConfirmActionContext = createContext<ConfirmContextType | null>(null);

export const ConfirmActionProvider = ({children}: { children: ReactNode }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [options, setOptions] = useState<ConfirmOptions | null>(null);
    const [resolver, setResolver] = useState<{ resolve: (value: boolean) => void } | null>(null);

    const confirm: ConfirmContextType = (opts) => {
        setOptions(opts);
        setIsOpen(true);
        return new Promise((resolve) => {
            setResolver({resolve});
        });
    };

    // Called by your form's cancelFn, onSuccess, and onFailure
    const handleClose = (result: boolean) => {
        resolver?.resolve(result);
        setIsOpen(false);
    };

    return (
        <ConfirmActionContext.Provider value={confirm}>
            {children}

            <Modal
                opened={isOpen}
                onClose={() => handleClose(false)}
                withCloseButton={false}
                centered
            >
                {options && (
                    <ConfirmActionForm
                        question={options.question}
                        acceptFn={options.acceptFn}
                        cancelFn={() => handleClose(false)}
                        onSuccess={() => handleClose(true)}
                        onFailure={() => handleClose(false)}
                    />
                )}
            </Modal>
        </ConfirmActionContext.Provider>
    );
};