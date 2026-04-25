# Emberhalászat 2.1 – GitHub Pages csomag

Ez a **2.1-es, továbbfejlesztett** verzió már közelebb áll egy mai, profi játékélményhez:
- modernebb UI / UX
- mobil + desktop optimalizálás
- fejlesztett 1. játékmód (embereket ér el Péter, nem szíveket gyűjt)
- képes, teljes történetívre épülő 2. játékmód Lukács 5:1–11 alapján
- több hozzáadott értékű 3. játékmód (Tanulság-labor)

## Fájlszerkezet
```text
/
├── index.html
├── .nojekyll
├── README.md
├── css/
│   └── style.css
└── js/
    └── script.js
```

## Feltöltés GitHub Pages-re
A repository gyökerében ez jelenjen meg:
- `index.html`
- `.nojekyll`
- `README.md`
- `css/`
- `js/`

### Lépések
1. Hozz létre egy **public** repositoryt (például: `lukacs5-jatek`).
2. A ZIP kicsomagolt **tartalmát** töltsd fel a repo gyökerébe.
3. GitHubon: **Settings → Pages**.
4. Állítsd be:
   - **Source**: `Deploy from a branch`
   - **Branch**: `main`
   - **Folder**: `/(root)`
5. Pár perc múlva működni fog a link.

## Fontos
A `css` és `js` mappák **mappaként** maradjanak meg.
Az `index.html` ezekre így hivatkozik:
- `css/style.css`
- `js/script.js`

Tehát nem kell a CSS és JS fájlt a rootba átrakni.
