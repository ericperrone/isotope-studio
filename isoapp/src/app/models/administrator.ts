export interface Administrator {
    id: number;
    account: string;
    active: boolean;
    email: string;
    password?: string;
}