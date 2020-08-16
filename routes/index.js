'use strict';
var express = require('express');
var router = express.Router();
var aws = require('aws-sdk');
const puppeteer = require('puppeteer');
const fs = require('fs');
var schedule = require('node-schedule');
const webPage = 'https://www.onepa.sg/facilities/4020ccmcpa-bm';
let scheduleFlag = false;
/* GET home page. */
router.post('/book', function (req, res, next) {
  let scheduleDate = `0 55 21 * * *`
  let job;
  if (scheduleFlag === true) {
    console.log(`Job has scheduled... `)
    console.log(`Cancel scheduled... `)
    scheduleFlag = false;
    job.cancel();
  } else {
    console.log(`Starting scheduler... ${scheduleDate}`)
    job = schedule.scheduleJob(scheduleDate, function () {
      scheduleFlag = true;
      let selectedDate = new Date(req.body.date);
      let date = selectedDate.getDate();
      let month = selectedDate.getMonth() + 1;
      if (month < 10) {
        month = `0${month}`
      }
      let year = selectedDate.getFullYear();
      let dateString = `${date}/${month}/${year}`

      let twoDayBeforeDate = selectedDate;
      twoDayBeforeDate.setDate(selectedDate.getDate() - 2);
      date = twoDayBeforeDate.getDate();
      month = twoDayBeforeDate.getMonth();
      if (month < 10) {
        month = `0${month}`
      }
      year = twoDayBeforeDate.getFullYear();
      let twoDayBeforeString = `${date}/${month}/${year}`

      let slot = req.body.slot
      let ccName = req.body.location;
      let email = req.body.email;
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
        let table = await page.$('#facTable1');

        await selectDate(page, table, dateString, twoDayBeforeString)

        let result = await searchForSlot(table, slot);
        if (result) {
          let checkOut = await page.$(`#content_0_btnAddToCart`);
          await checkOut.click();
          await page.waitForNavigation();
          const cookies = await page.cookies();
          await sentEmail(cookies, date, ccName, email);
          fs.writeFile('cookies.json', JSON.stringify(cookies, null, 2), async function (err) {
            if (err) throw err;
            console.log('Completed write of cookies');
            console.log('Booking Completed, Email sent');
            scheduleFlag = false;
            await browser.close();
          });
        } else {
          console.log("Slot Not found")
          await sentEmail("Slot Not found", date, ccName, email);
          scheduleFlag = false;
          await browser.close();
        }
      })();
    });
  }
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

async function selectDate(page, table, date, twoDayBeforeDate) {
  console.log("Selecting date...")
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

function sentEmail(cookies, date, ccName, email) {
  // Provide the full path to your config.json file. 
  aws.config.loadFromPath('./config.json');

  // Replace sender@example.com with your "From" address.
  // This address must be verified with Amazon SES.
  const sender = "eugene@tenchicomics.com";

  // Replace recipient@example.com with a "To" address. If your account 
  // is still in the sandbox, this address must be verified.
  const recipient = email;

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

module.exports = router;
