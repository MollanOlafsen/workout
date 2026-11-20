# 28 dager – treningsapp

Personlig web-app for 28-dagersprogrammet i kalisthenics (armhevinger, knebøy, utfall, planke, høye kneløft).

## Hva appen gjør

- **I dag:** viser dagens økt med en liten animert figur som viser hver øvelse, med én knapp per sett som krysses av. Dagen kan fullføres når alle sett er tatt.
- **Hviledager og maks-tester:** hviledager markeres som fullført; på dag 7, 15 og 28 skriver du inn antall armhevinger.
- **Oversikt:** alle 28 dager i et rutenett, fremgang og resultatene fra maks-testene.

Gjeldende dag er første dag som ikke er fullført, så en dag du hopper over forskyver bare resten.

## Filer

| Fil | Innhold |
| --- | --- |
| `index.html` | Sideskallet |
| `style.css` | Utseende |
| `plan.js` | Selve programmet: øvelser, sett, repetisjoner og tider |
| `figures.js` | De animerte figurene som viser hver øvelse |
| `app.js` | Logikk, visninger og lagring |
| `manifest.webmanifest`, `icon-*.png` | Gjør at appen kan legges på hjemskjermen |

Ingen byggesteg og ingen avhengigheter utover skriftene fra Google Fonts.

## Kjøre lokalt

Åpne `index.html` i en nettleser, eller start en enkel server i mappen:

```
python -m http.server 8000
```

og gå til `http://localhost:8000`.

## På nett

Appen publiseres automatisk på GitHub Pages hver gang `main` oppdateres:
https://mollanolafsen.github.io/workout/

Første gang må Pages skrus på i repoet: Settings → Pages → Source: «GitHub Actions».

## Bruke på mobilen

Mappen må ligge på en webserver med HTTPS for å kunne åpnes på telefonen. Last opp alle filene til en undermappe på et nettsted du styrer, åpne adressen i Safari, og velg Del → Legg til på Hjem-skjerm.

## Lagring

Fremgangen lagres i `localStorage` under nøkkelen `kalisthenics28`, på den enheten og i den nettleseren du bruker. Den synkroniseres ikke mellom enheter.

## Ideer til videre arbeid

- Tidtaker for planke, kneløft og pauser
- Fransk språkvalg
- Eksport og import av fremgang
