const request = require ('request');
const parser = require ('node-html-parser');

const localhosthttp = 'http://127.0.0.1';
const bigVignetteSelectory = '#hero'

test('Should render home page', () => {
    request(localhosthttp, (error, response, body) => {
        expect(error).toBeNull();

        const root = parser.parse(body);

        bigVignetteElem  = root.querySelector(bigVignetteSelectory);
        expect(bigVignetteSelectory).not.toBeUndefined();
        expect(bigVignetteSelectory).not.toBeNull();
        
        const toc = root.querySelector('#toc');
        expect(toc).toBeNull();
    });
})

test('Should render micropaas-with-rio-from-rancher content', () => {
    request(localhosthttp + "/micropaas-with-rio-from-rancher/", (err, resp, body) => {
        expect(err).toBeNull();

        const root = parser.parse(body);

        let title = root.querySelector('h1.post-title');
        expect(title).not.toBeNull();
        expect(title.toString()).toBe('<h1 class=\"post-title\">MicroPaaS avec Rio de Rancher</h1>');

        let img = root.querySelector('img.post-cover');
        expect(img.rawAttrs.includes('src="/assets/img/kubernetes/rio/top.png"'));

        let tocPrelude = root.querySelector('#markdown-toc-prélude');
        expect(tocPrelude.toString()).toBe('<a href="#prélude" id="markdown-toc-prélude">Prélude</a>');
    })
})