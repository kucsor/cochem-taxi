
# Prompt pentru Recrearea Website-ului de Taxi

Acest document conține toate specificațiile necesare pentru a recrea de la zero un website pentru o companie de taxi din Cochem, Germania.

## 1. Prezentare Generală și Tehnologie

**Scop:** Crearea unui site de prezentare modern, rapid și bilingv pentru o firmă de taxi. Funcționalitatea principală este un calculator de tarif estimativ.

**Tehnologie:**
- **Framework:** Next.js cu App Router
- **Limbaj:** TypeScript
- **Stilizare:** Tailwind CSS
- **Componente UI:** shadcn/ui
- **Hartă și Rutare:** Leaflet.js (frontend), API-uri Open Source (Nominatim pentru geocodare și OSRM pentru rutare) (backend)
- **Internaționalizare (i18n):** Suport pentru limbile germană (`de`) și engleză (`en`).

## 2. Structura și Design-ul General

- **Tema:** Dark mode by default.
- **Fonturi:**
    - **Corp text:** 'Inter', sans-serif
    - **Titluri:** 'Poppins', sans-serif
- **Paleta de culori (principale):**
    - `background`: `hsl(0 0% 8%)`
    - `foreground`: `hsl(0 0% 98%)`
    - `card`: `hsl(0 0% 12%)`
    - `primary`: `hsl(45 93% 54%)` (un auriu/galben)
    - `accent`: `hsl(45 93% 54%)`
- **Layout:**
    - Un antet (Header) lipicios (sticky) în partea de sus.
    - Conținutul principal centrat într-un container.
    - Un subsol (Footer) în partea de jos.

## 3. Structura Fișierelor și Componentelor

Proiectul este organizat astfel:
- `src/app/[lang]/`: Paginile principale ale aplicației (homepage, pagina legală).
- `src/components/landing/`: Componente React specifice paginii de pornire (Hero, FareCalculator, etc.).
- `src/components/ui/`: Componente generice de UI de la shadcn (Button, Input, Card, etc.).
- `src/locales/`: Fișiere JSON cu traducerile (`de.json`, `en.json`).
- `src/lib/`: Funcții utilitare și logica pentru dicționare.
- `src/app/actions.ts`: Server Action pentru calcularea tarifului.
- `src/middleware.ts`: Middleware pentru gestionarea limbilor (i18n).

## 4. Paginile Aplicației

### A. Pagina Principală (`src/app/[lang]/page.tsx`)
Este compusă din următoarele secțiuni/componente, în această ordine:
1.  **Hero (`hero.tsx`):** Afișează titlul principal, un subtitlu și un buton proeminent "CALL NOW" care este un link `tel:`. Butonul are o animație subtilă de pulsare (`pulse-strong`).
2.  **FareCalculator (`fare-calculator.tsx`):** Componenta interactivă principală (detaliată mai jos).
3.  **Services (`services.tsx`):** O secțiune cu 3 carduri care descriu serviciile principale (transfer hotel, castel, aeroport), fiecare cu o pictogramă.
4.  **WhyUs (`why-us.tsx`):** Un card care listează punctele forte ale serviciului.
5.  **ServiceRegion (`service-region.tsx`):** O secțiune care afișează o listă de localități deservite sub formă de "badges".

### B. Pagina Legală (`src/app/[lang]/legal/page.tsx`)
- Afișează conținutul "Impressum & Datenschutz".
- Conține un buton de închidere (X) în colțul dreapta-sus pentru a reveni la pagina principală.

## 5. Funcționalitate Detaliată: Calculatorul de Tarif

Aceasta este cea mai complexă parte a aplicației.

### A. Interfața Utilizator (Frontend - `fare-calculator.tsx`)
- **Câmpuri:**
    1.  **Start:** Input de text cu funcție de autocompletare și un buton "Găsește-mă".
    2.  **Destinație:** Input de text cu funcție de autocompletare.
    3.  **Oră:** Input de tip `time`.
