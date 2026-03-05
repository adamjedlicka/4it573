# Domácí úkoly

Domácí úkoly ideálně odevzdávejte pomocí služby GitHub (nebo jiné podobné platformy typu Git), ve které si vytvoříte veřejný repozitář. Ten mi nasdílíte a během semestru do něj budete nahrávat svoji práci. Pokud si nechcete vytvářet účet na GitHubu, můžete mi jednotlivé úkoly posílat jako zazipované soubory.

Domácí úkoly nemají daný termín odevzdání. Teoreticky je jedno, kdy je odevzdáte. Prakticky je možné, že za pozdně odevzdaný úkol nedostanete plný počet bodů v závislosti na tom, zda řešení úkolu bylo ukázáno na některém z cvičení.

## Úkol č. 1

Vytvořte program, který bude s uživatelem hrát hru „hádej číslo, které si myslím“. Program si na začátku vygeneruje náhodné číslo od 0 do 10 a následně se uživatele zeptá na jeho tip. Pokud se uživatel trefí, program mu to oznámí a ukončí se. Pokud se netrefí, program uživateli oznámí, zda byl tip větší, či menší než hádané číslo, a zeptá se na další tip. Pokud se uživatel netrefí ani po pěti pokusech, program ho informuje o prohře a ukončí se.

Program spouštějte v konzoli prohlížeče. Pro generování čísla použijte funkci `Math.random()` (její výstup budete muset ještě zpracovat) a pro načítání uživatelova tipu použijte funkci `prompt()`. Doporučuji využít dokumentaci nebo AI ke zjištění více informací ohledně těchto funkcí.

## Úkol č. 2

Vytvořte program, který bude kopírovat obsah souboru do druhého souboru na základě jednoduchých instrukcí. Při spuštění si program načte obsah souboru s názvem „instrukce.txt“. V tomto souboru budou uloženy dva názvy souborů. První název označuje zdrojový soubor (ze kterého bude program kopírovat data) a druhý název označuje cílový soubor, do kterého bude program data kopírovat. Soubor „instrukce.txt“ a zdrojový soubor musí existovat; pokud neexistují, program o tom informuje uživatele. Pokud neexistuje cílový soubor, program ho nejprve vytvoří a pak do něj nakopíruje data. Formát instrukcí nechám na vás.

### Příklad

Obsah souboru instrukce.txt: vstup.txt vystup.txt

Obsah souboru vstup.txt: lorem ipsum dolor sit amet

Spustím program pomocí: `node index.mjs`

Výsledek: Vznikne soubor vystup.txt s obsahem lorem ipsum dolor sit amet.

## Úkol č. 3

Pomocí modulu `fs/promises` a klíčových slov `async` a `await` napište následující program:

Program nejprve přečte obsah souboru „instrukce.txt“, ve kterém bude číslo (například 10). Následně program vytvoří n souborů (kde n se rovná číslu ze souboru instrukce.txt) s názvy 0.txt, 1.txt, 2.txt až n.txt a obsahem „Soubor 0“, „Soubor 1“, „Soubor 2“ až „Soubor n“. Poté, co budou všechny soubory úspěšně vytvořeny, vypíše program informativní hlášku do konzole a skončí. Základní program za 2 body může být sériový.

Pokročilejší program za 3 body musí využít „paralelizaci“ pomocí `Promise.all`.
