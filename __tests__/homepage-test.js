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