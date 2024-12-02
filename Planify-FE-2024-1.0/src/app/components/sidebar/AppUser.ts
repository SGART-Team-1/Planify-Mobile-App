export interface AppUser {
    id: number;
    name: string;
    surnames: string
    photo: string | ArrayBuffer | null;
    dtype: string;
}
