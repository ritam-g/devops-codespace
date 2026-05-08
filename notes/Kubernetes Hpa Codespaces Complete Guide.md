# 🚀 Kubernetes HPA Autoscaling Setup in GitHub Codespaces (Complete Guide)

---

# 📌 What We Built

In this project we created:

* Dockerized Node.js app
* Kubernetes Deployment
* Kubernetes Service
* Metrics Server
* Horizontal Pod Autoscaler (HPA)
* CPU Monitoring
* Live Traffic Testing
* Auto Scaling based on CPU usage
* Public Hosting using GitHub Codespaces

---

# 🧠 Final Architecture

```text
Browser / curl / ab
        ↓
GitHub Codespaces Public URL
        ↓
kubectl port-forward
        ↓
Kubernetes Service
        ↓
Kubernetes Pods (Replicas)
        ↓
Node.js Express App
```

---

# 📂 Project Structure

```text
project/
│
├── Dockerfile
├── package.json
├── index.js
│
└── k8s/
    ├── deployment.yml
    └── service.yml
```

---

# ⚡ Step 1 — Create Express App

## 📄 index.js

```js
import express from 'express'
import morgan from 'morgan'
import os from 'os'

const app = express()

app.use(morgan('dev'))

const PORT = 3000

app.get('/', (req, res) => {
  let sum = 0

  for (let i = 0; i < 100000000; i++) {
    sum += i
  }

  res.status(200).json({
    message: 'Hello from Kubernetes',
    pod: os.hostname(),
    sum,
  })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
```

---

# 🧠 Why We Added Heavy Loop

```js
for (let i = 0; i < 100000000; i++)
```

This creates CPU load.

Without CPU load:

* HPA will never scale
* CPU usage stays near 0m

With CPU load:

* CPU spikes
* Kubernetes detects high usage
* HPA creates new pods automatically

---

# ⚡ Step 2 — Dockerize Application

## 📄 Dockerfile

```dockerfile
FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["node", "index.js"]
```

---

# ⚡ Step 3 — Build Docker Image

## 📌 Command

```bash
docker build -t kuber:latest .
```

## 🧠 What This Does

Builds Docker image from Dockerfile.

Image name:

```text
kuber:latest
```

---

# ⚡ Step 4 — Create KIND Cluster

## 📌 Install KIND

```bash
curl -Lo ./kind https://kind.sigs.k8s.io/dl/v0.22.0/kind-linux-amd64
chmod +x ./kind
sudo mv ./kind /usr/local/bin/kind
```

---

## 📌 Create Cluster

```bash
kind create cluster
```

---

# ⚡ Step 5 — Load Docker Image into KIND

## 📌 Command

```bash
kind load docker-image kuber:latest
```

## 🧠 Why This Is Needed

KIND runs Kubernetes inside Docker.

So Kubernetes cannot automatically see your local Docker images.

This command copies image into KIND cluster.

---

# ⚡ Step 6 — Create Kubernetes Deployment

## 📄 k8s/deployment.yml

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: express-deployment-kubernetes

spec:
  replicas: 3

  selector:
    matchLabels:
      app: express-deployment-kubernetes

  template:
    metadata:
      labels:
        app: express-deployment-kubernetes

    spec:
      containers:
        - name: express-container
          image: kuber:latest
          imagePullPolicy: Never

          ports:
            - containerPort: 3000

          resources:
            requests:
              cpu: "100m"
            limits:
              cpu: "500m"
```

---

# 🧠 Important Concepts

## 🔹 replicas

```yaml
replicas: 3
```

Creates 3 pods.

---

## 🔹 imagePullPolicy: Never

```yaml
imagePullPolicy: Never
```

Prevents Kubernetes from trying Docker Hub.

Because image already exists inside KIND.

---

## 🔹 CPU Requests & Limits

```yaml
resources:
```

Required for proper HPA behavior.

### requests

Minimum guaranteed CPU.

### limits

Maximum allowed CPU.

---

# ⚡ Step 7 — Create Service

## 📄 k8s/service.yml

```yaml
apiVersion: v1
kind: Service
metadata:
  name: main-server-service

spec:
  selector:
    app: express-deployment-kubernetes

  ports:
    - protocol: TCP
      port: 80
      targetPort: 3000
```

---

# 🧠 Service Explanation

## 🔹 port

```yaml
port: 80
```

Service port.

---

## 🔹 targetPort

```yaml
targetPort: 3000
```

Container port inside pod.

---

# ⚡ Step 8 — Apply Kubernetes Files

## 📌 Apply Deployment

```bash
kubectl apply -f k8s/deployment.yml
```

---

## 📌 Apply Service

```bash
kubectl apply -f k8s/service.yml
```

---

# ⚡ Step 9 — Verify Pods

## 📌 Command

```bash
kubectl get pods
```

---

## 📌 Watch Pods Live

```bash
kubectl get pods -w
```

---

# ⚡ Step 10 — Install Metrics Server

## 📌 Install

```bash
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
```

---

# ⚡ Step 11 — Fix Metrics Server for KIND

## 📌 Patch Metrics Server

```bash
kubectl patch deployment metrics-server -n kube-system \
  --type='json' \
  -p='[{"op":"add","path":"/spec/template/spec/containers/0/args/-","value":"--kubelet-insecure-tls"}]'
