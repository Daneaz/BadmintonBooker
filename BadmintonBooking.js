
const puppeteer = require('puppeteer');

// dd/mm/yyyy
let date = "07/07/2020";
(async () => {
    const width = 1980;
    const height = 1080;
    const browser = await puppeteer.launch({
        headless: true,
    });

    const page = await browser.newPage();
    await page.setViewport({ width, height });
    await page.goto('https://www.onepa.sg/facilities/4020ccmcpa-bm');
    //Date
    await page.focus('#content_0_tbDatePicker');
    await page.$eval('#content_0_tbDatePicker', (e) => e.removeAttribute("readonly"));

    await page.keyboard.type(`${date}`);
    await page.keyboard.press('Enter');

    //Location
    let totalCCCount = 63;
    for (let i = 0; i < totalCCCount; i++) {
        let locationPicker = await page.$('.select2-selection__arrow');
        await locationPicker.click();
        await page.keyboard.press('ArrowDown');
        await delay(100)
        await page.keyboard.press('Enter');
        await page.waitForNavigation();
        try {
            let locationName = await page.$eval('.location', el => el.innerHTML)
            locationName = locationName.trim();
            console.log(`Searching for ${locationName}`)
            await page.$eval('.slots.normal', el => el.value);
            let screenshot = await page.$('#facTable1')

            await screenshot.screenshot({ path: `result/${locationName}.png`, type: "png" });
            console.log(`Slot found for ${locationName}`);
            await delay(2000)
        } catch (err) {
            if (err.message !== `Error: failed to find element matching selector ".slots.normal"`)
                console.log(err)
        }
    }

    await browser.close();
})();



function delay(time) {
    return new Promise(function (resolve) {
        setTimeout(resolve, time)
    });
}