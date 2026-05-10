# OkounAll

A tiny Tampermonkey userscript for **okoun.cz**.

It adds one button to Okoun favourites / my boards pages:

```text
Otevřít nepřečtené [N]
```

Clicking it opens all clubs with unread posts.

Current version: **0.1.0**

## Install

Install/update directly from here:

[Install OkounAll](https://raw.githubusercontent.com/hanenashi/okounall/main/okounall.user.js)

Tampermonkey should open the install screen automatically. If it only shows plain text, copy the file into a new Tampermonkey userscript manually.

## Supported pages

OkounAll runs on:

```text
https://www.okoun.cz/favourites.jsp*
https://www.okoun.cz/myBoards.jsp*
```

## Behavior

OkounAll looks for unread board links on the page.

The current Okoun favourites markup looks roughly like this:

```html
<div class="item">
  <a class="name" href="/boards/some_board">Some board</a>
  (.../<b><a href="/boards/some_board">18 nových</a></b>)
</div>
```

The script collects links inside `div.item`, prefers unread links inside `<b>`, and avoids opening duplicate URLs.

When clicked:

1. all unread links except the first one open in background tabs
2. the current tab navigates to the first unread club

That keeps the spirit of the original script: your current tab becomes the first unread club, the rest wait in tabs.

## Why this exists

The older script depended on:

```js
// @require http://code.jquery.com/jquery-1.3.min.js
```

That is ancient jQuery over plain HTTP. Modern browsers / userscript managers can block or dislike that. If jQuery fails to load, `$` is undefined and the script simply dies. Very graceful, like a brick in a pond.

OkounAll removes jQuery completely and uses plain modern JavaScript.

## Technical TL;DR

Changed from the older script:

- removed external jQuery dependency
- removed insecure `http://code.jquery.com/...` userscript require
- replaced `$()` selectors with `document.querySelectorAll()`
- uses `@match` instead of old broad `@include`
- uses `new URL(href, location.origin)` for safe absolute URLs
- deduplicates unread links before opening them
- keeps the old behavior: background tabs for all except the first, current tab opens the first
- has more tolerant insertion target fallback: old YUI layout, `.main`, `#body`, then `document.body`
- logs found unread links to console for easier debugging

Still intentionally small. This is a door opener, not a spaceship.

## Credits

Based on the original Okoun idea/script: **Otevři kluby s novými příspěvky**.

This modern no-jQuery rewrite: **OkounAll** by hanenashi.
