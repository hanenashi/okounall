// ==UserScript==
// @name         OkounAll
// @namespace    https://github.com/hanenashi/okounall
// @version      0.1.0
// @description  Open all Okoun clubs with unread posts from favourites/myBoards.
// @author       hanenashi + original Okoun open-all-new idea
// @match        https://www.okoun.cz/favourites.jsp*
// @match        https://www.okoun.cz/myBoards.jsp*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=okoun.cz
// @downloadURL  https://raw.githubusercontent.com/hanenashi/okounall/main/okounall.user.js
// @updateURL    https://raw.githubusercontent.com/hanenashi/okounall/main/okounall.user.js
// @grant        GM_openInTab
// @run-at       document-end
// ==/UserScript==

(() => {
    'use strict';

    const APP = 'OkounAll';
    let alreadyOpening = false;

    function log(...args) {
        console.log(`[${APP}]`, ...args);
    }

    function absoluteUrl(href) {
        return new URL(href, location.origin).href;
    }

    function isUnreadLink(anchor) {
        const href = anchor.getAttribute('href') || '';
        const text = (anchor.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();

        if (!href.startsWith('/boards/')) return false;

        // Current favourites/myBoards markup usually puts unread counts into:
        // <div class="item"> ... <b><a href="/boards/...">18 novych</a></b>
        // Keep it semantic instead of opening every favourite board link.
        return /nov(ý|ych|ých|e|é)/i.test(text) || anchor.closest('b');
    }

    function findUnreadLinks() {
        const candidates = [
            ...document.querySelectorAll('div.item b a[href^="/boards/"]'),
            ...document.querySelectorAll('div.item a[href^="/boards/"]')
        ];

        const seen = new Set();
        const links = [];

        for (const a of candidates) {
            const href = a.getAttribute('href');
            if (!href || seen.has(href) || !isUnreadLink(a)) continue;
            seen.add(href);
            links.push(href);
        }

        return links;
    }

    function findInsertionPlace() {
        return document.querySelector('div.yui-u.first.main') ||
            document.querySelector('.yui-g') ||
            document.querySelector('.main') ||
            document.querySelector('#body') ||
            document.body;
    }

    function openInBackground(href) {
        const url = absoluteUrl(href);

        if (typeof GM_openInTab === 'function') {
            GM_openInTab(url, {
                active: false,
                insert: true,
                setParent: true
            });
            return;
        }

        window.open(url, '_blank', 'noopener');
    }

    function openUnread(event) {
        event.preventDefault();

        if (alreadyOpening) return;
        alreadyOpening = true;

        const links = findUnreadLinks();
        if (!links.length) {
            log('No unread board links found. Nothing to open.');
            alreadyOpening = false;
            return;
        }

        // Original behavior: open all except first in new/background tabs,
        // then move current tab to the first unread club.
        links.slice(1).forEach(openInBackground);
        location.href = absoluteUrl(links[0]);
    }

    function addButton() {
        if (document.getElementById('okounall-opener')) return;

        const links = findUnreadLinks();
        log(`Found ${links.length} unread board link(s).`, links);

        if (!links.length) return;

        const opener = document.createElement('a');
        opener.id = 'okounall-opener';
        opener.href = '#';
        opener.textContent = `Otevřít nepřečtené [${links.length}]`;
        opener.title = 'OkounAll: open all clubs with unread posts';
        opener.style.cssText = [
            'display:inline-block',
            'cursor:pointer',
            'font-weight:bold',
            'margin:6px 0',
            'padding:4px 8px',
            'border:1px solid #999',
            'border-radius:4px',
            'background:#fff',
            'color:#000',
            'text-decoration:none'
        ].join(';');

        opener.addEventListener('click', openUnread);

        const place = findInsertionPlace();
        place.before(opener, document.createElement('br'));
    }

    addButton();
})();
