// Define el tipo de usuario como opcional usando Partial
export type Useredit = {
  id?: number;
  email?: string;
  name?: string;
  surnames?: string;
  department?: string;
  centre?: string;
  profile?: string;
  registrationDate?: string;
  password?: string;
  confirmPassword?: string;
  photo?: string ;
};


export type Adminedit = {
  id?: number;
  email?: string;
  name?: string;
  surnames?: string;
  centre?: string;
  photo?: string ;
  internal?: boolean;
};


// Definición de la interfaz para los parámetros del registro
export interface RegisterParams {
  email: string;
  name: string;
  surnames: string;
  department: string;
  center: string;
  profile: string;
  discharge_date: string;
  pwd1: string;
  pwd2: string;
  profileImageUrl: string | ArrayBuffer | null;
}