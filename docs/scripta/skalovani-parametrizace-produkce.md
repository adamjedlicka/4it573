# Škálování, parametrizace & produkce

> Tyto témata nejsou vyžadována u semestrální práce. Jedná se o bonusová témata pro nadšence.

## Škálování

Jelikož Node.js spouští JavaScript pouze v jednom vlákně (jde obejít přes `child_process` - [https://nodejs.org/api/child_process.html](https://nodejs.org/api/child_process.html)), na několika-jádrovém procesu nevyužije Node.js jeho plný potenciál. Řešením je nastartování více procesů Node.js zároveň, v každém běží kopie naší aplikace a požadavky mezi jednotlivé instance rozhazuje nějaký load balancer - [https://en.wikipedia.org/wiki/Load_balancing_(computing)](https://en.wikipedia.org/wiki/Load_balancing_(computing)). “Správné” řešení by využít Docker, DockerCompose, Kubernetes nebo podobné šílenosti. To je ale na nás zbytečně komplikované. Pro Node.js existuje velmi jednoduchá knihovna PM2, která nám pomůže se provozem aplikace na více procesech zároveň.

[pm2](https://www.npmjs.com/package/pm2)

Dokumentace nám radí nainstalovat knihovnu takto:

```jsx
npm install pm2 -g
```

Přepínač `-g` způsobí, že se knihovna nenainstaluje do našeho projektu ale do celého počítače. To má tu výhodu, že PM2 je dostupná ve všech projektech bez další instalace. Má to ale i spoustu nevýhod (musíme instalovat extra na každém počítači, není možné aby různé projekty používali různé verze, ...) a tak PM2 nainstalujeme klasickým způsobem.

```jsx
npm install pm2
```

PM2 používá konfigurační soubor, který můžeme vygenerovat následně:

```jsx
npx pm2 init simple
```

PM2 vygeneruje `ecosystem.config.js`. Protože jsme ale v ESM (EcmaScript modules), a PM2 vyřaduje CJS (CommonJS), změníme příponu na `.cjs` - `ecosystem.config.cjs`.

V konfiguračním souboru změníme hodnotu klíče script, která PM2 říká, jaký soubor ma spustit. Z `app.js` změníme na náš `index.js`. Dále budeme chtít aby PM2 vytvořila více instancí naší aplikace. Jelikož chceme využít výkonu počítače na max, chceme aby PM2 vytvořila stejný počet instancí jako je počet jader procesoru. To uděláme takto: `instances: 'max'` popř. místo `'max'` můžeme zvolit číslo reprezentující počet instancí. Výsledný soubor by měl vypadat nějak takto:

```jsx
// ecosystem.config.cjs
module.exports = {
  apps: [
    {
      name: 'app1',
      script: './index.js',
      instances: 'max',
    },
  ],
}
```

Nyní potřebujeme upravit náš start script v package.json. PM2 navíc spustí všechny procesy v pozadí a tak není možné aplikaci zastavit přes Ctrl+C v terminálu. Přidáme i stop script.

```jsx
// package.json
...
"scripts": {
  "start": "pm2 start ecosystem.config.cjs",
  "stop": "pm2 stop ecosystem.config.cjs",
  ...
},
...
```

Naši aplikaci nyní pouštíme pomocí `npm run start` a zastavujeme pomocí `npm run stop`. `npm run dev` zůstává a budeme ho používat pro vývoj. PM2 je pouze do produkce.

PM2 má i spoustu dalších zajímavých příkazů jako např. `npx pm2 monit` pomocí kterého můžeme monitorovat běžící aplikaci (logy, CPU & RAM vytížení, ...).

Tento způsob škálování přes PM2 je relativně jednoduchý, ale velmi efektivní a není problém ho použít i pro velké weby. Samozřejmě se nemůže rovnat řešením postaveným na Dockerem, ale ty s sebou nesou komplexitu, kterou s PM2 nemusíme řešit.

## Parametrizace

Než nasadíme naši aplikaci do produkce, budeme muset udělat ještě jednu věc. A tou je parametrizace. I přesto, že kód aplikace bude stejný jak u nás na notebooku tak na serveru produkce, budeme chtít pár věcí upravit. Jedna z nich by mohla být databáze. Pro lokální vývoj používáme SQLite, ale v produkci by jsme chtěli nějakou robustnější databází - např. MySQL. U této aplikace si vystačíme se SQLite i v produkci. Budeme chtít ale změnit port na kterém aplikace běží. Při lokálním vývoji nám běží na nějakém portu pro který nejsou potřeba administrátorská práva (3000). Na produkčním serveru budeme chtít aplikaci provozovat na standardním HTTP portu 80.

Podobných parametrů bývá více. Budeme je chtít někde uchovávat. Jedno z vhodných a často používaných míst jsou proměnné prostředí (environment variables). Proměnné prostředí je možné předat programu při jeho spuštění - `APP_PORT=80 node index.js`. Pokud by jsme podobných parametrů měli více, bylo by to nepřehledné a tak je místo toho uložíme do speciálního `.env` souboru v kořenovém adresáři projektu.

```jsx
APP_PORT=80
```

Node.js bohužel tento soubor nečte automaticky a tak musíme využít knihovnu `dotenv`

[dotenv](https://www.npmjs.com/package/dotenv)

```jsx
npm install dotenv
```

Začátek `index.js` upravíme následovně:

```jsx
import 'dotenv/config'
import { app } from './src/app.js'
import { createWebSocketServer } from './src/websockets.js'

const port = process.env.APP_PORT || 3000
```

`import 'dotenv/config'` nám přečte konfigurační soubor `.env` jehož hodnoty můžeme následně číst pomocí `process.env` objektu - zde `process.env.APP_PORT` jelikož v `.env` máme `APP_PORT=80`.

`.env` soubor se obvykle necommituje do Gitu aby bylo možné ho upravit bez konfliktů. Je ale dobrým zvykem přidat např. `.env.sample` jako ukázku/defautlní `.env` soubor, který si uživatel před spuštěním aplikace vykopíruje do `.env`.

## Produkce

Pro nasazení do produkce budeme potřebovat server. Já rád používám DigitalOcean, díky svojí jednoduchosti používání a nízké ceně. Samozřejmě je Node.js aplikace je možné nasadit kamkoliv.

[DigitalOcean - The developer cloud](https://www.digitalocean.com/)

Po vytvoření účtu můžeme vytvořit nový server pomocí Create → Droplets (tak DigitalOcean nazývá servery).

Jako OS zvolím Ubuntu díky své rozšířenosti.

Abych zbytečně neplatil velké peníze za provoz serveru, zvolím nejlevnější konfiguraci.

Block storage můžeme vynechat a lokaci serveru zvolíme některou poblíž naší reálné lokaci. Např. Frankfurt.

Následně je nutné zvolit způsob přihlašování na server. Přihlašování pomocí veřejného SSH klíče který obvykle naleznete na `~/.ssh/id_rsa.pub` je preferované. 

Pokud veřejný SSH klíč nemáte, DigitalOcean má krátký tutoriál na pravé straně okna jak si nový SSH klíč vygenerovat.

Ostatní možnosti nás už nezajímají a pomocí Create Droplet můžeme vytvořit server.

Po chvilce by jsme měli vidět náš vytvořený server.

Pokud si ho rozklikneme, vidíme detaily a vpravo nahoře pomocí tlačítka console se můžeme přihlásit na server.

Pomocí dvou příkazů `apt update` a `apt upgrade` aktualizujeme server. Dále pomocí příkazu `apt install build-essential` nainstalujeme knihovny, které Node.js občas potřebuje k instalaci knihoven, které máme v `package.json`.

Jelikož Ubuntu poskytuje často starý software a my potřebujeme specifickou verzi Node.js (verzi 16), doporučuji nainstalovat Node.js pomocí NVM - Node version manager. Jedná se o jednoduchý program který nám umožňuje instalovat a spravovat různé verze Node.js.

[How To Install NVM on Ubuntu 20.04](https://tecadmin.net/how-to-install-nvm-on-ubuntu-20-04/)

Instalace je jednoduchá. Pouze dva příkazy:

```jsx
curl https://raw.githubusercontent.com/creationix/nvm/master/install.sh | bash
```

a

```jsx
source ~/.profile
```

Nyní můžeme nainstalovat požadovanou verzi Node.js:

```jsx
nvm install 16
```

Nyní můžeme stáhnout na server naši aplikaci a nainstalovat ji. Ja ke stažení využiji Git, ale je možné aplikaci na server dostat libovolným způsobem (zip soubor).

```jsx
git clone https://github.com/adamjedlicka/node-todos.git
cd node-todos
npm install
```

Vytvoříme `.env` soubor s `APP_PORT=80` - např. pomocí `nano .env`

Spustíme migrace pomocí `npx knex migrate:latest`

Spustíme aplikaci pomocí `npm run start`

A na IP adrese kterou najdeme vlevo nahoře na obrazovce detailu serveru by nám měla běžet aplikace.

Nefungují nám ale WebSockety. To je tím, že v `detail.ejs` a `index.ejs` se odkazujeme na localhost. Místo localhostu tam potřebujeme dostat adresu serveru. A tak si ji přidáme do `.env`

```jsx
APP_PORT=80
APP_URL=165.227.151.105
```

A takto bude vypadat `.env` na našem lokálním počítači:

```jsx
APP_PORT=3000
APP_URL=localhost:3000
```

Nyní v `src/app.js` uložíme `APP_URL` do express lokálním proměnných aby k nim měl přístup EJS

```jsx
// src/app.js
export const app = express()

app.set('view engine', 'ejs')

app.locals.appUrl = process.env.APP_URL
```

A upravíme `views/index.ejs` a `views/detail.ejs`:

```jsx
const ws = new WebSocket('ws://<%= appUrl %>')
```

Dostaneme zastavíme starou aplikaci `npm run stop`, aktualizujeme zdrojový kód (např. pomocí Gitu) a nastartujeme novou verzi `npm runs start`. WebSockety by měli fungovat.

Pokud už nebudeme chtít server na DigitalOcean používat, odstraníme ho, aby jsme zbytečně neutráceli peníze.
