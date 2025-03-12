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

# Función para desplegar el backend
deploy_backend() {
    print_header "Desplegando Backend en AWS Lambda"
    
    # Instalar dependencias si es necesario
    if [ "$1" == "--install" ]; then
        echo "Instalando dependencias del backend..."
        npm install
    fi
    
    # Desplegar con serverless
    if [ "$2" == "prod" ]; then
        echo "Desplegando en ambiente de producción..."
        npm run deploy:backend:prod
    else
        echo "Desplegando en ambiente de desarrollo..."
        npm run deploy:backend
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
    echo "Uso: $0 [--backend|--frontend|--all] [--install] [prod]"
    echo ""
    echo "Opciones:"
    echo "  --backend  Desplegar solo el backend en AWS Lambda"
    echo "  --frontend Preparar solo el frontend para AWS Amplify"
    echo "  --all      Desplegar ambos componentes"
    echo "  --install  Instalar dependencias antes de desplegar"
    echo "  prod       Desplegar en ambiente de producción"
    exit 0
fi

# Analizar argumentos
COMPONENT=$1
INSTALL=""
ENV=""

if [[ "$*" == *"--install"* ]]; then
    INSTALL="--install"
fi

if [[ "$*" == *"prod"* ]]; then
    ENV="prod"
fi

# Ejecutar la acción correspondiente
case $COMPONENT in
    --backend)
        deploy_backend $INSTALL $ENV
        ;;
    --frontend)
        deploy_frontend $INSTALL
        ;;
    --all)
        deploy_all $INSTALL $ENV
        ;;
    *)
        echo "Opción no válida: $COMPONENT"
        echo "Use: $0 [--backend|--frontend|--all] [--install] [prod]"
        exit 1
        ;;
esac

exit 0 