```

---

# 🧠 Why This Is Needed

KIND uses self-signed certificates.

Metrics server fails TLS verification.

This command disables strict TLS verification.

---

# ⚡ Step 12 — Verify Metrics

## 📌 Command

```bash
kubectl top pods
```

---

# ⚡ Step 13 — Create HPA

## 📌 Command

```bash
kubectl autoscale deployment express-deployment-kubernetes \
  --min=1 \
  --max=5 \
  --cpu=50%
```

---

# 🧠 HPA Explanation

## 🔹 min

Minimum replicas.

---

## 🔹 max

Maximum replicas.

---

## 🔹 cpu=50%

If average CPU usage becomes greater than 50%, Kubernetes creates more pods.

---

# ⚡ Step 14 — Check HPA

## 📌 Command

```bash
kubectl get hpa
```

---

## 📌 Watch HPA Live

```bash
watch kubectl get hpa
```

---

# ⚡ Step 15 — Expose Application

## 📌 Port Forward

```bash
kubectl port-forward service/main-server-service 3000:80 --address 0.0.0.0
```

---

# 🧠 Why We Use Port Forward in Codespaces

GitHub Codespaces cannot directly expose KIND NodePort properly.

So:

```text
kubectl port-forward
```

creates tunnel between:

```text
Codespace → Kubernetes Service
```

---

# ⚡ Step 16 — Open Public URL

GitHub Codespaces automatically creates public URL.

Example:

```text
https://super-engine-x59jpjg9w4qqhvg64-3000.app.github.dev/
```

---

# ⚡ Step 17 — Generate Load

## 📌 Simple Curl Load

```bash
while true; do
  for i in {1..100}; do
    curl -s http://localhost:3000/ > /dev/null &
  done
  wait
done
```

---

# ⚡ Step 18 — Monitor CPU Usage

## 📌 Command

```bash
watch -n 1 kubectl top pods
```

---

# 🧠 CPU Units Explanation

```text
1000m = 1 CPU core
500m = 0.5 CPU
250m = 0.25 CPU
```

Example:

```text
500m
```

means pod uses half CPU core.

---

# ⚡ Step 19 — Watch Scaling

## 📌 Watch Pods

```bash
watch kubectl get pods
```

---

## 📌 Watch HPA

```bash
watch kubectl get hpa
```

---

# ⚡ Step 20 — View Logs

## 📌 Live Logs

```bash
kubectl logs -f deployment/express-deployment-kubernetes --prefix=true
```

---

## 📌 Last Logs

```bash
kubectl logs deployment/express-deployment-kubernetes --tail=20
```

---

# 🧠 Pod Lifecycle

During scaling you observed:

```text
Pending
→ ContainerCreating
→ Running
→ Terminating
→ Removed
```

This is normal Kubernetes orchestration behavior.

---

# ⚡ Common Errors & Fixes

# ❌ ErrImageNeverPull

## Reason

Kubernetes cannot find image.

## Fix

```bash
kind load docker-image kuber:latest
```

---

# ❌ Metrics API not available

## Fix

Patch metrics server:

```bash
kubectl patch deployment metrics-server -n kube-system \
  --type='json' \
  -p='[{"op":"add","path":"/spec/template/spec/containers/0/args/-","value":"--kubelet-insecure-tls"}]'
```

---

# ❌ curl Exit 35

## Reason

Used:

```text
https://localhost
```

instead of:

```text
http://localhost
```

---

# ❌ curl Exit 7

## Reason

Port forward not running.

## Fix

Restart:

```bash
kubectl port-forward service/main-server-service 3000:80 --address 0.0.0.0
```

---

# 🚀 Final Result

You successfully implemented:

* Docker
* KIND
* Kubernetes Deployment
* Service
* Metrics Server
* HPA
* CPU Monitoring
* Autoscaling
* Load Testing
* Public Hosting in GitHub Codespaces

---

# 🧠 Important Kubernetes Concepts Learned

| Concept        | Meaning                       |
| -------------- | ----------------------------- |
| Pod            | Running container             |
| Deployment     | Manages replicas              |
| Service        | Internal load balancing       |
| HPA            | Auto scaling based on metrics |
| Metrics Server | Provides CPU/memory metrics   |
| Port Forward   | Temporary tunnel              |
| KIND           | Kubernetes inside Docker      |
| Requests       | Guaranteed resources          |
| Limits         | Maximum allowed resources     |

---

# 📌 Useful Commands Cheat Sheet

## Pods

```bash
kubectl get pods
```

```bash
kubectl get pods -w
```

---

## Services

```bash
kubectl get svc
```

---

## HPA

```bash
kubectl get hpa
```

---

## CPU Usage

```bash
kubectl top pods
```

---

## Logs

```bash
kubectl logs -f deployment/express-deployment-kubernetes
```

---

## Restart Deployment

```bash
kubectl rollout restart deployment express-deployment-kubernetes
```

---

## Delete HPA

```bash
kubectl delete hpa express-deployment-kubernetes
```

---

## Scale Manually

```bash
kubectl scale deployment express-deployment-kubernetes --replicas=5
```

---

# 🎯 End
