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

## Migration Pages → Workers (static assets)

Le message **« Variables cannot be added to a Worker that only has static assets »** apparaît quand Cloudflare ne déploie que les fichiers statiques : aucun script Worker n’est détecté, donc il n’existe aucun runtime auquel attacher des variables. Un projet Pages avec `functions/` ne doit pas être déployé comme un simple « Worker with static assets ».

Le projet utilise maintenant un point d’entrée Worker :

- [`worker/index.js`](./worker/index.js) importe les handlers existants de `functions/` (`/api/contact`, `/api/projects`, `/api/skills`) et le middleware Basic Auth `functions/_middleware.js` pour `/admin`.
- [`wrangler.toml`](./wrangler.toml) déclare `main = "worker/index.js"`, `[assets]` avec `directory = "./dist"`, `binding = "ASSETS"`, `not_found_handling = "single-page-application"` (routes React) et `run_worker_first = ["/api/*", "/admin", "/admin/*"]`.
- Les autres chemins sont servis directement par les assets, sans exécuter le Worker.

### Variables (Settings → Variables and Secrets)

Dans le Worker : **Settings → Variables and Secrets**, renseignez :

| Variable | Rôle |
| --- | --- |
| `RESEND_API_KEY` | Clé Resend (secret) |
| `CONTACT_TO_EMAIL` | Adresse qui reçoit les messages |
| `RESEND_FROM_EMAIL` | Adresse d’envoi d’un domaine vérifié |
| `ADMIN_USER` | Identifiant du Basic Auth `/admin` |
| `ADMIN_PASSWORD` | Mot de passe du Basic Auth `/admin` (secret) |
| `ALLOWED_ORIGIN` | Optionnel : origine CORS supplémentaire |

Marquez `RESEND_API_KEY` et `ADMIN_PASSWORD` comme secrets. Configurez **Production et Preview** si l’interface propose les deux environnements ; sinon, le jeu de variables du Worker s’applique aussi aux URLs de preview.

### Local et déploiement

```sh
npm run build
npm run dev:worker      # http://localhost:8788
```

Déploiement par Git : `git push` sur `master` si le Worker est connecté à Workers Builds (build `npm run build`, deploy `npx wrangler deploy`). Manuellement : `npm run deploy:worker`.

Si le message persiste après déploiement, vérifiez dans cet ordre : `main` pointe vers `worker/index.js`, `run_worker_first` contient `/api/*`, `/admin` et `/admin/*`, le build produit bien `dist/`, et le projet Cloudflare est un **Worker** (pas un projet Pages).

## Formulaire de contact sur Cloudflare Pages

Le front est un site statique React/Vite : il peut être hébergé sur Cloudflare Pages. Le formulaire de contact n’a pas besoin de serveur physique : il appelle une Cloudflare Pages Function située dans [`functions/api/contact.js`](./functions/api/contact.js), qui envoie l’e-mail avec l’API Resend. Aucun secret n’est présent dans le code : la fonction lit uniquement des variables d’environnement.

### 1. Créer le compte Resend et vérifier le domaine

