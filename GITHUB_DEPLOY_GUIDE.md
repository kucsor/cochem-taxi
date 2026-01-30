# 📚 Ghid Complet: GitHub + Vercel Deploy

## PASUL 1: Pregătire Proiect Local

### 1.1 Inițializează Git (dacă nu există)
Deschide terminal în VS Code (Ctrl+`) și rulează:

```bash
git init
```

### 1.2 Creează fișier .gitignore
Crează un fișier numit `.gitignore` în rădăcina proiectului cu conținutul:

```
# Dependencies
node_modules
.pnp
.pnp.*
.yarn/*
!.yarn/patches
!.yarn/plugins
!.yarn/releases
!.yarn/versions

# Testing
/coverage

# Next.js
/.next/
/out/

# Production
/build
/dist

# Misc
.DS_Store
*.pem
.env.local
.env.development.local
.env.test.local
.env.production.local

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*

# Vercel
.vercel

# TypeScript
*.tsbuildinfo
next-env.d.ts
```

### 1.3 Adaugă fișierele în Git
```bash
git add .
git commit -m "Initial commit"
```

---

## PASUL 2: Creare Cont GitHub

### 2.1 Dacă nu ai cont:
1. Mergi pe https://github.com/signup
2. Completează email, parolă, username
3. Verifică email-ul

### 2.2 Creare Repository Nou
1. Logat în GitHub, apasă pe **"+"** în dreapta sus → **"New repository"**
2. Completează:
   - **Repository name**: `cochem-taxi` (sau ce nume vrei)
   - **Description**: Website taxi Cochem
   - **Public** (selectat)
   - ✅ Bifează **"Add a README file"** (opțional)
3. Apasă **"Create repository"**

---

## PASUL 3: Conectare și Push

### 3.1 Adaugă Remote Repository
În terminal, rulează (înlocuiește `USERNAME` cu username-ul tău):

```bash
git remote add origin https://github.com/USERNAME/cochem-taxi.git
```

### 3.2 Push Codul
```bash
git branch -M main
git push -u origin main
```

**Dacă te întreabă de login:**
- Username: username-ul GitHub
- Password: **Nu** parola, ci **Personal Access Token** (vezi mai jos)

### 3.3 Creare Personal Access Token (dacă e necesar)
1. GitHub → Settings (click pe avatar) → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token (classic)
3. Note: "Deploy"
4. Expiration: No expiration
5. Selectează scope: **repo** (bifează tot)
6. Generate token
7. **Copiază tokenul** (apare doar o dată!)
8. Folosește acest token ca parolă la git push

---

## PASUL 4: Deploy pe Vercel (Cel mai simplu!)

### 4.1 Creare Cont Vercel
1. Mergi pe https://vercel.com/signup
2. Apasă **"Continue with GitHub"**
3. Autorizează Vercel să acceseze repository-urile

### 4.2 Import Proiect
1. În Vercel Dashboard, apasă **"Add New..."** → **"Project"**
2. Găsește și selectează repository-ul `cochem-taxi`
3. Apasă **"Import"**

### 4.3 Configurare Environment Variables
Înainte de deploy, adaugă variabilele:

1. Scroll jos la **"Environment Variables"**
2. Adaugă:
   - **Name**: `NEXT_PUBLIC_MAPBOX_TOKEN`
   - **Value**: `pk.eyJ1Ijoia3V4b3IiLCJhIjoiY21rejM5dzVzMGI1dDNlcjM4bm9qbmtrdyJ9.hxdGkoj2symWByLE8RfcuQ`
3. Apasă **"Add"**
4. (Opțional) Adaugă și `NEXT_PUBLIC_GA_MEASUREMENT_ID` dacă vrei Google Analytics

### 4.4 Deploy
1. Apasă **"Deploy"**
2. Așteaptă 2-3 minute
3. **Gata!** Site-ul e live! 🎉

---

## PASUL 5: Domeniu Personalizat (Opțional)

### 5.1 În Vercel Dashboard:
1. Mergi la proiectul tău
2. Settings → Domains
3. Adaugă domeniul tău (ex: `cochem-taxi.de`)
4. Urmează instrucțiunile pentru DNS

---

## 🔄 Actualizare Site (După modificări)

Când modifici codul și vrei să actualizezi site-ul:

```bash
git add .
git commit -m "Descriere modificări"
git push origin main
```

**Vercel face deploy automat!** 🚀

---

## ❓ Troubleshooting

### "Repository not found"
Verifică că URL-ul e corect:
```bash
git remote -v
```

### "Permission denied"
Folosește Personal Access Token în loc de parolă.

### "fatal: not a git repository"
Rulează mai întâi:
```bash
git init
```

### Vercel - "Build failed"
Verifică în Vercel Dashboard → Deployments → Click pe ultimul deploy → View Build Log

---

**Ai întrebări? Scrie-mi!** 💪