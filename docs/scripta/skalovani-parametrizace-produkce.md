# Škálování, parametrizace & produkce

> Tato témata nejsou vyžadována u semestrální práce. Jedná se o bonusová témata pro nadšence.

## Škálování

Jelikož Node.js spouští JavaScript pouze v jednom vlákně, nevyužije na vícejádrovém procesoru jeho plný potenciál automaticky. Řešením je nastartování více procesů zároveň, přičemž požadavky mezi ně rozděluje load balancer. Pro Node.js existuje jednoduchá knihovna `pm2`, která nám s tímto pomůže.

[pm2](https://www.npmjs.com/package/pm2)

Nainstalujeme ji do projektu:

```bash
npm install pm2
```

Vytvoříme konfigurační soubor `ecosystem.config.cjs`:

```jsx
module.exports = {
  apps: [{
    name: 'app1',
    script: './index.js',
    instances: 'max', // vytvoří tolik instancí, kolik má CPU jader
  }],
}
```

V `package.json` přidáme skripty pro start a stop:

```json
"scripts": {
  "start": "pm2 start ecosystem.config.cjs",
  "stop": "pm2 stop ecosystem.config.cjs"
}
```

PM2 spustí procesy v pozadí. Jejich stav můžeme sledovat pomocí `npx pm2 monit`.

## Parametrizace

Před nasazením do produkce budeme chtít upravit některé parametry, jako je port nebo URL, aniž bychom měnili kód. K tomu využijeme proměnné prostředí uložené v souboru `.env`.

```jsx
APP_PORT=80
APP_URL=mojeaplikace.cz
```

Pro načtení těchto hodnot v Node.js použijeme knihovnu `dotenv`:

```bash
npm install dotenv
```

V `index.js` pak načteme konfiguraci:

```jsx
import 'dotenv/config'
const port = process.env.APP_PORT || 3000
```

Soubor `.env` by se neměl commitovat do Gitu, místo něj vytvořte `.env.sample` jako vzor.

## Produkce

Pro nasazení můžete využít například DigitalOcean. Na serveru (Ubuntu) nainstalujete Node.js (doporučujeme přes NVM – Node Version Manager), stáhnete kód (např. přes Git), nainstalujete závislosti a spustíte aplikaci pomocí PM2.

```bash
npm install
npx knex migrate:latest
npm run start
```

Pokud používáte WebSockety, nezapomeňte v `.env` nastavit správnou `APP_URL`, aby se klient v prohlížeči mohl připojit na správnou adresu serveru místo localhostu.

Až nebudete chtít server používat, nezapomeňte jej smazat, abyste zbytečně neplatili za jeho provoz.
