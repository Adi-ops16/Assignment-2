export interface IUser {
    name: string;
    email: string;
    role: 'contributor' | 'maintainer';
    password: string
}

export interface IResUser extends Omit<IUser, "password"> {
    id: number;
    created_at: Date;
    updated_at: Date;
}

export interface IJwtPayload {
    id: number;
    name: string;
    email: string;
    role: 'maintainer' | 'contributor';
}

