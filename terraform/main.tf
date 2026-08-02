terraform {
  required_version = ">= 1.0.0"
  required_providers {
    minikube = {
      source  = "scott-the-programmer/minikube"
      version = "0.4.2"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "2.32.0"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "2.15.0"
    }
  }
}

provider "kubernetes" {
  config_path = "~/.kube/config"
}

provider "helm" {
  kubernetes {
    config_path = "~/.kube/config"
  }
}

# Namespace для приложения
resource "kubernetes_namespace" "beer_namespace" {
  metadata {
    name = "beer-marketplace-tf"
  }
}

# Вывод информации
output "namespace_created" {
  value = kubernetes_namespace.beer_namespace.metadata[0].name
}
