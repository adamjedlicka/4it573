# NPM + Jednoduchý HTTP server

```jsx
![] // false
// Aha, takže pole je truthy?
[] == true // false
// Aha, takže pole je falsy, akorát jeho negace je divná?
[] ? 'truthy' : 'falsy' // truthy
// dafuq?
```

## NPM

NPM (dříve Node Package Manager) je program (a databáze) pro práci s balíčky a knihovnami pro Node.js. Nový balíček vytvoříme příkazem `npm init`. Průvodce můžeme buď pečlivě vyplnit, nebo přeskákat enterem. Výsledkem je soubor `package.json` popisující náš Node.js balíček.

### package.json

```json
{
  "name": "my-app",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "",
  "license": "ISC"
}
```

Pokud chceme používat ES Moduly (`import fs from 'fs/promises'`) místo CommonJS (`const fs = require('fs/promises')`) a zároveň mít soubory s příponou `.js` místo `.mjs`, přidáme do `package.json` atribut `"type": "module"`. 

#### main

Specifikuje název vstupního souboru, který bychom měli (ale nemusíme) dodržet. Vytvoříme tedy `index.js`.

```jsx
// index.js
console.log('Hello, World!')
```

#### scripts

Je seznam skriptů, které můžeme přes NPM spouštět.

```bash
npm run test

# > my-app@1.0.0 test
# > echo "Error: no test specified\" && exit 1

# Error: no test specified
```

Obvyklé je mít skripty jako `start`, `dev`, `prod` pro spouštění aplikace v různých prostředích.

```json
{
  "scripts": {
    "dev": "node index.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  } 
}
```

```bash
npm run dev

# > my-app@1.0.0 dev
# > my-app@1.0.0 dev

# Hello, World!
```

### Instalace nových balíčků

