# The Creaking Door – Bandwebsite

Scrollytelling-Website der Band **The Creaking Door (TCD)** – harter Pop-Rock aus Bonn-Beuel.
Beim Scrollen öffnet sich eine 3D-Tür (Three.js) und man betritt den Proberaum, durch den
alle Sektionen als Scroll-Erlebnis inszeniert sind (GSAP ScrollTrigger).

## Lokal ansehen

Es ist eine rein statische Seite – kein Build-Schritt nötig. Einfach `index.html` im Browser
öffnen oder (empfohlen, z. B. für saubere Audio-/Font-Ladevorgänge) einen kleinen lokalen
Server starten:

```bash
# mit Python
python -m http.server 8000

# oder mit Node
npx serve .
```

Dann http://localhost:8000 öffnen.

## Projektstruktur

```
tcd-website/
├── index.html              # Markup aller Sektionen
├── css/
│   ├── base.css            # Variablen, Reset, globale Styles, Buttons, Filmkorn
│   ├── navigation.css      # Navigation + Footer
│   ├── door.css            # Tür-Overlay (Akt 1)
│   ├── sections.css        # Alle Inhalts-Sektionen (Musik, Band, Story, …)
│   └── reduced-motion.css  # Overrides für prefers-reduced-motion (muss zuletzt laden)
├── js/
│   ├── audio.js            # Türknarzen (MP3 oder Synth-Fallback), Sound-Toggle, Kassette
│   ├── nav.js              # Mobiles Burger-Menü
│   ├── door3d.js           # Three.js-Szene der Tür (TCD.initDoorScene)
│   └── scrollytelling.js   # GSAP/ScrollTrigger-Animationen, verbindet alles
└── assets/
    ├── img/                # Bandfotos, Merch, Logo
    └── audio/              # tuerknarzen.mp3 (siehe unten)
```

Die Skripte teilen sich den globalen Namespace `window.TCD` und müssen in der Reihenfolge
`audio.js → nav.js → door3d.js → scrollytelling.js` geladen werden (so wie in `index.html`).

## Abhängigkeiten (per CDN)

- [Three.js r128](https://threejs.org/) – 3D-Tür
- [GSAP 3.12 + ScrollTrigger](https://gsap.com/) – Scroll-Animationen
- Google Fonts: Anton, Archivo, Permanent Marker

## Noch zu erledigen (TODOs)

- **Türknarzen:** Die echte Aufnahme als `assets/audio/tuerknarzen.mp3` ablegen.
  Fehlt die Datei, erzeugt `js/audio.js` automatisch ein synthetisches Knarzen.
- **Galerie:** Die Platzhalter-Frames in der Galerie-Sektion durch echte Fotos ersetzen.
- **Formulare:** `action="#"` beim Kontaktformular und Newsletter durch einen echten
  Endpoint ersetzen (z. B. Formspree, Web3Forms o. Ä. – GitHub Pages kann keine Formulare
  verarbeiten).
- **Gigs:** Sobald Termine feststehen, den auskommentierten `.gig`-Block im Tourplakat
  aktivieren.

## Veröffentlichen mit GitHub Pages

1. Repository auf GitHub erstellen und dieses Verzeichnis pushen.
2. Im Repo unter **Settings → Pages** als Source „Deploy from a branch“ wählen,
   Branch `main` und Ordner `/ (root)`.
3. Die Seite ist danach unter `https://<username>.github.io/<repo>/` erreichbar.

## Barrierefreiheit

- `prefers-reduced-motion` wird respektiert: Tür-Akt und Animationen werden deaktiviert,
  alle Inhalte sind sofort sichtbar.
- Sound ist standardmäßig aus und nur per Toggle aktivierbar.
