// ==UserScript==
// @name         OkounAll
// @namespace    https://github.com/hanenashi/okounall
// @version      0.2.0
// @description  Open all Okoun clubs with unread posts from favourites, my boards, topics, or board search results.
// @author       hanenashi + original Okoun open-all-new idea
// @match        https://www.okoun.cz/favourites.jsp*
// @match        https://www.okoun.cz/myBoards.jsp*
// @match        https://www.okoun.cz/topic.jsp*
// @match        https://www.okoun.cz/searchBoards.do*
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

    function cleanText(node) {
        return (node.textContent || '').replace(/\s+/g, ' ').trim();
    }

    function looksLikeUnreadCounter(anchor) {
        const text = cleanText(anchor).toLowerCase();

        // Examples seen on Okoun favourites:
        //   18 nových
        //   1 nový
        //   285 nových
        // Important: do NOT match a board name like "Nové kluby".
        return /^\d+\s+nov(ý|e|é|ych|ých)\b/i.test(text);
    }

    function isUnreadLink(anchor) {
        const href = anchor.getAttribute('href') || '';
        if (!href.startsWith('/boards/')) return false;

        // Old/current favourites markup puts the unread count link into <b>.
        // But the deciding signal is the numeric unread text, not merely <b>,
        // because board names can contain "Nové" and be bold somewhere too.
        return looksLikeUnreadCounter(anchor);
    }

    function findUnreadLinks() {
        const candidates = [
            ...document.querySelectorAll('div.item b a[href^="/boards/"]'),
            ...document.querySelectorAll('div.item a[href^="/boards/"]'),
            ...document.querySelectorAll('.main b a[href^="/boards/"]'),
            ...document.querySelectorAll('.main a[href^="/boards/"]')
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
            document.querySelector('.board-page .board-header') ||
            document.querySelector('.main') ||
            document.querySelector('.yui-g') ||
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
