# Bastion Arena Survival — installation XAMPP

## 1. Copier le jeu

1. Décompresse le dossier `Bastion` dans `C:\xampp\htdocs\bastion\`.
2. Dans le panneau XAMPP, démarre **Apache** et **MySQL**.
3. Ouvre `http://localhost/bastion/` dans Chrome/Edge. N'ouvre pas `index.html` directement depuis l'explorateur : PHP ne fonctionnerait pas.

## 2. Créer la base de données

1. Ouvre `http://localhost/phpmyadmin/`.
2. Clique sur **Importer**.
3. Choisis `C:\xampp\htdocs\bastion\database\bastion.sql` et lance l'import.
4. La base `bastion_arena` et les tables `users` et `player_saves` seront créées.

La configuration par défaut dans `config/database.php` correspond à une installation XAMPP locale classique : utilisateur `root`, mot de passe vide. Si tu as défini un mot de passe MySQL, modifie `BASTION_DB_PASS`.

## 3. Tester

1. Recharge `http://localhost/bastion/`.
2. Clique sur **Connexion**, puis **Créer un compte**.
3. Le nom d'utilisateur doit faire 3 à 24 caractères et utiliser des lettres, chiffres ou `_`. Le mot de passe doit contenir au moins 8 caractères.
4. Lance une partie, termine-la et vérifie que les statistiques sont conservées en local. Si tu es connecté, elles sont aussi envoyées au serveur.
5. Déconnecte-toi/reconnecte-toi pour tester le chargement et la fusion des records.

## Sauvegarde hybride

- `localStorage` conserve le record (`bastion-best`) et les statistiques (`bastion-profile`) dans le navigateur.
- Quand le compte est connecté, `api/save.php` synchronise ces données avec MySQL/MariaDB.
- À la connexion, les statistiques et records locaux et en ligne sont fusionnés sans réduire les valeurs déjà enregistrées.
- La sauvegarde en ligne actuelle porte sur les **statistiques et le record**. Elle ne sauvegarde pas encore une partie en cours, les héros débloqués ou l'inventaire, car ces systèmes doivent être ajoutés au jeu séparément.

## Dépannage

- **Erreur base de données** : vérifie que MySQL est démarré, que la base `bastion_arena` existe et que `config/database.php` contient les bons identifiants.
- **Les boutons PHP ne répondent pas** : utilise `http://localhost/bastion/`, pas `file:///.../index.html`.
- **Erreur 404 sur `api/auth.php`** : vérifie que le dossier `api` se trouve à `C:\xampp\htdocs\bastion\api\`.
- **Module PDO MySQL** : dans `php.ini`, vérifie que `extension=pdo_mysql` est activé, puis redémarre Apache.
- **Utilisation publique** : cette configuration est prévue pour le développement local. Avant de publier le jeu, configure un mot de passe MySQL, HTTPS, les paramètres de cookies et les protections serveur adaptées.
