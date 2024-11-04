import {ReactNode} from "react";
import Intercom from "@intercom/messenger-js-sdk";
import {useStores} from "@stores";


interface IntercomProviderProps {
    children: ReactNode;
}

export const IntercomProvider: React.FC<IntercomProviderProps> = ({children}) => {
    const {accountStore} = useStores()
    Intercom({
        app_id: 'cqini4oz',
        wallet: accountStore.address,
    });
    return children
}