
const puppeteer = require('puppeteer');


let CCLIST = [
    { count: 0, name: "ACE The Place CC" },
    { count: 1, name: "Anchorvale CC" },
    { count: 2, name: "Ayer Rajah CC" },
    { count: 3, name: "Bedok CC" },
    { count: 4, name: "Bishan CC" },
    { count: 5, name: "Boon Lay CC" },
    { count: 6, name: "Braddell Heights CC" },
    { count: 7, name: "Bukit Batok CC" },
    { count: 8, name: "Bukit Merah CC" },
    { count: 9, name: "Bukit Panjang CC" },
    { count: 10, name: "Bukit Timah CC" },
    { count: 11, name: "Buona Vista CC" },
    { count: 12, name: "Cairnhill CC" },
    { count: 13, name: "Canberra CC" },
    { count: 14, name: "Changi Simei CC" },
    { count: 15, name: "Chong Pang CC" },
    { count: 16, name: "Chua Chu Kang CC" },
    { count: 17, name: "Clementi CC" },
    { count: 18, name: "Eunos CC" },
    { count: 19, name: "Gek Poh Ville CC" },
    { count: 20, name: "Geylang Serai CC" },
    { count: 21, name: "Geylang West CC" },
    { count: 22, name: "Henderson CC" },
    { count: 23, name: "Hong Kah North CC" },
    { count: 24, name: "Hougang CC" },
    { count: 25, name: "Joo Chiat CC" },
    { count: 26, name: "Jurong Green CC" },
    { count: 27, name: "Jurong Spring CC" },
    { count: 28, name: "Kaki Bukit CC" },
    { count: 29, name: "Kallang CC" },
    { count: 30, name: "Kampong Kembangan CC" },
    { count: 31, name: "Kampong Ubi CC" },
    { count: 32, name: "Keat Hong CC" },
    { count: 33, name: "Kebun Baru CC" },
    { count: 34, name: "Kim Seng CC" },
    { count: 35, name: "Leng Kee CC" },
    { count: 36, name: "MacPherson CC" },
    { count: 37, name: "Marine Parade CC" },
    { count: 38, name: "Nanyang CC" },
    { count: 39, name: "Nee Soon East CC" },
    { count: 40, name: "Nee Soon South CC" },
    { count: 41, name: "OUR TAMPINES HUB CC" },
    { count: 42, name: "Pasir Ris Elias CC" },
    { count: 43, name: "Paya Lebar Kovan CC" },
    { count: 44, name: "Pek Kio CC" },
    { count: 45, name: "Potong Pasir CC" },
    { count: 46, name: "Punggol 21 CC" },
    { count: 47, name: "Queenstown CC" },
    { count: 48, name: "Radin Mas CC" },
    { count: 49, name: "Sembawang CC" },
    { count: 50, name: "SENJA-CASHEW CC FACILITIES" },
    { count: 51, name: "Siglap CC" },
    { count: 52, name: "Taman Jurong CC" },
    { count: 53, name: "Tampines Changkat CC" },
    { count: 54, name: "Tampines North CC" },
    { count: 55, name: "Tampines West CC" },
    { count: 56, name: "Tanglin CC" },
    { count: 57, name: "Tanjong Pagar CC" },
    { count: 58, name: "Teck Ghee CC" },
    { count: 59, name: "Telok Blangah CC" },
    { count: 60, name: "The Frontier CC" },
    { count: 61, name: "Thomson CC" },
    { count: 62, name: "Tiong Bahru CC" },
    { count: 63, name: "Toa Payoh Central CC" },
    { count: 64, name: "Toa Payoh East CC" },
    { count: 65, name: "Toa Payoh South CC" },
    { count: 66, name: "Toa Payoh West CC" },
    { count: 67, name: "West Coast CC" },
    { count: 68, name: "Whampoa CC" },
    { count: 69, name: "Woodlands CC" },
    { count: 70, name: "Woodlands Galaxy CC" },
    { count: 71, name: "Yew Tee CC" },
    { count: 72, name: "Yio Chu Kang CC" },
    { count: 73, name: "Yuhua CC" },
    { count: 74, name: "Zhenghua CC" }
]

// OUR TAMPINES HUB CC -> https://www.onepa.gov.sg/facilities/2400ipogpa-bm
let webPage = 'https://www.onepa.sg/facilities/4020ccmcpa-bm';
let slot = [10, 11]
// dd/mm/yyyy
let date = "23/07/2020";
let ccName = "Jurong Green CC";

(async () => {
    const browser = await puppeteer.launch({
        defaultViewport: null,
        headless: false,
        args: ['--start-fullscreen'],
    });

    console.log("Seaching...")
    const page = await browser.newPage();
    await page.goto(webPage);


    let locationPicker = await page.$('.select2-selection__arrow');
    await locationPicker.click();

    let totalCCCount = 0;
    for (let i = 0; i < CCLIST.length; i++) {
        if (CCLIST[i].name === ccName) {
            totalCCCount = CCLIST[i].count;
            break;
        }
    }
    for (let i = 0; i < totalCCCount; i++) {
        await page.keyboard.press('ArrowDown');
        await delay(50)
    }
    await page.keyboard.press('Enter');

    if (totalCCCount !== 0)
        await page.waitForNavigation();

    await selectDate(page, date)

    table = await page.$('#facTable1');
    let result = await searchForSlot(table, slot);
    if (result) {
        let checkOut = await page.$(`#content_0_btnAddToCart`);
        await checkOut.click();
        await page.waitForNavigation();
        console.log("Slot found please compelte the booking before close the brower or program")
    } else {
        console.log("Slot Not found")
    }
})();

async function searchForSlot(table, slot) {
    try {
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
    } catch {
        return false;
    }
    return false;
}

async function selectDate(page, date) {
    let dateResult = null
    let error = "something";
    while (dateResult !== date || error !== '') {
        await page.focus('#content_0_tbDatePicker');
        await page.$eval('#content_0_tbDatePicker', (e) => e.removeAttribute("readonly"));

        await page.evaluate(() => document.getElementById("content_0_tbDatePicker").value = "")
        await page.keyboard.type(`${date}`);

        await page.keyboard.press('Enter');
        await page.keyboard.press('Enter');
        await page.waitForNavigation();

        dateResult = await page.$eval('#content_0_tbDatePicker', e => e.getAttribute('value'))
        console.log("Date not available, picking again")
        error = await page.$eval('#content_0_lblError', e => e.innerHTML)
        await delay(100);
    }
    console.log("Continue...")
    return;
}
function delay(time) {
    return new Promise(function (resolve) {
        setTimeout(resolve, time)
    });
}