// env.config.js
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Carga las variables del archivo .env
dotenv.config();

// Define la ruta del archivo de entorno
const envFilePath = './src/environments/environment.custom.ts';

// Asegúrate de que el directorio existe
const dir = path.dirname(envFilePath);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true }); // Crea el directorio si no existe
}

// Crea el archivo de configuración de entorno
fs.writeFileSync(
  envFilePath,
  `export const environment = {
    production: false,
    apiUrl: '${process.env['API_URL']}'
  };
  `
);