1. Créez un compte sur [resend.com](https://resend.com).
2. Ajoutez votre domaine dans **Domains** et créez les enregistrements DNS demandés (SPF et DKIM). Attendez que le domaine soit marqué comme vérifié.
3. Créez une clé API dans **API Keys** avec la permission d’envoi.

`RESEND_FROM_EMAIL` doit obligatoirement utiliser une adresse d’un domaine vérifié dans Resend (par exemple `Portfolio <contact@votre-domaine.fr>`). Une adresse `@gmail.com` ou `@free.fr` sera refusée par Resend. Pour un premier test, l’adresse `onboarding@resend.dev` ne peut envoyer que vers l’adresse e-mail du compte Resend : `CONTACT_TO_EMAIL` doit alors être cette adresse. Pour recevoir les messages sur une autre adresse, vérifiez un domaine et utilisez une adresse d’envoi de ce domaine.

### 2. Variables d’environnement

| Variable | Rôle |
| --- | --- |
| `RESEND_API_KEY` | Clé API Resend, à garder secrète |
| `CONTACT_TO_EMAIL` | Adresse qui reçoit les messages (plusieurs adresses possibles, séparées par des virgules) |
| `RESEND_FROM_EMAIL` | Adresse d’envoi d’un domaine vérifié dans Resend |
| `ALLOWED_ORIGIN` | Optionnel : origine supplémentaire autorisée en CORS |

En local, copiez `.dev.vars.example` vers `.dev.vars` et renseignez les valeurs. Ce fichier est ignoré par Git.

Dans le Worker, ajoutez les mêmes variables dans **Settings → Variables and Secrets**, pour **Production** et **Preview** si l’interface le permet. Marquez `RESEND_API_KEY` et `ADMIN_PASSWORD` comme secrets.

### 3. Lancer en local

```sh
npm install
npm run build
npm run dev:pages
```

`npm run dev:worker` démarre le Worker (Functions + assets) sur `http://localhost:8788`. Dans un second terminal, démarrez l’interface Vite :

```sh
npm run dev
```

Vite redirige `/api/contact` vers `http://localhost:8788` et les autres routes `/api` vers l’API Express locale (`http://localhost:3000`). Si vous préférez appeler la Function directement, définissez `VITE_CONTACT_ENDPOINT` (par exemple `http://localhost:8788/api/contact`) dans un fichier `.env.local`, et ajoutez cette origine à `ALLOWED_ORIGIN` si nécessaire. En production, l’appel est same-origin sur `/api/contact`, donc le CORS n’est pas utilisé.

### 4. Déployer le Worker

**Via Git (recommandé)** : le Worker doit être connecté à **Workers Builds** avec :

- Commande de build : `npm run build`
- Commande de déploiement : `npx wrangler deploy`

**Via Wrangler** :

```sh
npm run deploy:worker
```

Le fichier `wrangler.toml` déclare `main = "worker/index.js"` et `[assets]` avec `directory = "./dist"`. Le repli SPA est assuré par `not_found_handling = "single-page-application"` : toutes les routes React (`/contact`, `/projects`, etc.) servent `index.html`. N’ajoutez pas de fichier `_redirects` avec `/* /index.html 200`, il est rejeté comme boucle infinie.

### 5. Tester le formulaire

Avec `npm run dev:worker` démarré :

```sh
curl.exe -i -X POST http://localhost:8788/api/contact ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Test\",\"email\":\"test@example.com\",\"subject\":\"Bonjour\",\"message\":\"Message de test\"}"
```

- champ manquant → `400` avec un message JSON ;
- honeypot `_honey` rempli → `200` sans envoi d’e-mail ;
- clé Resend absente → `500` avec un message générique ;
- erreur Resend → `502` avec un message générique (le détail reste dans les logs).

En local, la Function lit `.dev.vars`. Sans clé Resend valide, un envoi réel renvoie donc une erreur propre : c’est le comportement attendu.

### 6. Données D1 (projets et compétences)

Les routes `/api/projects` et `/api/skills` sont servies par Cloudflare D1 via [`functions/api/projects.js`](./functions/api/projects.js) et [`functions/api/skills.js`](./functions/api/skills.js). Le formulaire de contact n’écrit pas dans D1 : il envoie uniquement un e-mail via Resend.

1. Créez la base D1 :

   ```sh
   npx wrangler d1 create calixteportfolio
   ```

2. Copiez la valeur `database_id` retournée dans [`wrangler.toml`](./wrangler.toml), à la place du placeholder `00000000-0000-0000-0000-000000000000`. Vous pouvez aussi lier la base dans le tableau de bord du Worker (**Settings → Bindings → D1 database**), avec le binding `DB`.
3. Initialisez et remplissez la base **locale** :

   ```sh
   npm run db:init:local
   npm run db:seed:local
   npm run build
   npm run dev:worker
   ```

4. Initialisez et remplissez la base **de production** avant de déployer :

   ```sh
   npm run db:init
   npm run db:seed
   npm run deploy:worker
   ```

Les scripts utilisent le binding `DB` déclaré dans `wrangler.toml`. Les fichiers [`sql/d1-schema.sql`](./sql/d1-schema.sql) et [`sql/d1-seed.sql`](./sql/d1-seed.sql) sont idempotents et peuvent être relancés. D1 stocke les tableaux `tech` et `features` en JSON texte ; les Functions les reconvertissent en tableaux pour le front.

`npm run dev` proxifie `/api/contact`, `/api/projects` et `/api/skills` vers `wrangler dev` (port 8788), et `/api/admin` vers l’API Express (port 3000). Le front local lit donc les mêmes données D1 que la production. En revanche, une modification faite via l’admin Express reste dans MariaDB et n’est pas répliquée automatiquement dans D1.

### Limite restante : administration

L’espace `/admin` et les routes `/api/admin` dépendent toujours d’Express et de MariaDB : ils ne fonctionnent pas sur le Worker déployé. La page `/admin` est protégée par Basic Auth via `functions/_middleware.js`, mais les routes `/api/admin/*` devront être protégées séparément si elles sont un jour déployées. Pour administrer les projets en production, il faudra soit migrer l’admin vers D1 avec une authentification, soit modifier les données avec `npx wrangler d1 execute DB --remote --command "…"`.
