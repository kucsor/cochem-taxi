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
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1...  # Tokenul tău Mapbox
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-...  # (Opțional) Google Analytics ID
```

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
- ✅ Google Analytics tracking
- ✅ SEO optimizat cu metadata dinamică
