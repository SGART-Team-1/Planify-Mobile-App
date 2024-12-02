export interface User {
    id: number;
    name: string;
    surnames: string
    email: string;
    password: string;
    centre: string;
    department: string;
    profile: string;
    registrationDate: string;
    photo: string | ArrayBuffer | null;
    activated: boolean;
    blocked: boolean;
    dtype: string;
    hasAbsences: boolean; //ausencias del usuario en la hora de la reunion
    hasMeetings: boolean;

}
