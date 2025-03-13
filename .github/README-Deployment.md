# Despliegue Automático a AWS Lambda

Este repositorio está configurado para desplegar automáticamente el backend de la Plataforma de Atrasos a AWS Lambda cuando se realizan cambios en la rama `main`.

## Workflow de CI/CD

El workflow está configurado en el archivo `.github/workflows/deploy-lambda.yml` y se activa automáticamente cuando:

1. Se realiza un push a la rama `main`.
2. Los cambios afectan a archivos dentro del directorio `Plataforma_Atrasos` (excepto en los directorios frontend, cypress y __mocks__).

## Configuración necesaria

### Secretos de GitHub

Los siguientes secretos deben ser configurados en la sección de "Settings > Secrets and variables > Actions" del repositorio:

- **AWS_ACCESS_KEY_ID**: Clave de acceso de AWS con permisos para desplegar a Lambda.
- **AWS_SECRET_ACCESS_KEY**: Clave secreta correspondiente.
- **DB_HOST**: Host de la base de datos PostgreSQL.
- **DB_USER**: Usuario de la base de datos.
- **DB_PASSWORD**: Contraseña de la base de datos.
- **DB_NAME**: Nombre de la base de datos.
- **DB_PORT**: Puerto de la base de datos (por defecto: 6543).
- **JWT_SECRET**: Secret para firmar los tokens JWT.

## Cómo configurar los secretos

1. En GitHub, ve a tu repositorio.
2. Haz clic en "Settings".
3. En el menú lateral, ve a "Secrets and variables" > "Actions".
4. Haz clic en "New repository secret" y agrega cada uno de los secretos mencionados anteriormente.

## Verificar el estado del despliegue

Cada vez que se hace un push a la rama `main`, puedes verificar el estado del despliegue en la pestaña "Actions" del repositorio.

## Despliegue manual

Si necesitas realizar un despliegue manual, puedes ejecutar:

```bash
cd Plataforma_Atrasos
./deploy.sh --backend prod
```

## Problemas comunes

- **Error de credenciales AWS**: Verifica que el usuario de AWS tenga permisos suficientes para desplegar a Lambda.
- **Error de dependencias**: Si hay problemas con las dependencias, intenta actualizar package-lock.json con `npm install`.
- **Variables de entorno faltantes**: Asegúrate de que todos los secretos estén configurados en GitHub. 