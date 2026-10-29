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

`src/debug/logger.mjs` enthält einen browserseitigen Logger ohne zusätzliche Abhängigkeiten. Der Debug-Modus erfasst fachliche Aktionen; Fehler werden immer erfasst. Der Puffer hält höchstens 5 MiB JSON-Einträge und verwirft bei Bedarf die ältesten. `src/debug/browser.mjs` ergänzt einen Schalter und einen JSON-Export für eine bestehende Toolbar.

```js
import { createDebugLogger, installGlobalErrorHandlers } from './src/debug/logger.mjs';
import { mountDebugControls } from './src/debug/browser.mjs';

const logger = createDebugLogger({ appVersion: '0.1.0', commitId: 'BUILD_COMMIT_ID' });
installGlobalErrorHandlers(logger);
mountDebugControls(document.querySelector('#toolbar'), logger, {
  getProjectState: () => currentProject,
});

logger.logAction('gate-connected', { componentIds: ['gate-1', 'input-2'] });
const result = logger.runAction('reliability-calculation', () => calculateReliability(), {
  componentIds: ['gate-1'],
});
logger.logAction('tab-converted', { componentIds: ['gate-1'] });
```

`runAction` zeichnet fehlgeschlagene synchrone und asynchrone Berechnungen auch bei ausgeschaltetem Debug-Modus auf und gibt Fehler unverändert weiter. Der Export enthält Zeitstempel, Aktion, Komponenten-IDs, Fehlermeldung und Stacktrace sowie App-Version, Commit-ID und Browser-Version. Ein Projektstand wird nur mit `getProjectState` ergänzt. Die App muss `appVersion`, `commitId` und ihre fachlichen Aktionen beim Einbinden übergeben; der Repository-Stand enthält noch keine App-Oberfläche.
