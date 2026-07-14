// ==UserScript==
// @name         Okoun.cz bookmarks (temporary repair)
// @namespace    https://github.com/hanenashi/okounall
// @version      0.1.3-temp.1
// @description  More-favourite Okoun bookmarks, repaired for the /fav/topics route.
// @author       Vladimir Skach (original), hanenashi (temporary repair)
// @match        https://www.okoun.cz/favourites.jsp*
// @match        https://www.okoun.cz/fav/topics*
// @downloadURL  https://raw.githubusercontent.com/hanenashi/okounall/main/okoun-bookmarks.user.js
// @updateURL    https://raw.githubusercontent.com/hanenashi/okounall/main/okoun-bookmarks.user.js
// @grant        none
// @license      MIT
// @run-at       document-end
// ==/UserScript==

(() => {
    'use strict';

    const COOKIE_NAME = 'eso-okoun-books';
    const STAR_SELECTOR = 'span.eso-fav, span.eso-fav-btn-rmv';

    function readCookie(name) {
        const prefix = `${encodeURIComponent(name)}=`;
        const entry = document.cookie.split('; ').find((part) => part.startsWith(prefix));
        if (!entry) return '';

        try {
            return decodeURIComponent(entry.slice(prefix.length));
        } catch (_) {
            return '';
        }
    }

    function loadClubs() {
        const stored = readCookie(COOKIE_NAME);
        if (!stored) return [];

        try {
            const clubs = JSON.parse(stored);
            return Array.isArray(clubs) ? clubs.map(String) : [];
        } catch (error) {
            console.warn('[Okoun bookmarks] Ignoring an invalid saved club list.', error);
            return [];
        }
    }

    function saveClubs(clubs) {
        const expires = new Date();
        expires.setFullYear(expires.getFullYear() + 1);
        document.cookie = [
            `${encodeURIComponent(COOKIE_NAME)}=${encodeURIComponent(JSON.stringify(clubs))}`,
            `expires=${expires.toUTCString()}`,
            'path=/',
            'SameSite=Lax',
            'Secure'
        ].join('; ');
    }

    function favouriteRows() {
        return [...document.querySelectorAll("input[id^='favouriteBoardId-']")];
    }

    function clubId(input) {
        return input.id.replace('favouriteBoardId-', '');
    }

    function setStarColour(cid, selected) {
        document.querySelectorAll('span.eso-fav').forEach((star) => {
            if (star.dataset.cid === cid) star.style.color = selected ? 'red' : 'black';
        });
    }

    function renderBooks(clubs) {
        document.querySelectorAll('div.eso-books').forEach((element) => element.remove());

        const books = document.createElement('div');
        books.className = 'eso-books';
        books.style.cssText = 'display:block;margin-bottom:8px';

        for (const cid of clubs) {
            const input = favouriteRows().find((candidate) => clubId(candidate) === cid);
            const row = input?.parentElement;
            const boardLink = row?.querySelector('a.name');
            if (!boardLink) continue;

            const remove = document.createElement('span');
            remove.className = 'eso-fav-btn-rmv';
            remove.dataset.cid = cid;
            remove.textContent = ' ✖ ';
            remove.style.cursor = 'pointer';

            const clonedBoardLink = boardLink.cloneNode(true);
            clonedBoardLink.style.cssText = 'display:inline-block;font-size:15px;padding-right:8px';
            books.append(remove, clonedBoardLink);

            const unreadLink = row.querySelector('b a');
            if (unreadLink) {
                const clonedUnreadLink = unreadLink.cloneNode(true);
                clonedUnreadLink.style.cssText = 'display:inline-block;font-size:15px;padding-right:8px';
                books.append(clonedUnreadLink);
            }

            books.append(document.createElement('br'));
            setStarColour(cid, true);
        }

        const insertionPoint = document.querySelector('body div.main div.main') ||
            document.querySelector('div.main') || document.body.firstChild;
        if (insertionPoint?.parentNode) insertionPoint.before(books);
        else document.body.prepend(books);
    }

    let clubs = loadClubs();

    for (const input of favouriteRows()) {
        const cid = clubId(input);
        const star = document.createElement('span');
        star.className = 'eso-fav';
        star.dataset.cid = cid;
        star.textContent = '★';
        star.style.cssText = `cursor:pointer;color:${clubs.includes(cid) ? 'red' : 'black'}`;
        input.after(star);
    }

    renderBooks(clubs);

    document.addEventListener('click', (event) => {
        const control = event.target.closest(STAR_SELECTOR);
        if (!control) return;

        const cid = control.dataset.cid;
        if (!cid) return;

        if (clubs.includes(cid)) clubs = clubs.filter((item) => item !== cid);
        else clubs.push(cid);

        saveClubs(clubs);
        renderBooks(clubs);
    });
})();
