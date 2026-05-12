# Základy JavaScriptu

## Zdroje

- [https://developer.mozilla.org](https://developer.mozilla.org/en-US/) – asi nejlepší dokumentace k JS
- [https://www.w3schools.com/](https://www.w3schools.com/) – další velmi dobrá dokumentace
- [https://nodejs.org/dist/latest-v18.x/docs/api/](https://nodejs.org/dist/latest-v18.x/docs/api/) – oficiální dokumentace Node.js
- Google – nejdůležitější schopnost programátora: umět googlit
- ChatGPT – umí zodpovídat otázky, vysvětlovat kód nebo programovat za vás

## Trocha teorie

- JavaScript vytvořil v roce 1995 Brendan Eich za 10 dní.
- Node.js vytvořil Ryan Dahl v roce 2009.
- JavaScript vs. ECMAScript vs. Node.js vs. V8
  - ECMAScript je specifikace.
    - Oracle vlastní ochrannou známku na slovo JavaScript, proto je potřeba jiný název.
  - JavaScript je implementace ECMAScriptu.
  - Node.js je běhové prostředí pro JavaScript.
    - Dalším běhovým prostředím je třeba prohlížeč.
  - V8 je engine (kus kódu) uvnitř běhového prostředí, který JavaScript reálně spouští.
    - Dalším enginem je třeba SpiderMonkey.
- Proč se Node.js stal tak populárním?
  - JavaScript
  - Non-blocking I/O

## Výpis do konzole

```jsx
console.log('Hello, World')
```

## Komentáře

```jsx
// tento řádek kódu je komentář a JavaScript ho ignoruje

/*
Toto je víceřádkový komentář
a JavaScript ignoruje všechny řádky včetně otevíracích a zavíracích tagů
*/
```

## Základní datové typy

### Čísla – number

```jsx
1
0 - 3 + 2 - 0
3.14
10e7
10_000_000
NaN // not a number
Infinity - Infinity
```

### Pravda/lež – boolean

```jsx
true
false
```

### Text – string (řetězec)

```jsx
'hello' // jednoduché uvozovky
"hello" // dvojité uvozovky
`hello` // zpětné uvozovky (backtick)
```

### Chybějící hodnota

```jsx
null
undefined
```

## Proměnné a konstanty

[https://www.w3schools.com/js/js_variables.asp](https://www.w3schools.com/js/js_variables.asp)

```jsx
var age = 26
let height = 195
const name = 'Adam' // konstanta
sexiness = 100

age = 27 // povoleno
height = 196 // povoleno
name = 'Franta' // chyba
```

Pozor při výpisu do konzole:

```jsx
const name = 'Franta'
console.log('name') // vypíše text: name
console.log(name) // vypíše hodnotu proměnné: Franta
```

### Lokální vs. globální proměnné

```jsx
{
  let local = 'local'
  global = 'global'

  console.log(global) // global
  console.log(local) // local
} // zde přestávají existovat všechny lokální proměnné deklarované uvnitř závorek

console.log(global) // global
console.log(local) // ReferenceError: local is not defined
```

### Prohození dvou proměnných

```jsx
let a = 1
let b = 2

let temporary = a
a = b
b = temporary

console.log(a) // 2
console.log(b) // 1
```

## Operátory

[https://www.w3schools.com/js/js_operators.asp](https://www.w3schools.com/js/js_operators.asp)

```jsx
1 + 2 // 3
'a' + 'b' // "ab"
10 - 5 // 5
10 / 3 // 3.3333333333333335
10 % 3 // 1
3 * 3 // 9
3 ** 3 // 27

10 < 5 // false
10 > 5 // true
10 <= 10 // true
10 >= 0 // true

a == b // jsou hodnoty podobné?
a != b // opak
a === b // jsou hodnoty identické?
a !== b // opak

i++
i--
++i
--i

a = b // přiřadí hodnotu 'b' do proměnné 'a'
a += b // přičte hodnotu 'b' k proměnné 'a'
a -= b
a *= b
a /= b
a %= b
a **= b
```

Pozor na nepřesnou aritmetiku:

```jsx
81.82 * 100 // 8181.999999999999
0.1 + 0.2 === 0.3 // false
```

A pár zajímavostí:

```jsx
100 / 0 // Infinity
100 % 0 // NaN
NaN == NaN // false
```

### Logické operátory

```jsx
a && b // 'a' a zároveň 'b'
a || b // 'a' nebo 'b'
!a // negace 'a'
```

### Spojování čísel a řetězců

`+` se snaží převést vše na text. Většina ostatních operátorů převádí spíše na číslo – doporučuji se jim vyhnout.

```jsx
1 + '1' // "11"
1 - '1' // 0
```

Nejlepší je použít template string:

```jsx
const name = 'World'
const message = `Hello, ${name}!` // zpětné uvozovky (backtick)
console.log(message)
```

### Závorky

Pomocí závorek můžeme změnit pořadí vyhodnocování:

```jsx
(2 + 2) * 3 // 12
2 + 2 * 3 // 8
```

## Podmínky

### If

[https://www.w3schools.com/js/js_if_else.asp](https://www.w3schools.com/js/js_if_else.asp)

```jsx
const a = 1
const b = 2

if (a < b) {
  console.log('a is less than b')
} else {
  console.log('a is not less than b')
}
```

```jsx
const something = true

if (something) console.log('something is truthy')
```

```jsx
const something = false
const somethingElse = true

if (something) {
  // Do something
} else if (somethingElse) {
  // Do something else
}
```

### Switch

[https://www.w3schools.com/js/js_switch.asp](https://www.w3schools.com/js/js_switch.asp)

```jsx
const dayOfWeek = 'sunday'

switch (dayOfWeek) {
  case 'monday':
  case 'tuesday':
  case 'wednesday':
  case 'thursday':
  case 'friday':
    console.log('It\'s work time')
    break
  case 'saturday':
  case 'sunday':
    console.log('Yay weekend')
    break
  default:
    console.log('There is no such day!')
    break
}
```

### Ternární operátor

```jsx
const isActive = false

const message = isActive ? 'User is active' : 'User is NOT active'
```

## Cykly

### For

[https://www.w3schools.com/js/js_loop_for.asp](https://www.w3schools.com/js/js_loop_for.asp)

```jsx
for (let i = 0; i < 10; i++) {
  console.log(i)
}
```

Jakýkoliv cyklus je možné předčasně ukončit pomocí slova `break`:

```jsx
for (let i = 0; i < 10; i++) {
  console.log(i)

  if (i === 3) break
}
```

### While

[https://www.w3schools.com/js/js_loop_while.asp](https://www.w3schools.com/js/js_loop_while.asp)

```jsx
let i = 0
while (i < 10) {
  console.log(i)
  i++
}
```

## Funkce a metody

[https://www.w3schools.com/js/js_functions.asp](https://www.w3schools.com/js/js_functions.asp)

```jsx
function greet() {
  console.log('Hello, World!')
}

greet()
```

Funkce mohou mít vstupní parametry a vracet hodnoty:

```jsx
function add(a, b) {
  const c = a + b
  return c
}

const result = add(1, 2)
console.log(result)
```

```jsx
function add(a, b) {
  const soucet = a + b
  const zprava = `Součet a + b je ${soucet}`
  return zprava
  console.log(zprava) // tento řádek se nikdy neprovede
}

const vysledek = add(1, 3)
console.log(vysledek)
```

Funkce je možné zapsat pomocí takzvaného „fat arrow“ zápisu:

```jsx
const greet = () => {
  console.log('Hello, World!')
}

greet()
```

U fat arrow funkce může být vypuštěno slovo return a složené závorky, pokud je na jeden řádek:

```jsx
const add = (a, b) => a + b
console.log(add(1, 2))
```

## Další datové typy

### Pole

```jsx
const array = [1, 2, 'four', 3]

array.push(4) // na konec přidá 4
array[0] // vrátí element na indexu 0 – první element (číslo 1)
array[1] // vrátí element na indexu 1 – druhý element (číslo 2)
array[2] = 4 // zapíše 4 na pozici s indexem 2

const array2 = [1, [2, 3], 4] // pole může obsahovat další pole
```

`.length` vrátí délku pole:

```jsx
const array = ['a', 'b', 'c']
console.log(array.length) // 3

array[array.length] // undefined
array[array.length - 1] // "c"
```

Přes prvky pole lze jednoduše iterovat:

```jsx
const alphabet = ['a', 'b', 'c', 'd', 'e']

for (let character of alphabet) {
  console.log(character)
}
```

Pole mají spoustu pomocných metod:

[https://www.w3schools.com/js/js_array_methods.asp](https://www.w3schools.com/js/js_array_methods.asp)

```jsx
;['🥚', '🐔'].sort()
```

### Objekty

```jsx
const person = {
  firstName: 'Franta',
  lastName: 'Sádlo',
}

console.log(person.firstName)
person.firstName = 'Pepa'
console.log(person['firstName'])

console.log(person.middleName)
person.middleName = 'Mojžíš'
console.log(person.middleName)

console.log(person.firstName + ' ' + person.lastName)
```

Objekt může mít funkce – metody:

```jsx
const person = {
  firstName: 'Franta',
  lastName: 'Sádlo',
  printName: function () {
    console.log(this.firstName + ' ' + this.lastName)
  },
}

person.printName() // Franta Sádlo
```

Pozor na `this`. Ve fat arrow funkcích se chová jinak:

```jsx
const person = {
  firstName: 'Franta',
  lastName: 'Sádlo',
  printName: () => {
    console.log(this.firstName + ' ' + this.lastName)
  },
}

person.printName() // undefined undefined
```

Objekt lze vytvořit pomocí dříve definovaných proměnných:

```jsx
const firstName = 'Franta'
const middleName = 'Mojžíš'
const lastName = 'Sádlo'

const person = {
  givenName: firstName,
  middleName, // Protože se název shoduje, stačí napsat pouze jednou
  familyName: lastName,
}
```

Objekty a pole se dají libovolně zanořovat:

```jsx
const person = {
  firstName: 'Franta',
  lastName: 'Sádlo',
  children: [
    {
      name: 'Pepa',
      age: 6,
    },
    {
      name: 'Lojza',
      age: 13,
    }
  ],
  spouse: {
    firstName: 'Jitka',
  }
}
```

## Zajímavosti pro pokročilé

### Eval – nepoužívat!

```jsx
eval('console.log("Hello, World!")')

const greetMessage = 'Hello, World!'
eval('console.log(greetMessage)')
```

### With – nepoužívat!

```jsx
const obj = { a: 'A' }
with (obj) {
  console.log(a)
}
```

### new Function

```jsx
const add = new Function('a', 'b', 'return a + b')
console.log(add(1, 2))
```

### Svatá trojice (holy trinity)

```jsx
console.log(0 == '0') // true
console.log(0 == []) // true
console.log(0 == '\t') // true

console.log('0' == '\t') // false
console.log('0' == []) // false
console.log([] == '\t') // false
```

### parseInt

```jsx
console.log(parseInt(0.5)) // 0
console.log(parseInt(0.05)) // 0
console.log(parseInt(0.005)) // 0
console.log(parseInt(0.0005)) // 0
console.log(parseInt(0.00005)) // 0
console.log(parseInt(0.000005)) // 0
console.log(parseInt(0.0000005)) // 5
```
