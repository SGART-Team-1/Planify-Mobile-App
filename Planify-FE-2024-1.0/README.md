# Clonando por primera vez

Si es la primera vez que clonais el repo, debeis:
- Instalar la version de node 20.18.0 que es la LTS, así no dará problemas con las versiones ->  [Enlace al Instalador de Windows (Seleccionar la versión 20.18.0 LTS)](https://nodejs.org/en/download/prebuilt-installer/current)
- Ejecutar:
```bash
# 1. Clonar el repositorio
git clone https://github.com/xxgonzalo/Planify-FE-2024.git

# 2. Navegar al directorio del proyecto
cd Planify-FE-2024

# 3. Instalar dependencias
npm install

# 4. Servir la aplicación
ng serve
```
**NOTA:** si ng serve no os funciona, y os sale el siguiente error:
```bash
ng : No se puede cargar el archivo C:\Users\marco\AppData\Roaming\npm\ng.ps1 porque la ejecución de scripts está deshabilitada en este 
sistema. Para obtener más información, consulta el tema about_Execution_Policies en https:/go.microsoft.com/fwlink/?LinkID=135170.
En línea: 1 Carácter: 1
+ ng serve
+ ~~
    + CategoryInfo          : SecurityError: (:) [], PSSecurityException
    + FullyQualifiedErrorId : UnauthorizedAccess
```
La manera de solucionarlo es cambiando los permisos de powershell, para ello:
- Ejecutais el powershell como administrador
- Ejecutais:
  ```bash
   Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
  ```


# PlanifyFE2024
This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 18.2.7.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