- **Logica de Autocompletare:**
    - Se activează după tastarea a minim 2 caractere.
    - Combină două surse de date:
        1.  **Listă locală predefinită:** Pentru puncte de interes majore ("Cochem Bahnhof", "Reichsburg Cochem") pentru a garanta acuratețea.
        2.  **API Extern (Nominatim):** Face un request către `https://nominatim.openstreetmap.org/search` pentru a găsi alte adrese. Request-ul este configurat să prioritizeze rezultatele din jurul Cochem-ului.
    - Rezultatele combinate sunt de-duplicate pentru a afișa o listă unică și curată.
- **Butonul "Găsește-mă":**
    - Folosește `navigator.geolocation.getCurrentPosition()` pentru a obține coordonatele GPS exacte ale utilizatorului cu precizie ridicată.
    - Afișează un text de încărcare ("Wird gesucht...").
    - La succes, populează câmpul "Start" cu textul "Standort: {lat}, {lon}" și salvează intern coordonatele.
- **Afișare Rezultat:**
    - După calcul, afișează prețul estimat și distanța.
- **Hartă (`map.tsx`):**
    - Folosește `leaflet` pentru a afișa o hartă.
    - La primirea geometriei rutei de la backend, desenează linia rutei pe hartă și ajustează zoom-ul pentru a o încadra.
    - Culoarea liniei este setată dinamic pe baza variabilei CSS `--primary`.

### B. Logica de Calcul (Backend - Server Action `actions.ts`)

Funcția `calculateFare` execută următorii pași:
1.  **Validare Input:** Verifică dacă toate câmpurile sunt completate.
2.  **Geocodare:**
    - Dacă primește direct coordonate de la frontend (de la butonul "Găsește-mă" sau o sugestie selectată), le folosește.
    - Altfel, folosește API-ul Nominatim (`https://nominatim.openstreetmap.org/search`) pentru a converti adresele text în coordonate.
3.  **Rutare:**
    - Apelează API-ul OSRM (`https://router.project-osrm.org/route/v1/driving/...`) cu coordonatele de start și de final.
    - Obține distanța în kilometri și geometria rutei (în format geojson).
4.  **Calcul Preț:**
    - **Tarif de noapte:** Se aplică dacă ora preluării este între 22:00 și 05:59.
    - **Constante:**
        - `BASE_FEE = 4.1`
        - `RATE_PER_KM_DAY = 2.6`
        - `RATE_PER_KM_NIGHT = 2.8`
    - **Formula finală:** `price = (BASE_FEE + distance * ratePerKm) * 1.1`
5.  **Returnare:** Returnează un obiect de stare care conține `price`, `distance`, `geometry` (pentru hartă) și eventuale mesaje de eroare.

## 6. Internaționalizare (i18n)

- **Strategie:** Rutare bazată pe prefix de cale (`/de/...` sau `/en/...`).
- **Default:** Limba germană (`de`) este limba implicită.
- **Middleware (`middleware.ts`):** Redirecționează utilizatorii fără un prefix de limbă către versiunea `de`.
- **Componenta `LanguageSwitcher`:** Permite utilizatorului să comute între limbile disponibile.
- **Fișiere de traducere:** Conținutul textului este stocat în `src/locales/de.json` și `src/locales/en.json`.

## 7. Conținutul Textual (Traduceri)

Pentru a recrea site-ul exact, folosiți următorul conținut pentru fișierele JSON.