Vyhledávat balíčky můžeme na stránkách NPM – [https://www.npmjs.com/](https://www.npmjs.com/) a následně je nainstalujeme příkazem `npm install <název balíčku>`. Pro ukázku nainstalujeme balíček, který nám umožní obarvit text vypisovaný do konzole – `chalk` ([https://www.npmjs.com/package/chalk](https://www.npmjs.com/package/chalk)).

```bash
npm install chalk
```

Změny se promítnou do `package.json` + vznikne soubor `package-lock.json`, kde jsou uzamknuté konkrétní verze nainstalovaných balíčků – tento lock soubor nikdy manuálně neupravujeme!

```json
{
  "dependencies": {
    "chalk": "^5.0.0"
  }
}
```

Nyní můžeme balíček `chalk` použít v kódu.

```jsx
import chalk from 'chalk'

console.log(chalk.green('Hello, World!'))
```

Nainstalované balíčky najdeme v adresáři `node_modules`.

![Heaviest objects in the universe](/img/heaviest-objects-in-the-universe.png)

## Jednoduchý HTTP server

[HTTP | Node.js v17.6.0 Documentation](https://nodejs.org/api/http.html)

```jsx
import http from 'http'
import chalk from 'chalk'

const port = 3000

const server = http.createServer((req, res) => {
  console.log('request')
  console.log('  url', req.url)
  console.log('  method', req.method)

  const name = req.url.slice(1) || 'World'

  res.statusCode = 200 // OK
  res.setHeader('Content-Type', 'text/html')
  res.write(`<h1>Hello, ${name}!<h1>`)
  res.end()
})

server.listen(port, () => {
  console.log(chalk.green(`Server listening at http://localhost:${port}`))
})
```

### http.createServer

[https://nodejs.org/api/http.html#httpcreateserveroptions-requestlistener](https://nodejs.org/api/http.html#httpcreateserveroptions-requestlistener)

Vytvoří server. Jako argument bere funkci, která bude zpracovávat jednotlivá připojení.

### server.listen

[https://nodejs.org/api/http.html#serverlisten](https://nodejs.org/api/http.html#serverlisten)

Začne poslouchat na daném portu. Callback je zavolán, jakmile se server úspěšně na port připojí a začne poslouchat – server neposlouchá ihned po zavolání metody `.listen`.

### req

[https://nodejs.org/api/http.html#class-httpclientrequest](https://nodejs.org/api/http.html#class-httpclientrequest)

Objekt obsahující požadavek od uživatele. Obsahuje vyžádanou URL, IP adresu, cookies, user agenta (identifikace prohlížeče) atd.

### res

[https://nodejs.org/api/http.html#class-httpserverresponse](https://nodejs.org/api/http.html#class-httpserverresponse)

Objekt reprezentující odpověď serveru. Má spoustu užitečných metod. Voláním `res.end()` považujeme odpověď za finální a server ukončí spojení.

#### res.statusCode

Nastavuje stavový kód odpovědi. Mezi nejčastější patří 200 – OK, 404 – Not found a různé 5XX pro chyby serveru.

![HTTP statuses](/img/http-statuses.png)

#### res.setHeader

Nastaví HTTP hlavičku. HTTP hlaviček je nepřeberné množství – [https://en.wikipedia.org/wiki/List_of_HTTP_header_fields](https://en.wikipedia.org/wiki/List_of_HTTP_header_fields). Doporučuji si aspoň zapamatovat `Content-Type`, která určuje typ odpovědi (HTML, JSON, JavaScript, JPG...), a `Set-Cookie`, která říká prohlížeči, jaké cookies by měl uložit.

#### res.write

Odešle na klienta (prohlížeč) data, ale neukončí spojení. Vhodné, pokud už máme část dat, ale čekáme na zbytek.

## Nodemon

Protože je server dlouhotrvající proces, musíme po každé změně zdrojového kódu zastavit Node.js a pustit skript znovu. Toto restartování umí zautomatizovat balíček `nodemon` ([https://www.npmjs.com/package/nodemon](https://www.npmjs.com/package/nodemon)). Jelikož ho budeme potřebovat pouze při vývoji, nainstalujeme ho jako `devDependency` a přidáme do seznamu skriptů.

```bash
npm install --save-dev nodemon
```

Výsek změněného `package.json`:

```json
{
  "scripts": {
    "dev": "nodemon index.js",
    "start": "node index.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "dependencies": {
    "chalk": "^5.0.0"
  },
  "devDependencies": {
    "nodemon": "^2.0.15"
  }
}
```

Spustíme server:

```bash
npm run dev
```

Při změně zdrojových souborů se nyní server automaticky restartuje.

## Samostatná práce

### Přečtení index.html ze souboru

Vedle souboru index.js bude i index.html s libovolným HTML obsahem. Server bude po nastartování odpovídat na každý požadavek obsahem tohoto souboru.

#### Řešení

[Přečtení index.html ze souboru](https://www.notion.so/P-e-ten-index-html-ze-souboru-4910b979683841b0b28b36d1d76aea2c?pvs=21)

### Servírování statických souborů z public adresáře

Vedle souboru index.js bude adresář public s libovolným obsahem (HTML soubory, obrázky...). Server bude odesílat tyto soubory na základě URL z requestu. Pokud tedy uživatel zadá URL `/about.html`, dostane soubor `public/about.html` a tak podobně.

#### Řešení

[Servírování statických souborů z public adresáře](https://www.notion.so/Serv-rov-n-statick-ch-soubor-z-public-adres-e-3424bb817a854d8d8195a167a5c62ba2?pvs=21)

## Pro pokročilé

### Blokující vs. neblokující kód

Proveďte zároveň dva dotazy ze dvou různých prohlížečů a podívejte se, kdy je Node.js schopen přijmout oba požadavky a kdy pouze jeden.

```jsx
import http from 'http'

const port = 3000

const server = http.createServer(async (req, res) => {
  if (req.url === '/favicon.ico') return res.end()

  console.log('Accepting connection')

  blockingSleep(5000)
  // await nonBlockingSleep(5000)

  res.end('Hello, World!')
})

server.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`)
})

function blockingSleep(delay) {
  let stop = new Date().getTime() + delay
  while (new Date().getTime() < stop) {}
}

function nonBlockingSleep(delay) {
  return new Promise((resolve) => setTimeout(resolve, delay))
}
```
