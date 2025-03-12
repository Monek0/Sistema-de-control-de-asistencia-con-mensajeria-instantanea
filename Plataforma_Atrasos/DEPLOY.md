# Guía de Despliegue - Plataforma de Control de Atrasos

Esta guía detalla los pasos para desplegar la Plataforma de Control de Atrasos en AWS, separando el frontend (React) y el backend (Express.js).

## Requisitos Previos

- Cuenta de AWS con acceso a Lambda, Amplify y otros servicios necesarios
- AWS CLI instalado y configurado con credenciales válidas
- Node.js (versión 16 o superior) y npm instalados
- Serverless Framework instalado globalmente (`npm install -g serverless`)

## Estructura del Proyecto

- `frontend/`: Aplicación React
- `src/`: Backend Express.js configurado para serverless

## Configuración de Variables de Entorno

### Backend (Lambda)

Cree un archivo `.env` en la raíz del proyecto con las siguientes variables:

```
DB_HOST=su_host_db
DB_USER=su_usuario_db
DB_PASSWORD=su_password_db
DB_NAME=su_nombre_db
JWT_SECRET=su_clave_secreta_jwt
```

Para producción, configure estas variables en AWS Systems Manager Parameter Store o Lambda Environment Variables.

### Frontend (Amplify)

Configure las variables de entorno en AWS Amplify:

1. En la consola de Amplify, vaya a su aplicación
2. Navegue a "Environment variables"
3. Agregue la variable `REACT_APP_API_URL` con la URL del backend 

## Despliegue

Se proporciona un script de despliegue para facilitar el proceso:

```bash
# Dar permisos de ejecución al script (solo la primera vez)
chmod +x deploy.sh

# Ver las opciones de despliegue
./deploy.sh

# Desplegar solo el backend (desarrollo)
./deploy.sh --backend

# Desplegar backend con instalación de dependencias
./deploy.sh --backend --install

# Desplegar backend en producción
./deploy.sh --backend prod

# Preparar el frontend para Amplify
./deploy.sh --frontend

# Desplegar todo
./deploy.sh --all --install
```

## Despliegue Manual

### Backend (Lambda)

```bash
# Instalar dependencias
npm install

# Desplegar en AWS Lambda (desarrollo)
npm run deploy:backend

# Desplegar en producción
npm run deploy:backend:prod
```

### Frontend (Amplify)

1. Navegue al directorio frontend:
   ```bash
   cd frontend
   ```

2. Instale las dependencias:
   ```bash
   npm install
   ```

3. Construya la aplicación:
   ```bash
   npm run build
   ```

4. Despliegue en AWS Amplify:
   - Opción 1: Conecte su repositorio Git a Amplify
   - Opción 2: Suba manualmente el directorio `build` a través de la consola de Amplify

## Configuración de AWS Amplify

1. Vaya a la consola de AWS Amplify
2. Haga clic en "Host web app"
3. Elija su método de despliegue (Git o manual)
4. Configure la compilación usando el archivo `amplify.yml` 
5. Configure las variables de entorno necesarias
6. Haga clic en "Save and deploy"

## Notas Adicionales

- Después del despliegue del backend, anote la URL del API Gateway generada
- Actualice la variable de entorno `REACT_APP_API_URL` en Amplify con esta URL
- Para depuración local, use `npm run offline` para emular Lambda localmente

## Recursos AWS Utilizados

- **AWS Lambda**: Alojamiento del backend
- **API Gateway**: Expone el backend como API REST
- **AWS Amplify**: Alojamiento del frontend React
- **RDS/Aurora**: Base de datos (configurar por separado)
- **IAM**: Roles y políticas de permisos

## Solución de Problemas

- **Error de conexión al backend**: Verifique la URL del API en la variable de entorno
- **Error CORS**: Verifique la configuración CORS en serverless.yml
- **Error 500 en Lambda**: Revise los logs en CloudWatch
- **Problemas de despliegue**: Verifique las credenciales de AWS CLI 