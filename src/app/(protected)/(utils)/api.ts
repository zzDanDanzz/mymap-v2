import { ax } from "@shared/api/axios-instance";
import urls from "@shared/api/urls";
import { X_API_KEY } from "@shared/config";
import { getSessionToken } from "@shared/utils/local-storage";


interface CreateAppResponse {
    data: {
        client: Client;
        token: Token;
    },
    message: string
}


interface Token {
    message: string;
    data: Data;
}

interface Data {
    token_type: string;
    expires_in: number;
    access_token: string;
}

interface Client {
    name: string;
    user_id: string;
    plan_id: number;
    to_date: string;
    preferred_plan_id: number;
    rate: number;
    total_count: number;
    balance: number;
    updated_at: string;
    created_at: string;
    id: number;
}

/**
 *  create app for user if they don't already have one (app is needed to track user's usage) 
 *  app (or "project" or just "access token") can be manually created by any user at accounts.map.ir
 * @param {string} userId
 * @returns 
 */
export async function createApp(userId: string) {

    const res = await ax.post<CreateAppResponse>(
        `${urls.register.apps}`,
        {
            name: 'my-client-' + userId,
            user_id: userId,
        },
        {
            headers: {
                token: getSessionToken(),
                "x-api-key": `${X_API_KEY}`,
            },
        }
    );

    if (res.data.message === "successfully created" && res.data.data?.token?.data?.access_token) {
        return {
            success: true as const,
            appToken: res.data?.data?.token?.data?.access_token
        }
    }

    return {
        success: false as const
    }
}
