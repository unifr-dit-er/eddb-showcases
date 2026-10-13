# Mise à jour de l'application

En tant que `podman` sur svx-web-eddb (`sudo machinectl shell --uid podman`).

## 1. Récupérer les dernières modifications

```bash
cd ~/repos/eddb-showcases
git pull
```

## 2. Reconstruire l'image

```bash
podman build --ulimit nofile=4096:4096 \
  -f apps/pressearchiv/Dockerfile \
  --build-arg NEXT_PUBLIC_BASE_PATH=/pressearchiv \
  -t eddb-pressearchiv:latest .
```

## 3. Redémarrer le service

```bash
systemctl --user restart eddb-pressearchiv
```

## Vérification

```bash
systemctl --user status eddb-pressearchiv
curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:8097/pressearchiv   # 200
podman logs -f eddb-pressearchiv
```

Chaque construction laisse l'image de l'étape de build, sans nom
(`<none>`, environ 1 Go) : `podman image prune` les retire.
