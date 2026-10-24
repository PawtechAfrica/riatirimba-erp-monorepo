declare interface ProfileObj {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
}

declare interface LoginResponseObj {
    "access_token": string;
    "refresh_token": string;
    "user": LoggedInUserObj
}

declare interface LoggedInUserObj {
    "name": string;
    "role": string;
    "permissions": string[];
}


declare interface CreateSystemUserObj {
    id?: number;
    username: string;
    email: string;
    role: string;
    permissions: Set<number>
}

declare type MapPage<K, T> = Map<K, T>

