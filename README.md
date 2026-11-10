# Portfolio Calixte

Portfolio React/Vite avec une API Express et une base MySQL.

## Configuration MySQL

1. Créez une base de données MySQL vide en `utf8mb4`.
2. Copiez `.env.example` vers `.env`, puis renseignez les paramètres MySQL.
3. Créez les tables et chargez les données initiales avec le client MySQL :

   ```powershell
   Get-Content .\sql\schema.sql | mysql -h localhost -u your_mysql_user -p your_database_name
   ```

   Vous pouvez aussi exécuter [schema.sql](./sql/schema.sql) dans MySQL Workbench après avoir sélectionné la base.

Le script crée les tables `projects`, `skill_categories`, `skills` et `contact_messages`. Les projets et compétences initiaux sont inclus; les insertions peuvent être relancées sans dupliquer les entrées.

Les messages de contact sont soumis à une durée de conservation de 12 mois. L’API supprime les messages expirés à son démarrage puis toutes les 24 heures. La notice de confidentialité est disponible à `/privacy`; avant toute mise en production, actualisez-la si l’identité, l’adresse de contact, l’hébergeur, la localisation de la base ou les traitements changent. La base locale de développement ne constitue pas un hébergement de production sécurisé : configurez notamment un hébergement approprié et HTTPS avant de collecter de vrais messages.

## Démarrage local

Dans un premier terminal, démarrez l’API :

```sh
npm run dev:api
```

Dans un second terminal, démarrez Vite :

```sh
npm run dev
```

Vite transmet les requêtes `/api` à Express sur le port `3000`. L’API propose `GET /api/health`, `GET /api/projects`, `GET /api/skills` et `POST /api/contact`. Les messages du formulaire sont enregistrés en base; la limitation de fréquence est appliquée par adresse IP.

Pour vérifier la version de production : `npm run build`.
