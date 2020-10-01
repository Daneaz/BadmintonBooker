'use strict';

var aws = require('aws-sdk');
const puppeteer = require('puppeteer');
const fs = require('fs');
var schedule = require('node-schedule');
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
let slot = [7, 8]
// dd/mm/yyyy
let twoDayBeforeDate = "18/09/2020";
let date = "20/09/2020";
let ccName = "Whampoa CC";
const scheduleDate = `0 55 21 * * *`

console.log(`Job has scheduled for ${ccName} on ${date} for slot ${slot}`)
schedule.scheduleJob(scheduleDate, function () {
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

        await selectDate(page, date, twoDayBeforeDate)

        let table = await page.$('#facTable1');
        let result = await searchForSlot(table, slot);
        if (result) {
            let checkOut = await page.$(`#content_0_btnAddToCart`);
            await checkOut.click();
            await page.waitForNavigation();
            const cookies = await page.cookies();
//             await sentEmail(cookies, date, ccName);
            fs.writeFile('cookies.json', JSON.stringify(cookies, null, 2), async function (err) {
                if (err) throw err;
                console.log('Completed write of cookies');
                console.log('Booking Completed');
                await browser.close();
            });
        } else {
            console.log("Slot Not found")
        }
    })();
});

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

async function selectDate(page, date, twoDayBeforeDate) {
    let dateResult = null
    let error = "error";

    while (dateResult !== date || error !== '') {
        await page.focus('#content_0_tbDatePicker');
        await page.$eval('#content_0_tbDatePicker', (e) => e.removeAttribute("readonly"));

        await page.evaluate(() => document.getElementById("content_0_tbDatePicker").value = "")
        if (error !== '')
            await page.keyboard.type(`${twoDayBeforeDate}`);
        else
            await page.keyboard.type(`${date}`);

        await page.keyboard.press('Enter');
        await page.keyboard.press('Enter');
        await page.waitForNavigation();

        dateResult = await page.$eval('#content_0_tbDatePicker', e => e.getAttribute('value'))
        console.log("Date not available, picking again")
        error = await page.$eval('#content_0_lblError', e => e.innerHTML)
        console.log(error)

    }
    console.log("Continue...")
    return;
}
function delay(time) {
    return new Promise(function (resolve) {
        setTimeout(resolve, time)
    });
}

function sentEmail(cookies, date, ccName) {
    // Provide the full path to your config.json file. 
    aws.config.loadFromPath('./config.json');

    // Replace sender@example.com with your "From" address.
    // This address must be verified with Amazon SES.
    const sender = "eugene@tenchicomics.com";

    // Replace recipient@example.com with a "To" address. If your account 
    // is still in the sandbox, this address must be verified.
    const recipient = "eugeneaad@gmail.com";

    // Specify a configuration set. If you do not want to use a configuration
    // set, comment the following variable, and the 
    // ConfigurationSetName : configuration_set argument below.
    // const configuration_set = "ConfigSet";

    // The subject line for the email.
    const subject = `${date} at ${ccName}`;

    // The email body for recipients with non-HTML email clients.
    const body_text = JSON.stringify(cookies, null, 2);

    // The HTML body of the email.
    // const body_html = `<html>
    // <head></head>
    // <body>
    // <h1>Amazon SES Test (SDK for JavaScript in Node.js)</h1>
    // <p>This email was sent with
    //     <a href='https://aws.amazon.com/ses/'>Amazon SES</a> using the
    //     <a href='https://aws.amazon.com/sdk-for-node-js/'>
    //     AWS SDK for JavaScript in Node.js</a>.</p>
    // </body>
    // </html>`;

    // The character encoding for the email.
    const charset = "UTF-8";

    // Create a new SES object. 
    var ses = new aws.SES();

    // Specify the parameters to pass to the API.
    var params = {
        Source: sender,
        Destination: {
            ToAddresses: [
                recipient
            ],
        },
        Message: {
            Subject: {
                Data: subject,
                Charset: charset
            },
            Body: {
                Text: {
                    Data: body_text,
                    Charset: charset
                },
                // Html: {
                //     Data: body_html,
                //     Charset: charset
                // }
            }
        },
        // ConfigurationSetName: configuration_set
    };

    //Try to send the email.
    ses.sendEmail(params, function (err, data) {
        // If something goes wrong, print an error message.
        if (err) {
            console.log(err.message);
        } else {
            console.log("Email sent! Message ID: ", data.MessageId);
        }
    });
}
