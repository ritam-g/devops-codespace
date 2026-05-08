# Kubernetes + GitHub Codespaces Beginner Guide

# What You Successfully Did

You successfully:

* Built a Docker image
* Created a Kubernetes cluster using Kind
* Created a Deployment
* Created Pods
* Created a Service
* Used Port Forwarding
* Accessed your app from browser

That means your Kubernetes setup is working correctly.

---

# First Understand The Main Difference

## Normal Local Laptop Setup

Your mentor probably used:

```bash
http://localhost
```

because everything was running directly on their laptop.

Flow:

```text
Browser
↓
localhost
↓
Docker/Kubernetes
↓
Node.js App
```

Very simple networking.

---

# Your Setup Is Different

You are using GitHub Codespaces.

That means your code is NOT running on your laptop.

It is running on a cloud machine provided by GitHub.

So your real flow is:

```text
Your Browser
↓
Internet
↓
GitHub Tunnel
↓
GitHub Codespaces VM
↓
Kind Kubernetes Cluster
↓
Service
↓
Pod
↓
Node.js App
```

Because of this, GitHub creates special URLs like:

```text
https://super-engine-xxxxx-3000.app.github.dev
```

---

# What Is Docker?

Docker is used to create and run containers.

Example:

```bash
docker build -t kuber .
```

This creates a Docker image.

Then:

```bash
docker run -p 3000:3000 kuber
```

runs the container.

---

# What Is Kubernetes?

Kubernetes manages containers automatically.

Instead of manually running containers, you tell Kubernetes:

```text
"Please keep my application running."
```

Then Kubernetes:

* Creates containers
* Restarts crashed containers
* Scales containers
* Manages networking
* Keeps applications healthy

---

# Main Kubernetes Components

# 1. Deployment

Deployment manages Pods.

Example:

```yaml
kind: Deployment
```

Responsibilities:

* Creates Pods
* Restarts failed Pods
* Maintains replica count
* Handles rolling updates

---

# 2. Pod

Pod is the smallest unit in Kubernetes.

A Pod contains container(s).

Flow:

```text
Deployment
↓
Pod
↓
Container
```

---

# 3. Service

Service exposes Pods inside Kubernetes.

Without Service:

* Pods can change IPs
* Browser cannot reliably access app

Service provides stable networking.

Example:

```yaml
kind: Service
```

---

# 4. Ingress

Ingress routes HTTP traffic.

Example:

```text
Browser
↓
Ingress
↓
Service
↓
Pod
```

Ingress is like a smart traffic controller.

---

# Why Your Ingress Was Difficult

GitHub Codespaces already uses HTTPS tunnels.

So when Kubernetes Ingress tried to use HTTP internally, networking became more complicated.

That is why:

```text
kubectl port-forward
```

worked more easily.

---

# What Does Port Mean?

A port is like a room number.

Example:

```text
Building = Server
Room Number = Port
```

Example:

```text
3000
```

means your application is listening on room 3000.

---

# What Does 3000:3000 Mean?

Example:

```bash
kubectl port-forward service/express-service 3000:3000
```

Meaning:

```text
Your Access Port : Kubernetes Service Port
```

Visual:

```text
Browser
↓
Port 3000
↓
Kubernetes Service Port 3000
↓
Pod Port 3000
↓
Express App
```

---

# Why Mentor Used Only localhost

When browser sees:

```text
http://localhost
```

browser automatically assumes:

```text
http://localhost:80
```

because:

| Protocol | Default Port |
| -------- | ------------ |
| HTTP     | 80           |
| HTTPS    | 443          |

Your mentor probably already had:

* Port 80 mapped
* Ingress configured
* Docker Desktop Kubernetes
* Minikube
* Local networking setup

So everything looked automatic.

---

# Why You Needed Kind

GitHub Codespaces gives:

```text
Linux VM
```

but NOT a full Kubernetes cluster.

So you installed:

* kubectl
* kind
* ingress controller

---

# What Is Kind?

Kind means:

```text
Kubernetes IN Docker
```

Kind creates Kubernetes nodes using Docker containers.

Flow:

```text
Docker
↓
Kind
↓
Kubernetes Cluster
```

---

# Why ImagePullBackOff Happened

Your image:

```text
kuber:latest
```

existed only in Docker.

But Kubernetes node could not see it automatically.

So Kubernetes tried downloading from Docker Hub.

That failed.

Fix:

```bash
kind load docker-image kuber:latest
```

This copied image into Kubernetes node.

---

# Final Working Flow

```text
Docker Image
↓
Kind Kubernetes Cluster
↓
Deployment
↓
Pods
↓
Service
↓
Port Forward
↓
GitHub Codespaces URL
↓
Browser
```

---

# Commands You Learned

## Build Image

```bash
docker build -t kuber:latest .
```

---

## Load Image Into Kind

```bash
kind load docker-image kuber:latest
```

---

## Apply Deployment

```bash
kubectl apply -f ./k8s/deployment.yml
```

---

## Apply Service

```bash
kubectl apply -f ./k8s/service.yml
```

---

## Port Forward

```bash
kubectl port-forward service/express-service 3000:3000
```

---

## Check Pods

```bash
kubectl get pods
```

---

## Check Services

```bash
kubectl get svc
```

---

## Check Deployments

```bash
kubectl get deployments
```

---

# Beginner Mental Model

## Docker

Runs ONE container manually.

```text
You manage containers.
```

---

## Kubernetes

Manages MANY containers automatically.

```text
Kubernetes manages containers.
```

---

# Most Important Understanding

You did NOT fail.

Your environment was actually more advanced than your mentor's local setup.

Because you learned:

* Cloud environment
* Kubernetes
* Docker
* Networking
* Port forwarding
* Kind
* GitHub Codespaces
* Kubernetes Services
* Pods
* Deployments

All together.

That is real DevOps learning.
