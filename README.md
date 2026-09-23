# Zepe
Turkish consumer meal planning and prepared-meal package experience. React / Vinext, Cloudflare Workers, D1 and platform sign-in.

## Features
- Marley Spoon-inspired subscription configuration at /siparis-olustur: package, duration, meals, snacks and people; live daily and total quote; address, delivery and order review steps; fixed mobile summary.
- Six Zepe packages, filters, pricing estimates, durations, portions, start dates and a persistent cart.
- A personalized seven-day recipe plan, dietary and ingredient exclusions, calorie estimate, energy-matched swaps, family grocery quantities and shopping checklist export.
- Recipe search, filters, details, scaled ingredients and macros, favorites and browser text-to-speech.
- Original nutrition guides with primary-source links, filtering, search, saving and narration.
- Account profiles, address, preferences, weight history, digital plan pause/resume and order draft management.
- Responsive layouts and keyboard-accessible Radix controls.

## Live service boundary
Meal component rates in lib/pricing.ts are illustrative and explicitly labelled estimated. Default complete meal combinations match the published package starting prices. They must be replaced by Zepe-approved meal tariffs before taking commercial orders. Both browser and server totals use the same quote function.
Order drafts are persisted to the private Site's account database. They do not submit a commercial order, charge a payment, reserve a delivery or notify Zepe. Customers can explicitly open WhatsApp with a draft summary and submit it themselves. Zepe's existing public site, customer directory, subscription billing and delivery operations are not integrated. Publishing this Site does not replace zepeapp.com or change its DNS. The source reference scope and asset credits are accessible at /kaynaklar.

## Account data
D1 records are keyed by the platform's stable authenticated user ID. API reads/writes require server-side identity. Writes use schema validation, prepared SQL, size limits, same-origin checks and optimistic version concurrency. Financial totals are recalculated on the server from package prices. No passwords or payment-card data are collected.

## Commands
Use the installed Sites lifecycle scripts for installation, build and publishing. Drizzle schema: db/schema.ts. Generated migrations: drizzle/. Nutritional values are illustrative estimates, not a verified commercial nutrition database.
