# Mise à jour de l'application

En tant que `podman` sur svx-web-eddb (`sudo machinectl shell --uid podman`),
une fois la production basculée sur le monorepo
([podman-deploy.md](podman-deploy.md)).

```bash
cd ~/repos/eddb-showcases
git pull
podman build --ulimit nofile=4096:4096 -f apps/datacant/Dockerfile -t eddb-datacant:latest .
systemctl --user restart eddb-datacant
systemctl --user status eddb-datacant
curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:8085/   # 200
```

Une fois la nouvelle version vérifiée, nettoyer : chaque construction laisse
l'image de l'étape de build et l'ancienne image, sans nom (`<none>`,
environ 1 Go).

```bash
podman image prune -f
```

Jamais `-a`, qui supprimerait aussi les images nommées gardées pour revenir
en arrière (`eddb-datacant:previous`) ; voir `docs/podman.md` de
`svx-web-configs`.
