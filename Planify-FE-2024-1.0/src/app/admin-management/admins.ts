export interface Admin {
    id: number;
    name: string;
    surnames: string
    email: string;
    password: string;
    centre: string;
    internal: boolean;
    photo: string | ArrayBuffer | null;
}
