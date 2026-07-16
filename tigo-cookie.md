# Proč Esův skript dřív fungoval a teď ne

Esův skript má tuto závislost:

```text
Esův skript → jQuery 3.3.1 → jquery-cookie 1.4.1 → $.cookie
```

Chyba `TypeError: $.cookie is not a function` znamená, že jQuery se načetlo,
ale knihovna `jquery-cookie` se tentokrát nepřipojila. Skript pak spadne při
čtení uloženého seznamu ještě před vytvořením hvězdiček.

Proto mohl skript dlouho fungovat a po aktualizaci Firefoxu, Tampermonkey,
cache nebo změně síťového/CDN načítání přestat fungovat, aniž se změnil jeho
hlavní kód. Nejde o poškození uložených oblíbených klubů.

## Co zkusit

1. Dočasně vypnout skript.
2. Skript znovu nainstalovat přímo z Greasy Forku, ne jen aktualizovat starou kopii.
3. V Tampermonkey případně vymazat cache externích zdrojů skriptu.
4. Obnovit stránku `https://www.okoun.cz/fav/topics`.

Pokud se chyba `$.cookie` vrátí, je problém v načítání závislosti v daném
Firefoxu/Tampermonkey. Dočasná opravená verze z OkounAll nepoužívá jQuery ani
`jquery-cookie`, čte stejnou cookie nativně a proto v tomto prostředí funguje.

Při testování má být zapnutá pouze jedna verze skriptu. Současné spuštění
Esovy a temporary verze může vést k dvojím handlerům, dvěma překreslením a
zdánlivě nefunkčnímu kliknutí.
