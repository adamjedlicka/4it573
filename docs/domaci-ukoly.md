# Domácí úkoly

## Úkol č. 1

Vytvořte program, který bude s uživatelem hrát hru “hádej číslo, které si myslím”. Program si na začátku vygeneruje náhodné číslo od 0 do 10 a následně se uživatele zeptá na jeho tip. Pokud se uživatel trefí, program mu to oznámí a ukončí se. Pokud se netrefí, program uživateli oznámí zda byl tip větší či menší než hádané číslo a zeptá se uživatele na další tip. Pokud se uživatel netrefí ani po pěti pokusech, program ho informuje o prohře a ukončí se.

Program spouštějte v konzoli prohlížeče. Pro generování čísla použijte funkci `Math.random()` (její výstup budete muset ještě nějak zpracovat) a pro načítání uživatelova tipu použijte funkci `prompt()`. Doporučuji použít dokumentaci nebo AI na zjištění více informací ohledně těchto funkcí.

## Úkol č. 2

Vytvořte program, který bude kopírovat obsah souboru do druhého souboru na základě jednoduchých instrukcí. Při spuštění si program načte obsah souboru s názvem "instrukce.txt". V tomto souboru budou uloženy dva názvy souborů. První název označuje zdrojový soubor (ze kterého bude program kopírovat data) a druhý název označuje cílový soubor do kterého bude program data kopírovat. Soubor "instrukce.txt" a zdrojový soubor musí existovat, pokud neexistují, program o tom informuje uživatele. Pokud neexistuje cílový soubor, program ho nejprve vytvoří a pak do něj nakopíruje data. Formát instrukcí nechám na vás.

Příklad:

Obsahu souboru instrukce.txt: "vstup.txt vystup.txt"
Obsah souboru vstup.txt: "lorem ipsum dolor sit amet"
Spustim program pomoci "node index.mjs"
Vznikne soubor vystup.txt s obsahem "lorem ipsum dolor sit amet"
