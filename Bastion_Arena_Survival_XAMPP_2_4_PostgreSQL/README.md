# Bastion Arena Survival 2.2 — Dual Arenas & Boss Progression

## Launch
Keep `index.html`, `styles.css`, `game.js`, `colosseum.glb`, and `boss_fortress.glb` in the same folder. Open `index.html` in a modern browser with an internet connection. Three.js, GLTFLoader, and the font are loaded from CDNs.

## Arena routing
- Normal waves use the Meshy Ancient Roman Colosseum (`colosseum.glb`).
- The mega-boss encounter at every 5th wave switches to the Dark Fortress arena (`boss_fortress.glb`).
- After the mega-boss is defeated, the game returns to the Colosseum and continues at the next wave.
- If a GLB fails to load, the built-in procedural arena remains as a fallback.

## Progression fixes
- Mini-bosses remain part of their normal wave; defeating them does not restart the run.
- Campaign mega-boss encounters no longer refill all squad health or revive fallen squadmates on entry/exit. Existing HP, alive state, score, XP, level, upgrades, and wave progression are retained.
- The next wave starts after the campaign mega-boss is defeated.
- Standalone mega-boss mode from the menu remains available.

## Controls
- `ZQSD` or arrows: move.
- Hold mouse click / `Space`: attack.
- `Shift`: dodge.
- `E` / right-click: special ability.
- `1`–`6` / `Tab`: switch hero.
- `V`: squad order.
- `F`: focus target.
- `P` / `Escape`: pause.

## Model scale/orientation fix (2.2.1)
- GLB models are now normalized from their actual bounding boxes, scaled to a gameplay-sized footprint, centered on the arena origin, and placed with their lowest point at ground level.
- The boss fortress is rotated from Z-up to Three.js Y-up before fitting, fixing the upside-down/vertical orientation.
- The Colosseum is fitted to a 52-unit footprint; the boss fortress to 58 units.

## Validation
- `node --check game.js` passed.
- Both GLB bounding boxes were inspected; the Colosseum source was about 1.9 units wide while the boss model was 58.4 units wide and Z-up, explaining the scale/orientation mismatch.
- Full interactive gameplay still needs a manual browser test in the target browser.


## Organisation des fichiers (2.2.3)
Le JavaScript a été séparé en scripts classiques chargés dans cet ordre depuis `index.html` :
- `game-core.js` : scène Three.js, arènes, personnages, état principal et progression de base.
- `game-combat.js` : attaques, animations de combat et actions des héros.
- `game-boss.js` : capacités partagées, interface d’équipe et combats de méga-boss.
- `game-systems.js` : effets, dégâts, réactions élémentaires, commandes et boucle principale.

Les scripts utilisent volontairement le même contexte global pour préserver les références croisées du jeu. Ne change pas leur ordre dans `index.html`. Le HTML et le CSS restent dans `index.html` et `styles.css`.


## Version 2.2.4 — Boss Arena Low
- Réduction de la hauteur de la forteresse du méga-boss à environ 42 % de sa hauteur précédente, sans réduire son empreinte au sol.
- Surface de combat du boss abaissée de y=0.075 à y=0.015 pour mieux aligner le plancher visuel avec les pieds des personnages (modèles humanoïdes dont les bottes descendent légèrement sous y=0.05).
- Les autres dimensions, l'arène normale et les mécaniques de jeu sont conservées.
- Vérification effectuée : syntaxe JavaScript et intégrité de l'archive. Le rendu en navigateur doit encore être testé.


### Correctif 2.2.5 — sol de l'arène du méga-boss
La surface circulaire de combat a été abaissée légèrement sous le plan d'origine des personnages afin d'éviter que le rendu du sol masque leurs pieds. La géométrie et la largeur de l'arène restent inchangées. À valider en jeu dans le navigateur.


## Version 2.3 — Hero Combat & Squad Setup
- Le menu affiche maintenant une étiquette de rôle pour mieux distinguer les héros (distance, soutien, tank, magie, contrôle, etc.).
- Présentation du menu, états de sélection et navigation clavier améliorés.
- Le système de combat existant conserve les combos à trois coups, le finisher et l'esquive avec courte invulnérabilité.
- Le premier héros sélectionné reste le héros contrôlé ; les autres restent autonomes.

Note : les changements visuels du menu et les scripts ont été vérifiés statiquement ; effectuer un test dans le navigateur avant de considérer la version entièrement validée.


## Version XAMPP — comptes et sauvegarde hybride

Cette édition ajoute une couche PHP/PostgreSQL sans déplacer le moteur 3D hors du navigateur. La progression de statistiques et le record restent stockés en local dans `localStorage`. Si le joueur se connecte sur le serveur XAMPP, les statistiques et records sont aussi synchronisés vers PostgreSQL.

Installation complète : voir `INSTALLATION_XAMPP.md`. Exécuter `database/bastion.sql` dans PostgreSQL (ou dans le SQL Editor de Supabase), puis configurer `config/database.php`. XAMPP fournit Apache/PHP ; son service MySQL est MariaDB, pas PostgreSQL. Accès via `http://localhost/bastion/` (pas en ouvrant le fichier HTML directement).


## Version 2.4 — Movesets chargés
- Neuf héros ont une attaque chargée dédiée : Guerrier, Gardien, Samouraï, Tireur, Archer, Mage, Météor, Pyro et Dragon.
- En combat, maintenir **R** pour charger puis relâcher pour lancer l'attaque. La puissance augmente avec la durée de charge, jusqu'à un maximum.
- Les autres héros conservent leurs attaques et capacités habituelles. Les mouvements sont déclenchés localement côté JavaScript et ne nécessitent pas de requête PHP.
- Le menu affiche les héros compatibles et le HUD montre la jauge de charge.
