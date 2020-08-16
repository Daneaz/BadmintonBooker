const puppeteer = require('puppeteer');
const fs = require('fs');


let webPage = 'https://www.onepa.sg/facilities/4020ccmcpa-bm';
(async () => {
    const browser = await puppeteer.launch({
        defaultViewport: null,
        headless: false,
        args: ['--start-fullscreen'],
    });

    const cookiesString = fs.readFileSync('./cookies.json', 'utf8');
    const cookies = JSON.parse(cookiesString);

    const page = await browser.newPage();
    await page.setCookie.apply(page, cookies);
    await page.goto(webPage);
})();