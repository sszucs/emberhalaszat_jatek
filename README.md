# Emberhalászat – Lukács 5:1–11 (GitHub Pages csomag)

Mobilbarát, statikus HTML/CSS/JS játékcsomag Lukács 5:1–11 alapján.

## Tartalom
- **1. játékmód – Emberhalászat**: időzített hálódobás, fogások, rövid tanítások
- **2. játékmód – Interaktív történet**: Péter döntései Jézus szavára
- **3. játékmód – Tanulság-kihívások**: „Ne félj”, hit, elhívás

## Fájlszerkezet
```text
/
├── index.html
├── .nojekyll
├── css/
│   └── style.css
└── js/
    └── script.js
```

## GitHub Pages telepítés
1. Hozz létre egy új **public** repositoryt GitHubon (például `lukacs5-jatek`).
2. Töltsd fel **ennek a csomagnak minden fájlját** a repository gyökerébe.
3. A GitHubon menj ide: **Settings → Pages**.
4. Válaszd ezt:
   - **Source**: `Deploy from a branch`
   - **Branch**: `main`
   - **Folder**: `/(root)`
5. Mentsd el, majd várj néhány percet.
6. A kész link formája várhatóan:
   - `https://felhasznalonev.github.io/lukacs5-jatek/`

## Testreszabás
- A szövegek a `js/script.js` fájlban vannak.
- A színek és UI elemek a `css/style.css` fájlban módosíthatók.
- A játék statikus, backend nélkül működik.

## Tipp
Ha csak egyszerű HTML/CSS/JS fájlokat használsz, ez a csomag közvetlenül működik GitHub Pages-en.
