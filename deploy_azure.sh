#!/bin/bash
set -e
az acr login --name vaartaregistry
TAG=$(git rev-parse --short HEAD)
echo "Deploying with TAG=$TAG"

echo "Building Auth Service..."
docker build -t vaartaregistry.azurecr.io/auth-service:latest -t vaartaregistry.azurecr.io/auth-service:$TAG ./auth-service
docker push vaartaregistry.azurecr.io/auth-service:latest
docker push vaartaregistry.azurecr.io/auth-service:$TAG
az containerapp update --name auth-service --resource-group vaarta-rg --image vaartaregistry.azurecr.io/auth-service:$TAG

echo "Building Meeting Service..."
docker build -t vaartaregistry.azurecr.io/meeting-service:latest -t vaartaregistry.azurecr.io/meeting-service:$TAG ./meeting-service
docker push vaartaregistry.azurecr.io/meeting-service:latest
docker push vaartaregistry.azurecr.io/meeting-service:$TAG
az containerapp update --name meeting-service --resource-group vaarta-rg --image vaartaregistry.azurecr.io/meeting-service:$TAG

echo "Building Notification Service..."
docker build -t vaartaregistry.azurecr.io/notification-service:latest -t vaartaregistry.azurecr.io/notification-service:$TAG ./notification-service
docker push vaartaregistry.azurecr.io/notification-service:latest
docker push vaartaregistry.azurecr.io/notification-service:$TAG
az containerapp update --name notification-service --resource-group vaarta-rg --image vaartaregistry.azurecr.io/notification-service:$TAG

echo "Building AI Service..."
docker build -t vaartaregistry.azurecr.io/ai-service:latest -t vaartaregistry.azurecr.io/ai-service:$TAG ./ai-service
docker push vaartaregistry.azurecr.io/ai-service:latest
docker push vaartaregistry.azurecr.io/ai-service:$TAG
az containerapp update --name ai-service --resource-group vaarta-rg --image vaartaregistry.azurecr.io/ai-service:$TAG

echo "Deployment Complete!"
