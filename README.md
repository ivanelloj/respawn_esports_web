# Respawn Gaming — Esports Lounge (Static Site)

A single-page, futuristic website for Respawn Gaming with zones, EUR pricing, games, booking (LanGame/WhatsApp), food & drinks, app banners, and a dark/light theme.

## Quick Start
- Open `index.html` in your browser.
- Optional local server: `python -m http.server 8000` or `npx http-server`.

## Customize
- Branding: replace `logo.svg` and edit colors in `styles.css` (`:root`).
- Pricing: edit `#pricing` cards in `index.html` (EUR 1h/3h/5h).
- Zones: update specs in `#zones`.
- Booking: set real App Store/Google Play and WhatsApp links in `#apps` and buttons.
- Location: replace the Google Maps `iframe` `src` with your embed URL.
- Games: add/remove list in `#games`.

## Features
- Blue/black neon theme, dark/light toggle (saved to localStorage)
- Animated canvas background (reduced-motion supported)
- Responsive layout, scroll reveal, smooth scroll
- Booking modals, contact form validation
- App banners and WhatsApp quick link

Inspiration: https://dpmn.ae/
