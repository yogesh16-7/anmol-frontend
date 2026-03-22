export type User = {
    id: string;
    email: string;
    name: string;
    imageUrl?: string;
    token?: string;
};

export type SignUpParams = {
    email: string;
    name: string;
    password: string;
    phone?: string;
    street?: string;
    apartment?: string;
    zip?: string;
    city?: string;
    country?: string;
    checkout?: boolean;
    dialogId: string;
}

export type SignInParams = Omit<SignUpParams, 'name'>;