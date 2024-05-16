import { ax } from "@shared/api/axios-instance";
import urls from "@shared/api/urls";
import { X_API_KEY } from "@shared/config";
import { getSessionToken } from "@shared/utils/local-storage";
import useSWR from "swr";
interface MyApp {
    access_token: Accesstoken;
}

interface Accesstoken {
    token: string;
}

interface MySelf {
    id: string
    my_app?: MyApp;
}

const userProfileFetcher = async () => {
    const res = await ax.get<MySelf>(urls.register.mySelf, {
        headers: {
            token: getSessionToken(),
            'x-api-key': X_API_KEY
        }
    })
    return res.data
}

export function useUserProfile() {
    const { data: userData, error: userError, isLoading: userIsLoading, mutate: userMutate, isValidating: userIsValidating } = useSWR(urls.register.mySelf, userProfileFetcher)
    return { userData, userError, userIsLoading, userMutate, userIsValidating }
}