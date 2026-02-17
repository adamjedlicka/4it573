# Databáze, migrace & NPX (Drizzle)

Jako databázi budeme požívat SQLite 

[SQLite Home Page](https://www.sqlite.org/)

A JS knihovnu pro komunikaci s databází využijeme Drizzle 

[Drizzle ORM - next gen TypeScript ORM.](https://orm.drizzle.team/)

Nejprve nainstalujeme knihovnu `drizzle-orm` 

```jsx
npm install drizzle-orm
```

Drizzle je ORM (object-relational mapper) je knihovna která bude náš objektový JS kód převádět na relační jazyk SQL kterému rozumí databáze. Tato knihovna jako samotná komunikovat s databází neumí a proto musím nainstalovat ještě jednu dodatečnou knihovnu.

```jsx
npm install @libsql/client
```

Pro jednoduší práci s drizzle knihovnou při vývoji, drizzle nabízí další knihovnu `drizzle-kit`. Tato knihovna nabízí například grafické rozhraní pro prohlížení dat v databázi nebo příkazy pro vytváření a spouštění migrací. Nainstalujeme ji tedy také.

```jsx
npm install drizzle-kit
```

## Definice schématu databáze

SQLite jako všechny relační databáze vyžadují schéma. Toto schéma se standardně definuje jazykem SQL. My si ho ale necháme od drizzlu vygenerovat. Aby ho drizzle dokázal vygenerovat, musíme ho ale definovat v JavaScriptu. Založíme soubor `src/schema.js` kde ho definujeme.

```jsx
// src/schema.js

import { sqliteTable, int, text } from "drizzle-orm/sqlite-core"

export const todosTable = sqliteTable("todos", {
  id: int().primaryKey({ autoIncrement: true }),
  title: text().notNull(),
  done: int({ mode: "boolean" }).notNull(),
})
 
```

Toto schéma nyní exportuje jedno tabulku nazvanou `todos`. Tato tabulka má tři sloupečky: `id`, `title` a `done`.

Sloupeček `id` bude obsahovat pouze celá čísla `int()`, jedná se o primární klíč (unikátní identifikátor záznamu v datázi) `primaryKey()` a jeho hodnotu si necháme generovat databází `autoIncrement: true` .

Sloupeček `title` je textový `text()` a ne-null-ový `notNull()`.

Sloupeček `done` by ideálně obsahoval boolean-ovskou hodnotu true/false, ale ty SQLite nepodporuje. Definujeme tedy sloupeček jako celé číslo v módu `boolean` - drizzle bude automaticky převádět na true/false a obráceně.

Schéma máme a pomocí `drizzle-kit` z něj můžeme nechat vygenerovat SQL příkazy (migrace) které uvedou databázi do žádaného stavu. Nejprve musíme ale `drizzle-kit` nakonfigurovat.

## Nastavení knihovny drizzle-kit

Pokud chceme používat knihovnu drizzle-kit na správu databáze, musíme ji nejdříve nastavit (například definovat kde se databáze nachází). Tato konfigurace se nachází v souboru `drizzle.config.js` v root adresáži projektu (zde musíme dodržet jak umístění souboru tak jmennou konvenci).

```jsx
// drizzle.coonfig.js

import { defineConfig } from "drizzle-kit"

export default defineConfig({
  dialect: "sqlite",
  schema: "./src/schema.js",
  dbCredentials: {
    url: "file:db.sqlite",
  },
})
```

Tato konfigurace říká knihovně `drizzle-kit` tři věci:

1. `dialect` - Dialekt generovaného SQL - každý typ databáze (SQLite, PostgreSQL, MySQL, …) mají trošičku odlišné SQL.
2. `schema` - kde se nachází soubor s JavaScriptovým zápisem schématu.
3. `dbCredentials` - kde se nachází databáze. [`file:db.sqlite`](file:db.sqlite) znamená že v souboru nazvaným db.sqlite (drizzle si ho vytvoří).

Nyní můžeme vygenerovat migrační SQL soubory:

```jsx
npx drizzle-kit generate
```

Drizzle by měl vytvořit nový adresář nazvaný `drizzle` a v něm `0000_nejaka_slova.sql` - SQL soubor s migrací. Adresář `drizzle/meta` obsahuje dodatečné meta-informace pro drizzle, které nás aktuálně nazajímají.

Pokud chceme migrace aplikovat do databáze provedeme to příkazem

```jsx
npx drizzle-kit migrate 
```

Měl by vzniknout soubor `db.sqlite` obsahující naši databázi.

Obsah databáze můžeme prohlížet a modifikovat aplikací Drizzle Studio kterou spustíme příkazem

```jsx
npx drizzle-kit studio
```

![Drizzle studio](/img/drizzle-studio.png)

## NPX

Určitě jste si všimli, že u posledního příkazu jsme použili příkaz `npx` a ne `npm`. Node.js knihovny mohou vedle zdrojového kódu přibalit malé konzolové aplikace které nám usnadní vývoj - CLI. S těmito CLI interakujeme pomocí příkazu `npm`. Tzn `npx drizzle-kit` spustí CLI dodávané s knihovnou Drizzle. 

## Načítání todos z databáze

Pokud sme si pomocí Drizzle Studio vložili do databáze nějaké testovací todočka, můžeme je nyní načíst v naší aplikaci.

Nejprve vytvoříme spojení do naší databáze:

```jsx
// index.js
// ostatní importy...
import { drizzle } from "drizzle-orm/libsql"

const db = drizzle({
  connection: "file:db.sqlite",
  logger: true,
})
// zbytek aplikace...
```

`connection` musí odkazovat na stejnou databázi jako v `drizzle.config.js`.

`logger` určuje zda má drizzle do konzole vypisovat spuštěné SQL příkazy. Pro lepší pochopení co drizzle dělá na pozadí nechám na `true`.

Nyní můžeme v handleru pro index načít todočka z databáze:

```jsx
// index.js
import { todosTable } from "./src/schema.js"

app.get("/", async (c) => {
  const todos = await db.select().from(todosTable).all()

  const index = await renderFile("views/index.html", {
    title: "My todo app",
    todos,
  })

  return c.html(index)
})
```

Zde přibyl jeden nový import a to definice `todosTable` z našeho schématu - pozor: importujeme soubor a tak nezapomenout na `.js` příponu na konci souboru.

Načítání z databáze je asynchronní operace a tak musíme použít klíčové slovo `await`. `select()` funkce značí, že z databáze chceme načíst data. `from()` funkce určuje z jaké tabulky a `all()` funkce říká, že z tabulky chceme načíst vše.

## Vložení dat do databáze

Nyní upravíme handler pro vytváření nových todoček.

```jsx
// index.js

app.post("/todos", async (c) => {
  const form = await c.req.formData()

  await db.insert(todosTable).values({
    title: form.get("title"),
    done: false,
  })

  return c.redirect("/")
})
```

Databáze nemusíme předávat hodnotu `id` jelikož si ji vygeneruje sama - auto increment.

## Získání jednoho todočka

```jsx
// index.js

import { eq } from "drizzle-orm"

app.get("/todos/:id", async (c) => {
  const id = Number(c.req.param("id"))

  const todo = await await db
    .select()
    .from(todosTable)
    .where(eq(todosTable.id, id))
    .get()

  if (!todo) return c.notFound()

  const detail = await renderFile("views/detail.html", {
    todo,
  })

  return c.html(detail)
})
```

Zde nám opět přibude nový import: `eq` (equals). Získání jednoho todočka má navíc funkci `where()` pomocí které omezujeme jaké todočka chceme z databáze získat. Konkrétně zde je omezení na získání todoček jejich hodnota v sloupečku `todosTable.id` se rovná hodnotě v konstantě `id` . Funkce `get()` na rozdíl od all vrátí pouze jeden záznam který můžeme rovnou uložit do konstanty `todo`.

## Úprava todočka

```jsx
app.post("/todos/:id", async (c) => {
  const id = Number(c.req.param("id"))

  const todo = await db
    .select()
    .from(todosTable)
    .where(eq(todosTable.id, id))
    .get()

  if (!todo) return c.notFound()

  const form = await c.req.formData()

  await db
    .update(todosTable)
    .set({ title: form.get("title") })
    .where(eq(todosTable.id, id))

  return c.redirect(c.req.header("Referer"))
})
```

Pro úpravu dat v databázi využijeme funkci `update()`. Zde pozor - nesmíme zapomenout na omezující funkci `where()` jinak upravíme všechny todočka v databáze, ne pouze to jedno žádané. Funkce `set()` očekává objekt s daty které chceme změnit - nemusíme tedy poslat celé todočko.

## Smazání todočka

```jsx
app.get("/todos/:id/remove", async (c) => {
  const id = Number(c.req.param("id"))

  const todo = await db
    .select()
    .from(todosTable)
    .where(eq(todosTable.id, id))
    .get()

  if (!todo) return c.notFound()

  await db.delete(todosTable).where(eq(todosTable.id, id))

  return c.redirect("/")
})
```

Smazání je jednoduché. Zde opět pozor na nevynechání omezující `where()` podmínky jinak smažeme celou tabulku!
