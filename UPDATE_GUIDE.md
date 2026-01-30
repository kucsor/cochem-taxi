# 🔄 Ghid: Actualizare Site (După prima publicare)

## ✅ Răspuns Scurt:

**Pe viitor, doar 3 comenzi în terminal:**

```bash
git add .
git commit -m "Am modificat culoare buton"
git push origin main
```

**ATÂT!** Vercel face deploy automat! 🚀

---

## 🎯 De Ce Funcționează Așa?

### Prima oară (ai făcut o dată):
1. ✅ Conectat GitHub la Vercel
2. ✅ Vercel "urmărește" repository-ul tău
3. ✅ La fiecare push nou, Vercel face deploy automat

### Pe viitor (pentru fiecare modificare):
**Doar push pe GitHub** → Vercel vede schimbarea → Face deploy automat

**NU mai trebuie să intri în Vercel!** 🎉

---

## 📋 Comenzi Complete Pentru Update

### Pasul 1: Modifică codul în VS Code
Editezi fișierele cum vrei...

### Pasul 2: Upload pe GitHub
Deschide terminal (Ctrl+`) și rulează:

```bash
# 1. Adaugă toate fișierele modificate
git add .

# 2. Creează un "commit" cu descriere
git commit -m "Am schimbat culoare header si text hero"

# 3. Trimite pe GitHub
git push origin main
```

### Pasul 3: Gata! 🎉
- Vercel detectează automat schimbarea
- Face build și deploy în ~2 minute
- Site-ul e actualizat!

---

## 👀 Cum Vezi Dacă E Gata?

### Opțiunea 1: În terminal
După `git push`, vezi mesaj de confirmare.

### Opțiunea 2: Pe GitHub
Mergi la https://github.com/USERNAME/cochem-taxi
Vei vedea un punct galben/oranj lângă ultimul commit (înseamnă că Vercel lucrează).

### Opțiunea 3: Pe Vercel (opțional)
https://vercel.com/dashboard → Click pe proiect → Tab "Deployments"
Vezi status: Building → Ready

---

## 📝 Exemple De Commit Messages

```bash
# Modificare mică
git commit -m "Fix typo in hero text"

# Feature nou
git commit -m "Add contact form section"

# Update design
git commit -m "Change primary color to blue"

# Bug fix
git commit -m "Fix mobile menu not closing"
```

---

## ❌ Ce NU Trebuie Să Faci

### ❌ NU re-importa proiectul în Vercel
O singură dată e suficient!

### ❌ NU șterge repository-ul GitHub
Vercel e conectat la el!

### ❌ NU modifica variabilele de mediu dacă nu e necesar
Tokenurile API rămân aceleași.

---

## 🆘 Dacă Ceva Nu Funcționează

### "Everything up-to-date" dar nu vezi modificări
```bash
git status                    # Vezi ce fișiere s-au schimbat
git add .                     # Adaugă-le pe toate
git commit -m "Update"        # Commit
git push origin main          # Push
```

### Eroare "rejected"
```bash
git pull origin main          # Ia ultimele schimbări
git push origin main          # Încearcă din nou
```

### Vercel nu face deploy
1. Mergi pe https://vercel.com/dashboard
2. Click pe proiect
3. Settings → Git → Verifică că "Connect to GitHub" e activ

---

## 🎓 Comenzi Git Utile (Opțional)

```bash
# Vezi ce fișiere ai modificat
git status

# Vezi istoricul de commit-uri
git log --oneline

# Anulează modificări (fișier specific)
git checkout -- nume-fisier.tsx

# Anulează tot ce ai modificat (ATENȚIE!)
git checkout .
```

---

## 💡 Sfat

Fă commit des! Nu aștepta să ai 100 de modificări.

**Ideal:** La fiecare funcționalitate mică terminată.

---

**Întrebări? Scrie-mi oricând!** 💪