### `src/locales/de.json`
```json
{
  "metadata": {
    "title": "Ihr zuverlässiges Taxi in Cochem",
    "description": "Ihr zuverlässiges Taxi in Cochem und Umgebung. Buchen Sie Hotel-Transfers, Reichsburg-Touren und Fahrten zum Flughafen Hahn."
  },
  "hero": {
    "title": "Brauchen Sie ein Taxi in Cochem?",
    "subtitle": "Immer zuverlässig & für Sie da.",
    "callButton": "JETZT ANRUFEN",
    "phoneNumber": "02671 8080"
  },
  "fareCalculator": {
    "title": "Fahrpreis berechnen",
    "startLabel": "Von (Start)",
    "startPlaceholder": "z.B. Cochem Bahnhof",
    "endLabel": "Nach (Ziel)",
    "endPlaceholder": "z.B. Reichsburg Cochem",
    "timeLabel": "Uhrzeit",
    "submitButton": "Preis schätzen",
    "locateMeAriaLabel": "Aktuellen Standort verwenden",
    "resultTitle": "Ungefährer Preis",
    "resultDistance": "Basierend auf einer geschätzten Entfernung von {distance} km.",
    "routeMapTitle": "Route auf der Karte",
    "errorMessages": {
      "generic": "Ein unerwarteter Fehler ist aufgetreten.",
      "geocoding_both": "Start- und Zieladresse konnten nicht gefunden werden.",
      "geocoding_start": "Startadresse konnte nicht gefunden werden.",
      "geocoding_end": "Zieladresse konnte nicht gefunden werden.",
      "routing": "Route zwischen den Adressen konnte nicht berechnet werden.",
      "missing_input": "Bitte geben Sie Start, Ziel und Uhrzeit ein."
    },
    "locationPrefix": "Standort:",
    "locating": "Wird gesucht"
  },
  "services": {
    "title": "Ihr lokaler Taxi-Service in Cochem",
    "description": "Willkommen bei Cochem Taxi. Wir sind Ihr zuverlässiger Partner für Fahrten in, um und ab Cochem. Egal welches Ziel, wir sind für Sie da.",
    "items": {
      "hotel": {
        "title": "Hotel-Transfer",
        "description": "Wir bringen Sie sicher und pünktlich zu Ihrem Hotel oder holen Sie von dort ab."
      },
      "castle": {
        "title": "Reichsburg Transfer",
        "description": "Besichtigen Sie das Wahrzeichen von Cochem ohne Parkplatzsorgen."
      },
      "airport": {
        "title": "Flughafen-Transfer",
        "description": "Starten Sie entspannt in den Urlaub mit unserem Transfer zum Flughafen Hahn."
      }
    }
  },
  "whyUs": {
    "title": "Warum Cochem Taxi?",
    "features": [
      "Ortskundige und mehrsprachige Fahrer",
      "Klimatisierte & moderne Fahrzeuge",
      "Kurier- & Botenfahrten",
      "Krankenfahrten für alle Kassen (sitzend)"
    ]
  },
  "serviceRegion": {
    "title": "Wir fahren in der gesamten Region",
    "andMore": "... und mehr"
  },
  "footer": {
    "companyName": "Cochem Taxi",
    "openingHoursTitle": "Öffnungszeiten",
    "openingHoursContent": "24 Stunden / 7 Tage\nAuch an Sonn- und Feiertagen",
    "copyright": "© {year} Cochem Taxi. Alle Rechte vorbehalten.",
    "tagline": "",
    "legalLink": "Impressum & Datenschutz"
  },
  "legalPage": {
    "title": "Impressum & Datenschutz",
    "impressumTitle": "Impressum",
    "angabenTitle": "Angaben gemäß § 5 TMG",
    "betreiber": "<strong>Betreiber der Website:</strong><br>Alexandru Kucsor<br>Bergstrasse 18<br>56812 Cochem<br>Deutschland",
    "kontaktTitle": "Kontakt",
    "kontaktContent": "Telefon: +49 0151 29616693<br>E-Mail: Alexandru.Kucsor@gmail.com",
    "verantwortlichTitle": "Redaktionell verantwortlich",
    "verantwortlichContent": "Alexandru Kucsor<br>Bergstrasse 18<br>56812 Cochem<br>Deutschland",
    "disclaimerTitle": "Haftungsausschluss (Disclaimer)",
    "unabhaengigkeitTitle": "1. Wichtiger Hinweis zur Unabhängigkeit",
    "unabhaengigkeitContent": "Diese Website ([Ihr Domainname]) ist ein <strong>unabhängiges Informationsportal</strong> für Taxidienstleistungen in Cochem. Wir sind <strong>nicht</strong> die offizielle Website der Firma \"Taxco AG\" oder eines anderen Taxiunternehmens. Alle über diese Seite getätigten Anrufe werden direkt an die offizielle Taxizentrale (Tel: 02671 8080) weitergeleitet. Wir handeln als privater Vermittler ohne Aufpreis für den Nutzer.",
    "tarifrechnerTitle": "2. Haftung für den Tarifrechner",
    "tarifrechnerContent": "Der auf dieser Website integrierte Fahrpreisrechner dient ausschließlich der groben Orientierung. Die berechneten Preise sind <strong>unverbindliche Schätzungen</strong> (ca. Preise) basierend auf Durchschnittswerten. <strong>Rechtlich bindend ist ausschließlich der Fahrpreis, der vom geeichten Taxameter im Fahrzeug angezeigt wird.</strong> Wir übernehmen keine Gewähr für die Richtigkeit der berechneten Distanzen oder Preise.",
    "inhalteTitle": "3. Haftung für Inhalte",
    "inhalteContent": "Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Wir sind jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Inhalte umgehend entfernen.",
    "linksTitle": "4. Haftung für Links",
    "linksContent": "Unser Angebot enthält Links zu externen Websites Dritter (z.B. Partnerempfehlungen für Hotels oder Restaurants), auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.",
    "datenschutzTitle": "Datenschutzerklärung (Auszug)",
    "analyticsTitle": "Google Analytics",
    "analyticsContent": "Diese Website nutzt Funktionen des Webanalysedienstes Google Analytics. Anbieter ist die Google Ireland Limited. Google Analytics verwendet sog. \"Cookies\". Das sind Textdateien, die auf Ihrem Computer gespeichert werden und die eine Analyse der Benutzung der Website durch Sie ermöglichen.<br><br><strong>IP-Anonymisierung:</strong> Wir haben auf dieser Website die Funktion IP-Anonymisierung aktiviert. Dadurch wird Ihre IP-Adresse von Google innerhalb von Mitgliedstaaten der Europäischen Union vor der Übermittlung in die USA gekürzt."
  }
}
```

