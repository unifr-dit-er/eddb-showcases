# Déploiement avec Podman + Quadlet

datacant est en service sur **svx-web-eddb**, sous **https://datacant.unifr.ch**
(domaine propre, `server_name` dédié dans le nginx de `svx-web-configs`),
port local **8085**.

Image construite depuis le monorepo `eddb-showcases` depuis le 19.10.2026
(l'ancien dépôt `eddb-datacant` est figé). La procédure ci-dessous garde
l'image en place sous un autre nom pour pouvoir revenir en arrière.

Toutes les commandes se lancent **en tant que `podman`** :

```bash
sudo machinectl shell --uid podman
```

## 1. Cloner le monorepo (s'il n'est pas déjà là)

```bash
git clone https://github.com/unifr-dit-er/eddb-showcases.git ~/repos/eddb-showcases
cd ~/repos/eddb-showcases
```

## 2. Construire l'image

Domaine propre : pas de sous-chemin.

```bash
podman tag eddb-datacant:latest eddb-datacant:previous   # retour arrière possible
podman build --ulimit nofile=4096:4096 \
  -f apps/datacant/Dockerfile \
  -t eddb-datacant:latest .
```

## 3. Fichier Quadlet

Le fichier `~/.config/containers/systemd/eddb-datacant.container` existe
déjà (gabarit : `apps/datacant/eddb-datacant.container.example`) : port
8085, jeton du compte de service des vitrines. Droits 600, jamais dans git.

## 4. Redémarrer et vérifier

```bash
systemctl --user restart eddb-datacant
systemctl --user status eddb-datacant
curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:8085/   # 200
```

Puis https://datacant.unifr.ch. En cas de problème :
`podman tag eddb-datacant:previous eddb-datacant:latest` et redémarrer.

Mise à jour : [podman-update.md](podman-update.md).
