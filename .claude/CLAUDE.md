# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Rôle

Frontend Angular 21 de l'application de calcul d'empreinte carbone (Hackathon Capgemini / Sup De Vinci 2026). Consomme l'API Spring Boot sur `http://localhost:8080/api`.

## Commandes

```bash
npm start       # Dev server → http://localhost:4200
npm run build   # Build production
npm run watch   # Build en mode watch
npm test        # Tests Vitest
```

## Fonctionnalités à couvrir

### Palier 1 (obligatoire)
- Formulaire de saisie d'un site (superficie, parking, énergie, matériaux, employés)
- Affichage du résultat CO₂ calculé

### Palier 2
- Dashboard interactif :
  - KPIs : CO₂ total, CO₂/m², CO₂/employé
  - Graphiques dynamiques (répartition construction vs exploitation)
  - Historique des rapports

### Palier 3 (bonus)
- Comparaison de plusieurs sites
- Courbes d'évolution historique
- Export PDF

## Architecture Angular

- Routing dans `app.routes.ts` — lazy loading obligatoire pour chaque feature
- Services HTTP dans `services/` — injectés avec `inject()`, `providedIn: 'root'`
- Formulaires réactifs pour toutes les saisies de données
- Signaux pour l'état local, `computed()` pour l'état dérivé

## Conventions de code

### TypeScript
- Strict mode activé — pas de `any`, utiliser `unknown` si le type est incertain
- Préférer l'inférence de type quand elle est évidente

### Composants Angular
- Standalone uniquement — ne **pas** écrire `standalone: true` (défaut depuis Angular v20)
- `changeDetection: ChangeDetectionStrategy.OnPush` sur tous les composants
- `input()` et `output()` au lieu des décorateurs `@Input` / `@Output`
- `inject()` au lieu de l'injection par constructeur
- `@if`, `@for`, `@switch` (native control flow) — jamais `*ngIf`, `*ngFor`, `*ngSwitch`
- `class` bindings au lieu de `ngClass` ; `style` bindings au lieu de `ngStyle`
- Pas de `@HostBinding` / `@HostListener` — utiliser l'objet `host` dans `@Component` / `@Directive`
- `NgOptimizedImage` pour toutes les images statiques (pas les base64 inline)
- Templates inline pour les petits composants

### Accessibilité
- Conformité **WCAG AA** obligatoire (contraste, focus, ARIA)
- Tous les composants doivent passer les vérifications **AXE**

### Style
- Prettier : 100 caractères par ligne, guillemets simples (`.prettierrc`)
- Tailwind CSS 4 pour le style

## Services

- `providedIn: 'root'` pour les services singleton
- Un service = une responsabilité