### `src/locales/en.json`
```json
{
  "metadata": {
    "title": "Your Reliable Taxi in Cochem",
    "description": "Your reliable taxi in Cochem and the surrounding area. Book hotel transfers, Reichsburg tours, and trips to Hahn Airport."
  },
  "hero": {
    "title": "Need a Taxi in Cochem?",
    "subtitle": "Always reliable & there for you.",
    "callButton": "CALL NOW",
    "phoneNumber": "02671 8080"
  },
  "fareCalculator": {
    "title": "Calculate Fare",
    "startLabel": "From (Start)",
    "startPlaceholder": "e.g., Cochem Station",
    "endLabel": "To (Destination)",
    "endPlaceholder": "e.g., Reichsburg Cochem",
    "timeLabel": "Time",
    "submitButton": "Estimate Price",
    "locateMeAriaLabel": "Use current location",
    "resultTitle": "Approximate Price",
    "resultDistance": "Based on an estimated distance of {distance} km.",
    "routeMapTitle": "Route on the map",
    "errorMessages": {
      "generic": "An unexpected error occurred.",
      "geocoding_both": "Start and destination address could not be found.",
      "geocoding_start": "Start address could not be found.",
      "geocoding_end": "Destination address could not be found.",
      "routing": "Route between the addresses could not be calculated.",
      "missing_input": "Please enter start, destination, and time."
    },
    "locationPrefix": "Location:",
    "locating": "Locating"
  },
  "services": {
    "title": "Your Local Taxi Service in Cochem",
    "description": "Welcome to Cochem Taxi. We are your reliable partner for trips in, around, and from Cochem. Whatever your destination, we are here for you.",
    "items": {
      "hotel": {
        "title": "Hotel Transfer",
        "description": "We will take you safely and punctually to your hotel or pick you up from there."
      },
      "castle": {
        "title": "Reichsburg Transfer",
        "description": "Visit Cochem's landmark without worrying about parking."
      },
      "airport": {
        "title": "Airport Transfer",
        "description": "Start your vacation relaxed with our transfer to Hahn Airport."
      }
    }
  },
  "whyUs": {
    "title": "Why Cochem Taxi?",
    "features": [
      "Local and multilingual drivers",
      "Air-conditioned & modern vehicles",
      "Courier & messenger services",
      "Patient transport for all health insurances (seated)"
    ]
  },
  "serviceRegion": {
    "title": "We operate in the entire region",
    "andMore": "... and more"
  },
  "footer": {
    "companyName": "Cochem Taxi",
    "openingHoursTitle": "Opening Hours",
    "openingHoursContent": "24 hours / 7 days\nAlso on Sundays and public holidays",
    "copyright": "© {year} Cochem Taxi. All rights reserved.",
    "tagline": "",
    "legalLink": "Imprint & Privacy"
  },
  "legalPage": {
    "title": "Imprint & Privacy Policy",
    "impressumTitle": "Imprint",
    "angabenTitle": "Information pursuant to § 5 TMG",
    "betreiber": "<strong>Website Operator:</strong><br>Alexandru Kucsor<br>Bergstrasse 18<br>56812 Cochem<br>Germany",
    "kontaktTitle": "Contact",
    "kontaktContent": "Phone: +49 0151 29616693<br>Email: Alexandru.Kucsor@gmail.com",
    "verantwortlichTitle": "Editorially responsible",
    "verantwortlichContent": "Alexandru Kucsor<br>Bergstrasse 18<br>56812 Cochem<br>Germany",
    "disclaimerTitle": "Disclaimer",
    "unabhaengigkeitTitle": "1. Important Notice on Independence",
    "unabhaengigkeitContent": "This website ([Your Domain Name]) is an <strong>independent information portal</strong> for taxi services in Cochem. We are <strong>not</strong> the official website of the company \"Taxco AG\" or any other taxi company. All calls made via this site are forwarded directly to the official taxi control center (Tel: 02671 8080). We act as a private intermediary at no extra charge to the user.",
    "tarifrechnerTitle": "2. Liability for the Fare Calculator",
    "tarifrechnerContent": "The fare calculator integrated on this website is for rough guidance only. The calculated prices are <strong>non-binding estimates</strong> (approx. prices) based on average values. <strong>Legally binding is exclusively the fare displayed by the calibrated taximeter in the vehicle.</strong> We assume no liability for the accuracy of the calculated distances or prices.",
    "inhalteTitle": "3. Liability for Content",
    "inhalteContent": "As a service provider, we are responsible for our own content on these pages in accordance with general laws pursuant to § 7 (1) TMG. However, we are not obligated to monitor transmitted or stored third-party information. Upon notification of violations, we will remove such content immediately.",
    "linksTitle": "4. Liability for Links",
    "linksContent": "Our offer contains links to external websites of third parties (e.g., partner recommendations for hotels or restaurants), on whose contents we have no influence. Therefore, we cannot assume any liability for these external contents. The respective provider or operator of the pages is always responsible for the contents of the linked pages.",
    "datenschutzTitle": "Privacy Policy (Excerpt)",
    "analyticsTitle": "Google Analytics",
    "analyticsContent": "This website uses functions of the web analysis service Google Analytics. The provider is Google Ireland Limited. Google Analytics uses so-called \"cookies\". These are text files that are stored on your computer and that allow an analysis of your use of the website.<br><br><strong>IP Anonymization:</strong> We have activated the IP anonymization function on this website. As a result, your IP address will be truncated by Google within member states of the European Union before being transmitted to the USA."
  }
}
```