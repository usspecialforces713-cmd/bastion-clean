# Bastion Arena 2.5 — Polish update (work in progress)

## Fixes
- Render deploy: root `Dockerfile` now copies the game folder (before, it served the repo root, not the game). Apache `.htaccess` is now allowed (AllowOverride All) and listens on Render's `$PORT`.
- `.htaccess` moved to the game root with a correct rule, so `/api/auth`, `/api/me`, `/api/save` and `/api/load` work. `account.js` also falls back to `/api/*.php` and shows the real server error message.
- SECURITY: `.env.example` held a real Supabase password and JWT secret. They are now placeholders. **Change the Supabase DB password and JWT secret.**
- You could not type spaces or use Tab in the login form or the hero search. Fixed.
- Clicking menu buttons no longer fires a shot when the game starts.
- The game pauses on its own when you switch tabs or leave the window.
- Fixed the account bar and combo box covering the pause and order buttons.
- Fixed the dodge flash on the aura never showing.
- The pause screen listed heroes "1 to 4"; it now says 1–6.

## Interface
- New active-hero panel: HP, special-ability cooldown and dodge cooldown.
- HUD panel shows wave, score, remaining enemies and an XP bar.
- Health bars float above heroes and tough enemies.
- Team cards are coloured per hero and show "Spécial prêt".
- New pause menu: stats, Resume / Sound / Restart / Main menu, full controls list.
- Upgrades can be picked with keys 1, 2, 3. New game-over screen with stats.
- Mute button and M key (setting is remembered). Red pulsing edges when HP is low.
- Visual touch joystick on mobile and bigger round action buttons.
- The HUD is hidden in menus.

## Gameplay & performance
- Arena model went from 41 MB / 1M triangles to 8.4 MB / 300k triangles. It loads much faster and runs better on weak PCs and phones.
- GPU memory is freed when effects or enemies disappear, so long runs no longer slow down.
- Enemies push apart instead of merging into one blob.
- Camera is closer and smoother (frame-rate independent), with a slight look-ahead toward the aim. Screen shake is gentler (the earthquake used to shake for 6 s).
- 1.4 s grace period at the start of each wave. Enemies "materialise" in (they deal no contact damage while spawning).
- Less banner spam: crits are big red damage numbers instead of a "COUP CRITIQUE" banner. The IMPACT, FINISHER and ATTAQUE FINALE banners were removed (the combo box already shows them).
- The HUD updates 10 times per second instead of rewriting the page every frame.

## Characters
- Each role has its own silhouette: swords and katanas, daggers, shields, guns, bows, halos, wizard hats with a spell orb, hoods and capes, and dragon horns. Heroes are brighter and tinted with their colour.
- Heroes have ground shadows, an idle halo, orb and cape animation, and blink when hit.
- Enemies have a glowing core, an energy shell and faceted shading.
