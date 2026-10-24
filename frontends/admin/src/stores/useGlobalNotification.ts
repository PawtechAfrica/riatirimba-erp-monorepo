import {create} from "zustand";


interface GlobalNotificationStore {
    message: string,
    setMessage: (message: string, timeout?: number) => void
    clearMessage: () => void
}

const useGlobalNotification = create<GlobalNotificationStore>((set) => ({
    message: '',
    setMessage: (message, timeout) => {
        set({message})
        if (timeout)
            setTimeout(
                () => set({message: ''}),
                timeout
            )
    },
    clearMessage: () => set({message: ''})
}))

export default useGlobalNotification

