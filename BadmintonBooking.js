
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');


let date = "05/07/2020";
let resultPath = `result/${date.split('/').join("")}`
fs.mkdir(path.join(__dirname, resultPath), (err) => {
    if (err) {
        return console.error(err);
    }
    console.log('Directory created successfully!');
});
// dd/mm/yyyy

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
    let totalCCCount = 71;
    let count = 0;
    let resultList = [];
    for (let i = 0; i < totalCCCount; i++) {
        let locationPicker = await page.$('.select2-selection__arrow');
        await locationPicker.click();
        if (i != 0)
            await page.keyboard.press('ArrowDown');
        await delay(50)
        await page.keyboard.press('Enter');
        await page.waitForNavigation();
        let locationName = await page.$eval('.location', el => el.innerHTML)
        locationName = locationName.trim();
        console.log(`Searching for ${locationName}`)
        if (await searchForSlot(page, "peak") || await searchForSlot(page, "normal")) {
            let screenshot = await page.$('#facTable1')
            await screenshot.screenshot({ path: `${resultPath}/${locationName}.png`, type: "png" });
            console.log(`Slot found for ${locationName}`);
            count++;
            resultList.push(locationName);
        }
    }

    await browser.close();
    console.log("Seaching Completed")
    resultList.map(result => {
        console.log(result);
    })
    if (count === 0)
        console.log("There is no slots available")
    else
        console.log(`There are total ${count} CC with slot`)
})();

async function searchForSlot(page, type) {
    try {
        await page.$eval(`.slots.${type}`, el => el.value);
        return true
    } catch (err) {
        if (err.message === `Error: failed to find element matching selector ".slots.normal"` || err.message === `Error: failed to find element matching selector ".slots.peak"`) {
            return false
        } else {
            console.log(err)
        }
    }
}

function delay(time) {
    return new Promise(function (resolve) {
        setTimeout(resolve, time)
    });
}