import * as SecureStore from 'expo-secure-store';

export const discovery = {
    authorizationEndpoint: "https://api.intra.42.fr/oauth/authorize",
    tokenEndpoint: "https://api.intra.42.fr/oauth/token",
};

export interface oauthToken {
    access_token: string;
    created_at: number;
    expires_in: number;
    refresh_token: string;
    scope: string;
    secret_valid_until: number;
    token_type: string
}

export async function getRefreshToken(): Promise<string | null> {
    try {
        const token_object = await SecureStore.getItemAsync("token_oauth");
        if (!token_object)
            return null
        const json_token = JSON.parse(token_object) as oauthToken
        return json_token.refresh_token;
    }
    catch (e) {
        console.error(e);
        return null;
    }
}

async function refreshToken(): Promise<string | null> {
    const refresh_token = await getRefreshToken();
    if (!refresh_token)
        return null;
    const params = new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refresh_token,
        client_id: process.env.EXPO_PUBLIC_API42_UID,
        client_secret: process.env.EXPO_PUBLIC_API42_SECRET
    });
    try {
        const response_exchange = await fetch(discovery.tokenEndpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: params.toString(),
        });
        if (response_exchange.ok) {
            const token_json = await response_exchange.json() as oauthToken;
            await SecureStore.setItemAsync("token_oauth", JSON.stringify(token_json));
            return token_json.access_token;
        } else {
            console.log(response_exchange.status, await response_exchange.json());
            return null;
        }
    } catch (e) {
        console.log(e);
        return null;
    }
}


export async function tokenStillValid(): Promise<string | null> {
    try {
        const token_object = await SecureStore.getItemAsync("token_oauth");
        if (!token_object)
            return null;
        const json_token = JSON.parse(token_object) as oauthToken;
    
        //case refresh
        if (((json_token.created_at + json_token.expires_in) * 1000) < Date.now()) {
            console.log("token expired");
            const refresh_token = await refreshToken() ;
            if (refresh_token === null)
                return null;
            return refresh_token;
        }
        // case secret in .env need change
        else if ((json_token.secret_valid_until * 1000) < Date.now()) {
            console.log("42 api secret expired , need renewal on the .env");
            return null;
        }
        // case token still valid
        else
        {
            return json_token.access_token;
        }
    } catch (error) {
        console.log(error);
        return null;
    }
}
