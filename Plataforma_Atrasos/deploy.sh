#!/bin/bash

# Script para desplegar frontend y backend en AWS

# Colores para los mensajes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_header() {
    echo -e "\n${YELLOW}=======================================${NC}"
    echo -e "${YELLOW}$1${NC}"
    echo -e "${YELLOW}=======================================${NC}\n"
}

# Función para construir y subir la imagen Docker a ECR
build_and_push_image() {
    print_header "Construyendo y subiendo imagen Docker a ECR"
    
    # Verificar si tenemos AWS CLI y Docker instalados
    if ! command -v aws &> /dev/null || ! command -v docker &> /dev/null; then
        echo "Error: Se requiere AWS CLI y Docker para este despliegue."
        echo "Por favor, instale ambas herramientas e inténtelo de nuevo."
        exit 1
    fi
    
    # Obtener la cuenta de AWS
    AWS_ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
    AWS_REGION=us-east-2
    ECR_REPO_NAME=plataforma-atrasos-backend
    
    echo "Iniciando sesión en Amazon ECR..."
    aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT.dkr.ecr.$AWS_REGION.amazonaws.com
    
    # Crear el repositorio si no existe
    aws ecr describe-repositories --repository-names $ECR_REPO_NAME --region $AWS_REGION || \
    aws ecr create-repository --repository-name $ECR_REPO_NAME --region $AWS_REGION
    
    # Construir la imagen Docker con fecha y hora
    IMAGE_TAG=$(date +%Y%m%d%H%M%S)
    REPO_URI=$AWS_ACCOUNT.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO_NAME
    
    echo "Construyendo imagen Docker..."
    docker build -t $REPO_URI:$IMAGE_TAG -t $REPO_URI:latest .
    
    echo "Subiendo imagen a ECR..."
    docker push $REPO_URI:$IMAGE_TAG
    docker push $REPO_URI:latest
    
    # Guardar la URI de la imagen para el despliegue de serverless
    echo "export ECR_IMAGE_URI=$REPO_URI:$IMAGE_TAG" > .ecr-image-uri
    source .ecr-image-uri
    
    echo -e "${GREEN}Imagen subida exitosamente a ECR: $ECR_IMAGE_URI${NC}"
}

# Función para desplegar el backend
deploy_backend() {
    print_header "Desplegando Backend en AWS Lambda como Container"
    
    # Instalar dependencias si es necesario
    if [ "$1" == "--install" ]; then
        echo "Instalando dependencias del backend..."
        npm install
        npm install -g serverless@3
    fi
    
    # Construir y subir la imagen Docker si es necesario
    if [ "$1" != "--skip-image" ]; then
        build_and_push_image
    else
        # Cargar la URI de la imagen desde el archivo (si existe)
        if [ -f .ecr-image-uri ]; then
            source .ecr-image-uri
        else
            echo "Error: No se encontró la URI de la imagen. Elimine la opción --skip-image."
            exit 1
        fi
    fi
    
    # Desplegar con serverless
    if [ "$2" == "prod" ]; then
        echo "Desplegando en ambiente de producción..."
        serverless deploy --stage production --region us-east-2 --verbose
    else
        echo "Desplegando en ambiente de desarrollo..."
        serverless deploy --verbose
    fi
}

# Función para desplegar el frontend
deploy_frontend() {
    print_header "Preparando Frontend para AWS Amplify"
    
    cd frontend
    
    # Instalar dependencias si es necesario
    if [ "$1" == "--install" ]; then
        echo "Instalando dependencias del frontend..."
        npm install
    fi
    
    # Construir la aplicación
    echo "Construyendo la aplicación React..."
    npm run build
    
    echo -e "${GREEN}Frontend construido exitosamente!${NC}"
    echo -e "${YELLOW}Para desplegar en AWS Amplify:${NC}"
    echo "1. Vaya a la consola de AWS Amplify"
    echo "2. Seleccione 'Host web app'"
    echo "3. Configure con su repositorio de git o suba el directorio 'build'"
    echo "4. Asegúrese de usar el archivo 'amplify.yml' para la configuración"
    
    cd ..
}

# Función para desplegar todo
deploy_all() {
    print_header "Desplegando todo (Backend y Frontend)"
    
    # Desplegar backend
    deploy_backend $1 $2
    
    # Desplegar frontend
    deploy_frontend $1
}

# Verificar argumentos
if [ $# -eq 0 ]; then
    print_header "Sistema de Despliegue para Plataforma de Atrasos"
    echo "Uso: $0 [--backend|--frontend|--all] [--install] [--skip-image] [prod]"
    echo ""
    echo "Opciones:"
    echo "  --backend     Desplegar solo el backend en AWS Lambda Container"
    echo "  --frontend    Preparar solo el frontend para AWS Amplify"
    echo "  --all         Desplegar ambos componentes"
    echo "  --install     Instalar dependencias antes de desplegar"
    echo "  --skip-image  Omitir la construcción de la imagen Docker (usar la última)"
    echo "  prod          Desplegar en ambiente de producción"
    exit 0
fi

# Analizar argumentos
COMPONENT=$1
INSTALL=""
ENV=""
SKIP_IMAGE=""

if [[ "$*" == *"--install"* ]]; then
    INSTALL="--install"
fi

if [[ "$*" == *"--skip-image"* ]]; then
    SKIP_IMAGE="--skip-image"
fi

if [[ "$*" == *"prod"* ]]; then
    ENV="prod"
fi

# Ejecutar la acción correspondiente
case $COMPONENT in
    --backend)
        deploy_backend $INSTALL $SKIP_IMAGE $ENV
        ;;
    --frontend)
        deploy_frontend $INSTALL
        ;;
    --all)
        deploy_all $INSTALL $SKIP_IMAGE $ENV
        ;;
    *)
        echo "Opción no válida: $COMPONENT"
        echo "Use: $0 [--backend|--frontend|--all] [--install] [--skip-image] [prod]"
        exit 1
        ;;
esac

exit 0 