# Cochem Taxi - Website Next.js

Website pentru serviciul de taxi din Cochem, Germania. Include calculator de tarife, integrare cu hărți Mapbox și suport multi-lingv (DE/EN).

## 🚀 Pornire Rapidă

### 1. Instalare dependențe
```bash
npm install
```

### 2. Configurare variabile de mediu
Copiază fișierul `.env.example` în `.env.local` și completează token-ul Mapbox:
```bash
cp .env.example .env.local
```

Editează `.env.local`:
```env
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1...      # Tokenul tău Mapbox
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-...      # (Opțional) Google Analytics ID
NEXT_PUBLIC_GYG_PARTNER_ID=...           # (Opțional) Partner ID GetYourGuide
NEXT_PUBLIC_WHATSAPP_NUMBER=4915112345678 # (Opțional) Număr WhatsApp, format internațional
```

**Notă despre variabilele opționale:**
- `NEXT_PUBLIC_GYG_PARTNER_ID` — fără el, secțiunile de activități GetYourGuide nu se afișează
  deloc (nu apar widget-uri goale). Se setează în Vercel → Settings → Environment Variables.
- `NEXT_PUBLIC_WHATSAPP_NUMBER` — fără el, butonul WhatsApp nu apare nicăieri. Folosește doar un
  număr care chiar are WhatsApp activ (numărul de dispecerat este fix și, de regulă, nu are).

**Important:** Pentru a obține un token Mapbox gratuit, înregistrează-te pe [https://account.mapbox.com/](https://account.mapbox.com/)

### 3. Rulare development server
```bash
npm run dev
```
Website-ul va fi disponibil la [http://localhost:9002](http://localhost:9002)

### 4. Build pentru producție
```bash
npm run build
npm start
```

## 📁 Structura Proiectului

```
src/
├── app/                    # Pagini și layout-uri (App Router)
│   ├── [lang]/            # Rutare internaționalizată (de/en)
│   ├── actions.ts         # Server Actions (calcul tarife)
│   └── ...
├── components/
│   ├── landing/           # Componente pagina principală
│   └── ui/                # Componente UI (shadcn/ui)
├── lib/                   # Utilități, dicționare, tracking
├── locales/               # Fișiere de traducere
└── ai/                    # Integrare Genkit AI (opțional)
```

## 🔧 Comenzi disponibile

| Comandă | Descriere |
|---------|-----------|
| `npm run dev` | Server development cu Turbopack |
| `npm run build` | Build pentru producție |
| `npm run start` | Pornire server producție |
| `npm run lint` | Verificare ESLint |
| `npm run typecheck` | Verificare TypeScript |

## 🛡️ Securitate

- **Token Mapbox**: Se află în variabila de mediu `NEXT_PUBLIC_MAPBOX_TOKEN`, nu în cod sursă
- Fișierele `.env*` sunt ignorate de Git (vezi `.gitignore`)

## 📱 Funcționalități

- ✅ Calculator tarife taxi cu rutare pe hartă
- ✅ Detectare automată a locației utilizatorului
- ✅ Suport multi-lingv (Germană/Engleză)
- ✅ Design responsive (mobile-first)
- ✅ PWA (Progressive Web App)
- ✅ Google Analytics tracking (doar după consimțământ)
- ✅ SEO optimizat cu metadata dinamică, canonical + hreflang pe fiecare pagină
- ✅ 16 pagini de localitate cu conținut unic (`src/lib/locations.ts`)
- ✅ 4 pagini de transfer: Burg Eltz, Flughafen Hahn, Koblenz, Trier (`src/lib/routes.ts`)
- ✅ Pagini de activități `/de/aktivitaeten` și `/en/things-to-do`
- ✅ Monetizare prin afiliere GetYourGuide, blocată până la consimțământ (DSGVO/TDDDG)
- ✅ Structured data: TaxiService, Service (rute), FAQPage, BreadcrumbList

## 💰 Monetizare & conținut

| Fișier | Rol |
|--------|-----|
| `src/lib/fare.ts` | Tarifele și zona Cochem - sursă unică pentru calculator și prețurile estimate de pe pagini |
| `src/lib/locations.ts` | Datele și textele localităților; adaugă un obiect nou ca să apară o pagină nouă |
| `src/lib/routes.ts` | Rutele de transfer (Burg Eltz, Hahn, Koblenz, Trier) |
| `src/lib/affiliates.ts` | Configurarea widget-ului GetYourGuide |
| `src/components/consent-provider.tsx` | Starea consimțământului; nimic extern nu se încarcă fără el |

Paginile noi apar automat în `sitemap.xml` și în linkurile interne din footer și din secțiunea
„Wir fahren in der gesamten Region".
