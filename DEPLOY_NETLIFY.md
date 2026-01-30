# 🚀 Deploy pe Netlify - Instrucțiuni Complete

## Pasul 1: Verifică Variabilele de Mediu

Asigură-te că fișierul `.env.local` există și conține:

```env
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1Ijoia3V4b3IiLCJhIjoiY21rejM5dzVzMGI1dDNlcjM4bm9qbmtrdyJ9.hxdGkoj2symWByLE8RfcuQ
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-L53813EW8Y
```

## Pasul 2: Build Local

Rulează în terminal:

```bash
npm run build
```

Acesta va crea folderul `dist/` cu toate fișierele statice.

## Pasul 3: Upload pe Netlify

### Opțiunea A: Drag & Drop (Cea mai simplă)
1. Mergi pe https://app.netlify.com/drop
2. Loghează-te (sau creează cont gratuit)
3. Drag & drop folderul `dist/` în zona indicată
4. Gata! Site-ul e live!

### Opțiunea B: Netlify CLI
```bash
npm install netlify-cli -g
netlify login
netlify deploy --prod --dir=dist
```

## Pasul 4: Configurare Domeniu (Opțional)

1. În Netlify Dashboard → Site settings → Domain management
2. Adaugă domeniul tău personalizat sau folosește subdomeniul gratuit `nume-tau.netlify.app`

## 📁 Ce Fișiere se Upload-ează?

Folderul `dist/` conține:
- `index.html` (pagina principală)
- `de/`, `en/` (pagini traduse)
- `_next/` (JavaScript și CSS)
- Toate fișierele din `public/` (imagini, favicon, manifest)
- `404.html` (pagină eroare)

## ⚠️ IMPORTANT

- **NU** uita să adaugi variabilele de mediu în Netlify Dashboard dacă folosești Git integration
- Dacă schimbi codul, rulează din nou `npm run build` și reupload
- Site-ul va fi disponibil instant la URL-ul generat de Netlify

## 🔧 Troubleshooting

**Eroare "Mapbox token missing"**: Verifică că `.env.local` există și are tokenul.

**Eroare build**: Rulează `npm install` înainte de build.

**404 pe rute**: Next.js export static funcționează cu `trailingSlash: true` (deja configurat).

---

✅ **După deploy, site-ul va fi disponibil la: `https://nume-tau.netlify.app`**