# Miami Heat - Hydrogen Video Components

This repository contains a Shopify Hydrogen implementation for the Miami Heat theme, featuring custom video components converted from Liquid sections.

## 🎥 Custom Components

This project includes two powerful video components:

- **VideoBanner**: Video.js-powered banner with API integration and HLS support
- **MyStuff**: Video collection manager with localStorage persistence

[See detailed component documentation](HYDROGEN_CONVERSION_README.md)

## 🚀 Quick Start

**Requirements:**

- Node.js version 18.0.0 or higher

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Visit demo page
open http://localhost:3000/video-demo
```

## 🔧 Hydrogen Framework

This is built on Shopify's Hydrogen framework - a stack for headless commerce designed to work with [Remix](https://remix.run/).

[Check out Hydrogen docs](https://shopify.dev/custom-storefronts/hydrogen)
[Get familiar with Remix](https://remix.run/docs/en/v1)

## What's included

- Remix
- Hydrogen
- Oxygen
- Shopify CLI
- ESLint
- Prettier
- GraphQL generator
- TypeScript and JavaScript flavors
- Tailwind CSS (via PostCSS)
- Custom Video Components (VideoBanner + MyStuff)
- Video.js integration with HLS support

## Building for production

```bash
npm run build
```

## Local development

```bash
npm run dev
```

## Setup for using Customer Account API (`/account` section)

### Setup public domain using ngrok

1. Setup a [ngrok](https://ngrok.com/) account and add a permanent domain (ie. `https://<your-ngrok-domain>.app`).
1. Install the [ngrok CLI](https://ngrok.com/download) to use in terminal
1. Start ngrok using `ngrok http --domain=<your-ngrok-domain>.app 3000`

### Include public domain in Customer Account API settings

1. Go to your Shopify admin => `Hydrogen` or `Headless` app/channel => Customer Account API => Application setup
1. Edit `Callback URI(s)` to include `https://<your-ngrok-domain>.app/account/authorize`
1. Edit `Javascript origin(s)` to include your public domain `https://<your-ngrok-domain>.app` or keep it blank
1. Edit `Logout URI` to include your public domain `https://<your-ngrok-domain>.app` or keep it blank

## 📖 Video Components Documentation

For detailed information about the custom video components, see [HYDROGEN_CONVERSION_README.md](HYDROGEN_CONVERSION_README.md).
