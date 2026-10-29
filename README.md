# Safety

Eine Software für Safety Engineering mit drei Reitern: **Fehlerbaumanalyse**, **Zuverlässigkeitsdiagramm** und **Binary Decision Diagram (BDD)**. Alle drei Reiter beschreiben dasselbe System, nur in unterschiedlicher Darstellung — jede Darstellung lässt sich automatisch aus einer der beiden anderen ableiten.

Das Projekt entsteht im Rahmen des Praktikums Betriebssicherheit am Institut für Echtzeitsysteme und Softwaretechnik.

## Konzept und Anforderungen

- [`Konzept.md`](Konzept.md) — Gesamtkonzept: Plattform, UI-Prinzip, Berechnungsgrundlagen, Spielregeln für die Mitarbeit
- [`requirements/`](requirements) — Detaillierte Anforderungen je Reiter:
  - [Fehlerbaumanalyse](requirements/Fehlerbaumanalyse.md)
  - [Zuverlässigkeitsdiagramm](requirements/Zuverlaessigkeitsdiagramm.md)
  - [Binary Decision Diagram](requirements/Binary%20Decision%20Diagram.md)

## Mitmachen

1. Ein offenes [Issue](https://github.com/derkrembold/safety/issues) aussuchen (oder im [Project-Board](https://github.com/users/derkrembold/projects/3) nachsehen, was noch offen ist).
2. Repo forken, eigenen Branch anlegen (`issue-<nr>-kurzbeschreibung`).
3. Pull Request öffnen, der das Issue referenziert (`Closes #<nr>`).
4. Codex schaut sich den PR an und kommentiert (ändert keinen Code). Offene Punkte werden von dir oder dem Dozenten gelöst.
5. Merge erfolgt ausschließlich durch den Dozenten.

Details zu den Regeln: siehe [`Konzept.md`, Abschnitt "Spielregeln"](Konzept.md#spielregeln).

## Debug-Logging (Issue #7)

Die Anwendung verwendet React, TypeScript und Vite. Zum Starten werden Node.js ab 22.12 und pnpm benötigt:

```sh
pnpm install
pnpm dev
```

`pnpm build` prüft TypeScript und erzeugt den Produktionsbuild in `dist/`. `pnpm preview` zeigt diesen Build lokal an.

`src/debug/logger.ts` enthält den typisierten Logger. Der Debug-Modus erfasst fachliche Aktionen; Fehler werden immer erfasst. Der Puffer hält höchstens 5 MiB JSON-Einträge und verwirft bei Bedarf die ältesten. Überlange Einträge werden gekürzt und markiert. Die Grenze betrifft die UTF-8-Daten der Einträge, nicht den gesamten JavaScript-Heap oder den Export mit optionalem Projektstand. Logs bleiben im Arbeitsspeicher und gehen beim Neuladen verloren.

Die React-Komponente `DebugControls` bietet einen Schalter und JSON-Download. Wird `getProjectState` übergeben, kann der Benutzer den Projektstand ausdrücklich zum Export hinzufügen. Alle zukünftigen Reiter nutzen dieselbe Instanz aus `src/debug/appLogger.ts`:

```tsx
import { appLogger } from './debug/appLogger';
import { DebugControls } from './debug/DebugControls';

appLogger.logAction('gate-connected', { componentIds: ['gate-1', 'input-2'] });
const result = appLogger.runAction('reliability-calculation', () => calculateReliability(), {
  componentIds: ['gate-1'],
});
appLogger.logAction('tab-converted', { componentIds: ['gate-1'] });

// In der App-Toolbar; currentProject muss JSON-serialisierbar sein:
<DebugControls logger={appLogger} getProjectState={() => currentProject} />
```

`runAction` zeichnet fehlgeschlagene synchrone und asynchrone Berechnungen auch bei ausgeschaltetem Debug-Modus auf und gibt Fehler weiter. Unbehandelte Browser-Fehler, Promise-Ablehnungen und React-Renderfehler werden ebenfalls erfasst. Der Export enthält Zeitstempel, Aktion, Komponenten-IDs, Fehlermeldung und Stacktrace, sofern verfügbar, sowie App-Version, Commit-ID und Browser-Version. Vite liest die Version aus `package.json` und die Commit-ID beim Start beziehungsweise Build aus Git; ohne Git-Metadaten lautet die ID `unknown`. Die Startseite stellt die Logging-Bedienelemente bereit. Die Diagramm-Editoren entstehen in eigenen Issues.
