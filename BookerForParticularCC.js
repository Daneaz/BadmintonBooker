'use strict';
const puppeteer = require('puppeteer');
const fs = require('fs');

/* 
  "ACE The Place CC",
  "Anchorvale CC",
  "Ayer Rajah CC",
  "Bedok CC",
  "Boon Lay CC",
  "Braddell Heights CC",
  "Bukit Batok CC",
  "Bukit Merah CC",
  "Bukit Panjang CC",
  "Bukit Timah CC",
  "Buona Vista CC",
  "Cairnhill CC",
  "Canberra CC",
  "Changi Simei CC",
  "Chong Pang CC",
  "Chua Chu Kang CC",
  "Clementi CC",
  "Eunos CC",
  "Gek Poh Ville CC",
  "Geylang Serai CC",
  "Geylang West CC",
  "Henderson CC",
  "Hong Kah North CC",
  "Hougang CC",
  "Jalan Besar CC",
  "Joo Chiat CC",
  "Jurong Green CC",
  "Jurong Spring CC",
  "Kaki Bukit CC",
  "Kallang CC",
  "Kampong Kembangan CC",
  "Kampong Ubi CC",
  "Keat Hong CC",
  "Kebun Baru CC",
  "Kim Seng CC",
  "Leng Kee CC",
  "MacPherson CC",
  "Marine Parade CC",
  "Nanyang CC",
  "Nee Soon East CC",
  "Nee Soon South CC",
  "OUR TAMPINES HUB CC",
  "Pasir Ris Elias CC",
  "Paya Lebar Kovan CC",
  "Pek Kio CC",
  "Potong Pasir CC",
  "Punggol 21 CC",
  "Queenstown CC",
  "Radin Mas CC",
  "Sembawang CC",
  "SENJA - CASHEW CC FACILITIES",
  "Siglap CC",
  "Taman Jurong CC",
  "Tampines Changkat CC",
  "Tampines North CC",
  "Tampines West CC",
  "Tanglin CC",
  "Tanjong Pagar CC",
  "Teck Ghee CC",
  "Telok Blangah CC",
  "The Frontier CC",
  "Tiong Bahru CC",
  "Toa Payoh East CC",
  "Toa Payoh South CC",
  "Toa Payoh West CC",
  "West Coast CC",
  "Whampoa CC",
  "Woodlands CC",
  "Woodlands Galaxy CC",
  "Yew Tee CC",
  "Yio Chu Kang CC",
  "Yuhua CC",
  "Zhenghua CC"
*/

let webPage = 'https://www.onepa.sg/facilities/4020ccmcpa-bm';
// some cc limit to two slots only 
let slot = [9, 10]
let date = "07/09/2020";
let ccName = "Whampoa CC";

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

    let ccElement = await page.$$('#select2-content_0_ddlFacilityLocation-results > li', options => options.map(option => option));
    let ccText = await page.$$eval('#select2-content_0_ddlFacilityLocation-results > li', options => options.map(option => option.innerHTML));

    for (let i = 0; i < ccText.length; i++) {
        if (ccText[i] === ccName) {
            await ccElement[i].click();
            await page.waitForNavigation();
            break;
        }
    }

    await selectDate(page, date)

    let table = await page.$('#facTable1');
    let result = await searchForSlot(table, slot);
    let loopBreaker = 0;
    while (result === false && loopBreaker < 500) {
        try {
            loopBreaker++;
            console.log(`Searching for slot... Refreshing...${loopBreaker}... Time: ${new Date().toLocaleString()}`)
            delay(500)
            await page.reload();
            result = await searchForSlot(table, slot)
        } catch (error) {
            console.log(error)
        }
    }

    if (result) {
        let checkOut = await page.$(`#content_0_btnAddToCart`);
        await checkOut.click();
        await page.waitForNavigation();
        const cookies = await page.cookies();
        fs.writeFile('cookies.json', JSON.stringify(cookies, null, 2), async function (err) {
            if (err) throw err;
            console.log('Completed write of cookies');
            console.log('Booking Completed');
        });
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

async function selectDate(page, dateString) {
    let date = new Date();
    date.setDate(dateString.split('/')[0])
    date.setMonth(dateString.split('/')[1] - 1)
    date.setFullYear(dateString.split('/')[2])
    while (true) {
        try {
            await page.focus('#content_0_tbDatePicker');
            let nextBtn = await page.$('#ui-datepicker-div > div > a.ui-datepicker-next.ui-corner-all');
            await nextBtn.click();

            let dateObject = await page.$$('#ui-datepicker-div > table > tbody > tr > td > a', options => options.map(option => option));
            let dateText = await page.$$eval('#ui-datepicker-div > table > tbody > tr > td > a', options => options.map(option => option.innerHTML));
            if (dateObject.length >= date.getDate()) {
                for (let i = 0; i < dateText.length; i++) {
                    if (dateText[i] == date.getDate()) {
                        await dateObject[i].click();
                        await page.waitForNavigation();
                        return;
                    }
                }
            } else {
                console.log(`Selecting date.... Refreshing... Time: ${new Date().toLocaleString()}`)
                delay(500)
                await page.reload();
            }
        } catch (error) {
            console.log(error)
        }

    }
}
function delay(time) {
    return new Promise(function (resolve) {
        setTimeout(resolve, time)
    });
}