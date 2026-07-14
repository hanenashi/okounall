# OkounAll

A tiny Tampermonkey userscript for **okoun.cz**.

It adds one button to Okoun pages that list clubs with unread posts:

```text
Otevřít nepřečtené [N]
```

Clicking it opens all clubs with unread posts.

Current version: **0.2.3**

## Install

Install/update directly from here:

[Install OkounAll](https://raw.githubusercontent.com/hanenashi/okounall/main/okounall.user.js)

Tampermonkey should open the install screen automatically. If it only shows plain text, copy the file into a new Tampermonkey userscript manually.

## Supported pages

OkounAll runs on:

```text
https://www.okoun.cz/favourites.jsp*
https://www.okoun.cz/fav/topics*
https://www.okoun.cz/myBoards.jsp*
https://www.okoun.cz/topic.jsp*
https://www.okoun.cz/topics/*
https://www.okoun.cz/searchBoards.do*
```

So it should work on:

- Oblíbené kluby
- Moje kluby
- topic pages / témata
- board search results / vyhledávání klubů

## Behavior

OkounAll looks for unread board links on the current page.

The current Okoun favourites markup looks roughly like this:

```html
<div class="item">
  <a class="name" href="/boards/some_board">Some board</a>
  (.../<b><a href="/boards/some_board">18 nových</a></b>)
</div>
```

The important bit is the unread counter text:

```text
18 nových
1 nový
285 nových
```

OkounAll now requires the link text to start with a number followed by `nový/nových`. This prevents false positives such as a board named **Nové kluby**. A board name containing “Nové” is not the same as unread posts. Tiny difference, large goblin.

When clicked:

1. all unread links except the first one open in background tabs
2. the current tab navigates to the first unread club

That keeps the spirit of the original script: your current tab becomes the first unread club, the rest wait in tabs.

## What changed in 0.2.3

- added the new Okoun topics route, `https://www.okoun.cz/topics/*`
- retained the legacy `topic.jsp` match for compatibility

## What changed in 0.2.2

- added the new Okoun favourites route, `https://www.okoun.cz/fav/topics*`
- retained the legacy `favourites.jsp` match for compatibility

## Temporary repaired bookmarks script

The repository root also contains a temporary repaired copy of Eso's
**Oblíbenější oblíbené** script:

[Install repaired Okoun bookmarks](https://raw.githubusercontent.com/hanenashi/okounall/main/okoun-bookmarks.user.js)

It supports the new `/fav/topics` route without external jQuery dependencies
and preserves the existing `eso-okoun-books` cookie. This copy is intended as
a bridge until the original Greasy Fork script is updated.

## What changed in 0.2.1

- fixed matching of accented unread counters such as `1 nový`
- accepts same-site absolute board links as well as `/boards/...` links
- avoids inserting the opener before `<body>` when no known layout container exists

## What changed in 0.2.0

- fixed false positive opening of **Nové kluby** when it had no unread posts
- unread detection now matches numeric unread counters only
- added support for topic pages
- added support for board search results
- broadened insertion target fallback for newer Okoun layouts

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
- detects unread links by text like `^\\d+\\s+nov...`, not by bold tag alone
- keeps the old behavior: background tabs for all except the first, current tab opens the first
- has more tolerant insertion target fallback: old YUI layout, board header, `.main`, `.yui-g`, `#body`, then `document.body`
- logs found unread links to console for easier debugging

Still intentionally small. This is a door opener, not a spaceship.

## Credits

Based on the original Okoun idea/script: **Otevři kluby s novými příspěvky**.

This modern no-jQuery rewrite: **OkounAll** by hanenashi.
