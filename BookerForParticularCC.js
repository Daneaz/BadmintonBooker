
const puppeteer = require('puppeteer');

// dd/mm/yyyy
// OUR TAMPINES HUB CC -> https://www.onepa.gov.sg/facilities/2400ipogpa-bm
let ccName = 'https://www.onepa.gov.sg/facilities/2400ipogpa-bm';
let slot = [4, 5]
let date = "21/07/2020";

(async () => {
    const browser = await puppeteer.launch({
        defaultViewport: null,
        headless: false,
        args: ['--start-fullscreen'],
    });

    console.log("Seaching...")
    const page = await browser.newPage();
    await page.goto(ccName);
    //Date
    await page.focus('#content_0_tbDatePicker');
    await page.$eval('#content_0_tbDatePicker', (e) => e.removeAttribute("readonly"));

    await page.keyboard.type(`${date}`);
    await page.keyboard.press('Enter');
    let table = await page.$('#facTable1');
    await table.click();
    await page.waitForNavigation();

    table = await page.$('#facTable1');
    if (await searchForSlot(table, slot)) {
        let checkOut = await page.$(`#content_0_btnAddToCart`);
        await checkOut.click();
        await page.waitForNavigation();
        console.log("Slot found please compelte the booking")
    } else {
        console.log("Slot Not found")
    }
})();

async function searchForSlot(table, slot) {
    let facilities = await table.$$eval(".facilitiesType", elements => elements.map(item => item));
    for (let i = 0; i < facilities.length; i++) {
        let counter = 0;
        for (let j = 0; j < slot.length; j++) {
            let checkbox = await table.$(`#content_0_facility_book_court_${i}_slot_${slot[j] - 1}`);
            if (checkbox != null) {
                await checkbox.click();
                counter++;
                if (counter === slot.length) {
                    return true;
                }
            } else {
                counter = 0;
                break;
            }
        }
    }
    return false;
}
