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

## Úkol č. 4

Vytvořte server, který po navštívení `/` cesty vrátí prohlížeči obsah souboru `index.html`. Po navštívení jakékoliv jiné cesty, například (`/test.txt`), se server podívá jestli v adresáři `public` existuje soubor s daným jménem (v tomto případě `test.txt`), pokud ano, vrátí ho prohlížeči a pokud ne vrátí prohlížeči obsah souboru `404.html` a nastaví správný návratový HTTP status kód. Server předem neví obsah adresáře public - za běhu serveru musí jít do adresáře přidat nový soubor a server ho musí být schopen vrátit bez toho aby sme server restartovali.

Pokud chcete získat tři body, server musí být schopen z adresáře `public` vracet prohlížeči i jiné, než jen textové soubory (například i obrázky).

## Úkol č. 5

Do vaší Todo aplikace (můžete vycházet i z mojí verze) vytvořte stránku s detailem jednoho todočka. Tato stránku se bude nacházet pod URL `/todo/:id` a na stránce bude vidět titulek todočka a zda je hotové či ne. Dále zde budou odkazy na změnu stavu todočka, odstránění todočka a formulář na změnu titulku todočka. Na tuto stránku se dostanete kliknutím na titulek todočka na hlavní stránce se seznamem všech todoček.

## Úkol č. 6

Do vaší Todo aplikace (můžete vycházet i z mojí verze) přidejte novou migraci přidávající nový sloupeček do tabulky todos - například priority, enum (výčet možností) s možnostmi normal, low a high. Pozor, neupravujte stávající migraci. Zároveň tento nový sloupeček nějak zobrazte na seznamu todoček, na detailu todočka a umožňěte ho upravovat z detailu todočka (buďto pomocí nového formuláře nebo rozšiřte již existující formulář na úpravu titulku).

## Úkol č. 7

Doplňte do všech vhodných route handlerů odesílání listu todoček přes websockety + implementujte odesílání detailu todočka přes websockety. Detail todočka se bude odesílat vždy při změně todočka. Příklad: v jednom okně prohlížeče otevřu detail todočka A a ve druhém okně prohlížeče todočko A přejmenuju na todočko B. V prvním okně prohlížeče se mi musí změna automaticky projevit. Pozor: změna todočka může probíhat jak z detailu todočka tak i listu todoček + pokud změním todočko C, nesmím přepsat stránku s detailem jiného todočka. Pokud změnu provedu z detailu todočka, budu tedy odesílat dva eventy. Jeden pro detail daného todočka a druhý pro list todoček.

Bonusový bod: vyřešte mazání todoček. Například když mám v prohlížeči otevřená detail s todočkem, které z jiného prohlížeče smažu, v prvním prohlížeči se mi místo detailu todočka objeví hláška s informací, že todočko bylo smazáno.
