# **App Name**: Cochem-Taxi.de

## Core Features:

- Hero Call-to-Action: Prominent, high-contrast 'TAXI RUFEN (Cochem)' button linking directly to the phone dialer.
- Fare Calculator: Embedded fare calculator using OpenStreetMap, Leaflet.js, and OSRM (or GraphHopper) for distance calculation. Includes input fields for 'Startadresse' and 'Zieladresse'.
- Distance Calculation API: Utilize OSRM/GraphHopper to calculate distance between provided addresses, adhering to cost constraints. Provides distance to the fare calculator logic.
- Estimated Price Output: Displays the calculated fare with the disclaimer 'Ungefährer Preis' (Estimated Price), using the formula (Distance_KM * Rate_Per_KM) + Base_Fee.
- About Us Section: Brief 'About Us' paragraph highlighting Taxco AG's local Cochem service, focusing on reliability, speed, and transfers to key locations (e.g., train station, castle).
- Mobile-First Layout: Page layout will be fully responsive, optimizing primarily for mobile viewport sizes.

## Style Guidelines:

- Primary color: Deep sky blue (#00BFFF) for a sense of trust and reliability. This evokes clear skies and safe travels.
- Background color: Very light gray (#F0F0F0) to ensure readability and a clean look in the light scheme.
- Accent color: Vivid orange (#FFA500) to draw attention to the call-to-action button and fare calculation results.
- Font: 'Inter' (sans-serif) for both headlines and body text due to its modern and readable qualities.
- The layout prioritizes the CTA button at the top of the screen. The fare calculator is placed immediately below it, and all content is single column to work well in small viewports.
- Simple, recognizable icons (e.g., a taxi icon) will enhance usability in the fare calculator and navigation.
- Subtle animations, such as a gentle fade-in for the calculated fare, can provide positive feedback to the user.