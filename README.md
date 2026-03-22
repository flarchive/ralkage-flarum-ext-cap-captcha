# Cap CAPTCHA

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Self-hosted CAPTCHA extension for [Flarum](https://flarum.org) using [Cap](https://capjs.js.org/) — a modern, privacy-focused, proof-of-work CAPTCHA alternative. No image puzzles, no third-party tracking.

## How It Works

Cap uses SHA-256 proof-of-work instead of visual puzzles. When a user clicks the checkbox, their browser performs a computational challenge in the background. No images to identify, no data sent to third parties.

- 250x smaller than hCaptcha (~20KB, zero dependencies)
- Loads in milliseconds
- Fully accessible
- Self-hosted — your data stays on your server

## Features

- **Registration protection** — Cap widget on the sign-up form (enabled by default)
- **Login protection** — Optional Cap widget on the login form
- **Server-side verification** — Tokens verified against your Cap Standalone instance
- **Admin settings** — Configure endpoint, secret key, and which forms to protect
- **Privacy-first** — No telemetry, no tracking, fully self-hosted

## Prerequisites

You need a running Cap Standalone server. The easiest way is Docker:

```yaml
# docker-compose.yml
version: "3.8"
services:
  cap:
    image: tiago2/cap:latest
    container_name: cap
    ports:
      - "3000:3000"
    environment:
      ADMIN_KEY: your_secret_password
    volumes:
      - cap-data:/usr/src/app/.data
    restart: unless-stopped

volumes:
  cap-data:
```

```bash
docker compose up -d
```

Then access `http://localhost:3000`, log in with your admin key, and create a site key.

## Installation

```bash
composer require ralkage/flarum-ext-cap-captcha
php flarum cache:clear
```

Enable the extension in the admin panel under **Extensions > Cap CAPTCHA**.

## Configuration

In the extension settings:

| Setting | Description |
|---|---|
| **Cap API Endpoint** | Your Cap instance URL with site key, e.g. `https://cap.example.com/your-site-key/` |
| **Cap Secret Key** | Your site key's secret from the Cap dashboard |
| **Require CAPTCHA on registration** | Show widget on sign-up form (default: on) |
| **Require CAPTCHA on login** | Show widget on login form (default: off) |

## Requirements

- Flarum `^1.8`
- PHP 8.0+
- A running [Cap Standalone](https://capjs.js.org/guide/standalone/) server

## Links

- [Ralkage](https://ralkage.com)
- [Cap Documentation](https://capjs.js.org/)
- [GitHub](https://github.com/Ralkage/flarum-ext-cap-captcha)

## License

MIT License. See [LICENSE](LICENSE) for details.
