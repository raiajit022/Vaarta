#!/bin/bash
set -e
az acr login --name vaartaregistry
TAG=$(git rev-parse --short HEAD)
echo "Deploying with TAG=$TAG"

echo "Building Auth Service in ACR..."
az acr build --registry vaartaregistry --image auth-service:latest --image auth-service:$TAG ./auth-service
az containerapp update --name auth-service --resource-group vaarta-rg --image vaartaregistry.azurecr.io/auth-service:$TAG

echo "Building Meeting Service in ACR..."
az acr build --registry vaartaregistry --image meeting-service:latest --image meeting-service:$TAG ./meeting-service
az containerapp update --name meeting-service --resource-group vaarta-rg --image vaartaregistry.azurecr.io/meeting-service:$TAG

echo "Building Notification Service in ACR..."
az acr build --registry vaartaregistry --image notification-service:latest --image notification-service:$TAG ./notification-service
az containerapp update --name notification-service --resource-group vaarta-rg --image vaartaregistry.azurecr.io/notification-service:$TAG

echo "Building AI Service in ACR..."
az acr build --registry vaartaregistry --image ai-service:latest --image ai-service:$TAG ./ai-service
az containerapp update --name ai-service --resource-group vaarta-rg --image vaartaregistry.azurecr.io/ai-service:$TAG

echo "Deployment Complete!"
