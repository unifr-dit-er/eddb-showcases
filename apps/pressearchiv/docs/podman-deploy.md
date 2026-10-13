# Déploiement avec Podman + Quadlet

En service depuis le 13.10.2026 sur **svx-web-eddb**, sous
**https://eddb.unifr.ch/pressearchiv** (prototype), port local **8097**.
Le bloc nginx (`location /pressearchiv`) et la table des ports vivent dans
le dépôt `svx-web-configs`.

Toutes les commandes se lancent **en tant que `podman`**, le compte qui fait
tourner les conteneurs :

```bash
sudo machinectl shell --uid podman
```

## 1. Cloner le monorepo

```bash
git clone https://github.com/unifr-dit-er/eddb-showcases.git ~/repos/eddb-showcases
cd ~/repos/eddb-showcases
```

L'application vit dans `apps/pressearchiv/` ; les commandes ci-dessous se
lancent depuis la racine du dépôt.

## 2. Construire l'image

Le sous-chemin est fixé à la construction : `/pressearchiv` sous
eddb.unifr.ch, rien pour un domaine propre.

```bash
podman build --ulimit nofile=4096:4096 \
  -f apps/pressearchiv/Dockerfile \
  --build-arg NEXT_PUBLIC_BASE_PATH=/pressearchiv \
  -t eddb-pressearchiv:latest .
```

`--ulimit` évite l'erreur `EMFILE` de npm au build tant que le compte
`podman` de svx-web-eddb n'a pas de `containers.conf` (voir `docs/podman.md`
de `svx-web-configs`).

## 3. Créer le fichier Quadlet

Partir du gabarit et y mettre le port et le jeton :

```bash
cp apps/pressearchiv/eddb-pressearchiv.container.example \
  ~/.config/containers/systemd/eddb-pressearchiv.container
chmod 600 ~/.config/containers/systemd/eddb-pressearchiv.container
```

Puis éditer le fichier :

- `PublishPort=127.0.0.1:8097:3000`
- `NOCODB_API_TOKEN` : jeton du compte de service des vitrines, qui ne lit
  que la base *Pressearchiv Public* (jamais la base complète).

> Ce fichier contient un secret : il reste sur la VM, jamais dans git.

## 4. Démarrer le service

```bash
systemctl --user daemon-reload
systemctl --user start eddb-pressearchiv
```

`monitor.sh` surveille automatiquement tout `.container` présent dans le
dossier de Quadlet.

## 5. Vérifier

```bash
curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:8097/pressearchiv   # 200
curl -s http://127.0.0.1:8097/pressearchiv/api/facets | head -c 80            # "total":3952…
```

Puis, depuis l'extérieur, https://eddb.unifr.ch/pressearchiv.

## Commandes utiles

```bash
podman logs -f eddb-pressearchiv
systemctl --user status eddb-pressearchiv
```

Mise à jour : [podman-update.md](podman-update.md).
