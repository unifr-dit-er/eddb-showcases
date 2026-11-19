# Déploiement avec Podman + Quadlet

Sur **svx-web-eddb**, sous **https://eddb.unifr.ch/callisto**, port local
**8098**, à la place de la vitrine construite sur `eddb-vue` (même nom de
service, même port). Le bloc nginx (`location /callisto`) et la table des
ports vivent dans le dépôt `svx-web-configs`.

Toutes les commandes se lancent **en tant que `podman`**, le compte qui fait
tourner les conteneurs :

```bash
sudo machinectl shell --uid podman
```

## 1. Mettre à jour le monorepo

```bash
cd ~/repos/eddb-showcases
git pull
```

## 2. Construire l'image

Le sous-chemin est fixé à la construction : `/callisto` sous eddb.unifr.ch.
L'image actuelle (construite depuis `eddb-vue`) est gardée pour revenir en
arrière :

```bash
podman tag eddb-callisto:latest eddb-callisto:previous
podman build --ulimit nofile=4096:4096 \
  -f apps/callisto/Dockerfile \
  --build-arg NEXT_PUBLIC_BASE_PATH=/callisto \
  -t eddb-callisto:latest .
```

`--ulimit` évite l'erreur `EMFILE` de npm au build tant que le compte
`podman` de svx-web-eddb n'a pas de `containers.conf` (voir `docs/podman.md`
de `svx-web-configs`).

## 3. Remplacer le fichier Quadlet

Partir du gabarit, après avoir sauvegardé celui de la vitrine d'`eddb-vue` :

```bash
cp ~/.config/containers/systemd/eddb-callisto.container ~/eddb-callisto.container.eddb-vue
cp apps/callisto/eddb-callisto.container.example \
  ~/.config/containers/systemd/eddb-callisto.container
chmod 600 ~/.config/containers/systemd/eddb-callisto.container
```

Puis y mettre le jeton NocoDB **propre à cette vitrine** (`NOCODB_API_TOKEN`),
jamais celui de nafo.

> Ce fichier contient un secret : il reste sur la VM, jamais dans git.

## 4. Redémarrer le service

```bash
systemctl --user daemon-reload
systemctl --user restart eddb-callisto
```

## 5. Vérifier

```bash
curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:8098/callisto   # 200
curl -s http://127.0.0.1:8098/callisto/api/facets | head -c 80          # {"total":1170…
```

Puis, depuis l'extérieur, https://eddb.unifr.ch/callisto.

## Revenir en arrière

```bash
podman tag eddb-callisto:previous eddb-callisto:latest
cp ~/eddb-callisto.container.eddb-vue ~/.config/containers/systemd/eddb-callisto.container
systemctl --user daemon-reload && systemctl --user restart eddb-callisto
```

## Commandes utiles

```bash
podman logs -f eddb-callisto
systemctl --user status eddb-callisto
```

Mise à jour : [podman-update.md](podman-update.md).
