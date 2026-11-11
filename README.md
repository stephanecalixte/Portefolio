# Portfolio Calixte

Portfolio React/Vite avec une API Express, un serveur local dédié aux médias et une base MariaDB.

## Configuration MariaDB

1. Créez une base de données MariaDB vide en `utf8mb4`.
2. Copiez `.env.example` vers `.env`, puis renseignez les paramètres de connexion MariaDB. Utilisez le port réellement configuré sur votre serveur (par exemple `3306` ou `3309`).
3. Créez les tables et chargez les données initiales avec le client MariaDB :

   ```powershell
   Get-Content .\sql\schema.sql | mariadb -h localhost -P 3306 -u your_mariadb_user -p your_database_name
   ```

   Vous pouvez aussi exécuter [schema.sql](./sql/schema.sql) dans un client SQL après avoir sélectionné la base.
4. Utilisez pour l’API un compte dédié avec authentification par mot de passe et droits limités à la base du portfolio. Le connecteur Node ne prend pas en charge les comptes `auth_gssapi_client`. Exemple à exécuter comme administrateur MariaDB, après remplacement des valeurs :

   ```sql
   CREATE USER 'portfolio_app'@'localhost' IDENTIFIED BY 'replace_with_a_long_random_password';
   GRANT SELECT, INSERT, UPDATE, DELETE ON `your_database_name`.* TO 'portfolio_app'@'localhost';
   ```

   Indiquez ensuite ce compte et son mot de passe dans `DB_USER` et `DB_PASSWORD` de `.env`.

   Indiquez ensuite ce compte et son mot de passe dans `DB_USER` et `DB_PASSWORD` de `.env`.

Le script crée les tables `projects`, `skill_categories`, `skills` et `contact_messages`. Les projets et compétences initiaux sont inclus; les insertions peuvent être relancées sans dupliquer les entrées.

Les messages de contact sont soumis à une durée de conservation de 12 mois. L’API supprime les messages expirés à son démarrage puis toutes les 24 heures. La notice de confidentialité est disponible à `/privacy`; avant toute mise en production, actualisez-la si l’identité, l’adresse de contact, l’hébergeur, la localisation de la base ou les traitements changent. La base locale de développement ne constitue pas un hébergement de production sécurisé : configurez notamment un hébergement approprié et HTTPS avant de collecter de vrais messages.

## Démarrage local

Dans un premier terminal, démarrez le serveur d’images et de vidéos :

```sh
npm run dev:media
```

Il parcourt le dossier `media/` à chaque requête du catalogue. Déposez les images dans `media/images/` et les vidéos dans `media/videos/` ; les sous-dossiers sont également parcourus. Les formats pris en charge sont PNG, JPEG, WebP, GIF et AVIF pour les images, ainsi que MP4, WebM, MOV, M4V et OGV pour les vidéos. Un rechargement de la page met à jour les galeries après l’ajout de fichiers. Les vidéos `Start.mp4` et `intro.mp4` sont utilisées respectivement dans l’introduction et la scène animée.

Dans un deuxième terminal, démarrez l’API :

```sh
npm run dev:api
```

Dans un troisième terminal, démarrez Vite :

```sh
npm run dev
```

Vite transmet les requêtes `/api` à Express sur le port `3000` et les requêtes `/media` au serveur média sur le port `3001`. Le serveur média, en lecture seule et lié à l’interface locale, parcourt le catalogue à chaque requête. Le catalogue est disponible sur `GET /media/catalog`; les fichiers autorisés sont servis sous `/media/files/`. Le port peut être configuré avec `MEDIA_PORT`, le dossier avec `MEDIA_DIR`. L’interface peut utiliser une URL média explicite via `VITE_MEDIA_SERVER_URL` (par exemple `http://127.0.0.1:3001`) quand elle n’est pas servie derrière le proxy Vite.

L’API propose `GET /api/health`, `GET /api/projects`, `GET /api/skills` et `POST /api/contact`. Les messages du formulaire sont enregistrés en base; la limitation de fréquence est appliquée par adresse IP.

## Administration

L’espace d’administration est disponible sur `/admin`. Configurez dans `.env` un `ADMIN_USERNAME`, un `ADMIN_PASSWORD` unique et un `ADMIN_SESSION_SECRET` aléatoire d’au moins 32 caractères avant de démarrer l’API. Pour générer le secret localement :

```sh
node -e "console.log(require('node:crypto').randomBytes(48).toString('base64url'))"
```

Les paramètres d’administration ne doivent jamais être publiés ni ajoutés au dépôt. L’accès admin est désactivé tant que ces trois valeurs ne sont pas configurées. La session utilise un cookie signé `HttpOnly`, `SameSite=Strict`, valable huit heures ; en production, le cookie `Secure` exige HTTPS. Les tentatives de connexion sont limitées par adresse IP.

Depuis le tableau de bord, les projets peuvent être créés, modifiés, publiés/dépubliés et supprimés ; les compétences sont modifiables par catégorie ; les messages peuvent être consultés, supprimés ou ouverts dans le logiciel de messagerie. Les routes de gestion sous `/api/admin` sont protégées côté serveur. Les migrations SQL ne sont pas nécessaires : l’interface utilise les tables déjà créées par `sql/schema.sql`.

Pour vérifier la version de production : `npm run build`.
