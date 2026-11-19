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
  -f apps/callisto/Dockerfile \
  --build-arg NEXT_PUBLIC_BASE_PATH=/callisto \
  -t eddb-callisto:latest .
```

## 3. Redémarrer le service

```bash
systemctl --user restart eddb-callisto
```

## Vérification

```bash
systemctl --user status eddb-callisto
curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:8098/callisto   # 200
podman logs -f eddb-callisto
```

## 4. Nettoyer

Une fois la nouvelle version vérifiée : chaque construction laisse l'image
de l'étape de build et l'ancienne image, sans nom (`<none>`, environ 1 Go).

```bash
podman image prune -f
```

Jamais `-a`, qui supprimerait aussi les images nommées gardées pour revenir
en arrière ; voir `docs/podman.md` de `svx-web-configs`.
