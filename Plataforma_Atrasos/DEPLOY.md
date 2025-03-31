# Guía de Despliegue: Sistema de Control de Asistencia

Esta guía explica cómo desplegar el backend y frontend del Sistema de Control de Asistencia en AWS.

## Requisitos Previos

- Node.js v18 o superior
- npm
- AWS CLI configurado con las credenciales apropiadas
- Docker instalado y configurado
- Serverless Framework v3 (instalación global: `npm install -g serverless@3`)

## Configuración del Archivo .env

Antes de iniciar cualquier proceso de despliegue, asegúrese de que el archivo `.env` contiene todas las variables de entorno necesarias:

```
DB_HOST=su-host-db
DB_USER=su-usuario-db
DB_PASSWORD=su-contraseña-db
DB_NAME=su-nombre-db
DB_PORT=5432
JWT_SECRET=su-clave-secreta-jwt
FRONTEND_URL=http://localhost:3000
FRONTEND_URL_PROD=https://sudominio.com
```

## Despliegue Automatizado

Para simplificar el proceso de despliegue, este proyecto incluye un script que automatiza la mayoría de las tareas.

### Despliegue del Backend (Contenedor Lambda)

El backend ahora se despliega como un contenedor Docker en AWS Lambda, lo que proporciona mayor consistencia entre entornos de desarrollo y producción.

1. **Construir y desplegar el contenedor**:

   ```bash
   ./deploy.sh --backend
   ```

   Este comando:
   - Construye una imagen Docker con el código del backend
   - Sube la imagen a Amazon ECR (Elastic Container Registry)
   - Despliega la función Lambda usando la imagen de contenedor
   - Configura el API Gateway para exponer los endpoints

2. **Despliegue en producción**:

   ```bash
   ./deploy.sh --backend prod
   ```

3. **Instalar dependencias y desplegar**:

   ```bash
   ./deploy.sh --backend --install
   ```

4. **Usar una imagen existente** (omitir construcción de imagen):

   ```bash
   ./deploy.sh --backend --skip-image
   ```

### Despliegue del Frontend

1. **Preparar el frontend para despliegue**:

   ```bash
   ./deploy.sh --frontend
   ```

   Este comando compilará la aplicación React, dejándola lista para subir a AWS Amplify.

2. **Instalar dependencias y construir**:

   ```bash
   ./deploy.sh --frontend --install
   ```

### Despliegue Completo (Backend + Frontend)

Para desplegar ambos componentes a la vez:

```bash
./deploy.sh --all
```

O para ambiente de producción:

```bash
./deploy.sh --all prod
```

## Despliegue Manual del Backend

Si prefiere realizar un despliegue manual sin utilizar el script automatizado:

1. **Construir la imagen Docker**:

   ```bash
   # Iniciar sesión en ECR
   aws ecr get-login-password --region us-east-2 | docker login --username AWS --password-stdin [AWS_ACCOUNT_ID].dkr.ecr.us-east-2.amazonaws.com
   
   # Construir la imagen
   docker build -t [AWS_ACCOUNT_ID].dkr.ecr.us-east-2.amazonaws.com/plataforma-atrasos-backend:latest .
   
   # Subir la imagen a ECR
   docker push [AWS_ACCOUNT_ID].dkr.ecr.us-east-2.amazonaws.com/plataforma-atrasos-backend:latest
   ```

2. **Desplegar con Serverless Framework**:

   ```bash
   # Exportar la URI de la imagen
   export ECR_IMAGE_URI=[AWS_ACCOUNT_ID].dkr.ecr.us-east-2.amazonaws.com/plataforma-atrasos-backend:latest
   
   # Desplegar
   serverless deploy --stage production --region us-east-2
   ```

## Solución de Problemas

### Problemas con el Contenedor

- **Error de conectividad al WhatsApp**: Verifique que el contenedor tenga acceso a las dependencias necesarias para Puppeteer y WhatsApp Web.
- **Límite de memoria**: Si la función Lambda falla, puede ser necesario aumentar el tamaño de memoria en el archivo `serverless.yml`.

### Problemas de Despliegue

- **Error al subir la imagen a ECR**: Verifique sus credenciales de AWS y asegúrese de tener los permisos necesarios.
- **Falla al cargar dependencias**: El contenedor puede necesitar bibliotecas adicionales para Chrome/Puppeteer.

## Monitorización y Logs

Puede monitorear la función Lambda a través de la consola de AWS CloudWatch:

```bash
# Ver logs de la función Lambda
aws logs filter-log-events --log-group-name /aws/lambda/backend-sistema-asistencia-production
```

O a través del comando serverless:

```bash
serverless logs -f backend-sistema-asistencia -t
```

## Recursos AWS Utilizados

- **AWS Lambda**: Alojamiento del backend
- **API Gateway**: Expone el backend como API REST
- **AWS Amplify**: Alojamiento del frontend React
- **RDS/Aurora**: Base de datos (configurar por separado)
- **IAM**: Roles y políticas de permisos

## Notas Adicionales

- Después del despliegue del backend, anote la URL del API Gateway generada
- Actualice la variable de entorno `REACT_APP_API_URL` en Amplify con esta URL
- Para depuración local, use `npm run offline` para emular Lambda localmente

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