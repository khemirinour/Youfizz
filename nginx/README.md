# Configuration Nginx pour OVH

## Structure des fichiers SSL

Placez vos certificats SSL dans le répertoire `nginx/ssl/` :

```
nginx/
├── nginx.conf
├── ssl/
│   ├── fullchain.pem  # Certificat SSL complet (certificat + chaîne)
│   └── privkey.pem     # Clé privée du certificat
└── README.md
```

## Obtenir un certificat SSL OVH

### Méthode 1 : Certificat SSL OVH (recommandé)

1. **Acheter un certificat SSL** dans le panel OVH :
   - Allez dans votre domaine > "SSL" > "Certificats"
   - Choisissez le type de certificat (Standard, Wildcard, etc.)
   - Suivez le processus d'achat et de validation

2. **Télécharger le certificat** :
   - Une fois validé, téléchargez le certificat et la clé privée
   - Le certificat est généralement au format `.crt` ou `.pem`
   - La clé privée est au format `.key` ou `.pem`

3. **Placer les fichiers sur le VPS** :
   ```bash
   # Depuis votre machine locale
   scp certificat.crt user@votre-vps:/opt/you_fizz/nginx/ssl/fullchain.pem
   scp private.key user@votre-vps:/opt/you_fizz/nginx/ssl/privkey.pem
   
   # Définir les permissions
   chmod 600 nginx/ssl/privkey.pem
   chmod 644 nginx/ssl/fullchain.pem
   ```

### Méthode 2 : Certificat auto-signé (développement uniquement)

⚠️ **ATTENTION** : Ne pas utiliser en production ! Les navigateurs afficheront un avertissement.

```bash
# Générer un certificat auto-signé
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/privkey.pem \
  -out nginx/ssl/fullchain.pem \
  -subj "/CN=votre-domaine.com/O=YouFizz/C=FR"
```

## Configuration du domaine

Éditez `nginx.conf` et remplacez `server_name _;` par votre domaine :

```nginx
server {
    listen 443 ssl http2;
    server_name votre-domaine.com www.votre-domaine.com;
    # ... reste de la configuration
}
```

## Vérification

Après avoir configuré SSL, testez la configuration :

```bash
# Vérifier la syntaxe Nginx
docker exec you_fizz_nginx nginx -t

# Vérifier le certificat SSL
openssl s_client -connect votre-domaine.com:443 -servername votre-domaine.com
```

## Renouvellement du certificat

Si vous utilisez un certificat OVH avec expiration :

1. **Vérifier la date d'expiration** :
   ```bash
   openssl x509 -in nginx/ssl/fullchain.pem -noout -dates
   ```

2. **Renouveler dans le panel OVH** avant expiration

3. **Remplacer les fichiers** sur le VPS

4. **Redémarrer Nginx** :
   ```bash
   docker-compose -f docker-compose.prod.yml restart nginx
   ```

