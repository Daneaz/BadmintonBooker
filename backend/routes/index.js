'use strict';
var express = require('express');
var router = express.Router();
var aws = require('aws-sdk');
const puppeteer = require('puppeteer');
const fs = require('fs');
var schedule = require('node-schedule');
const webPage = 'https://www.onepa.sg/facilities/4020ccmcpa-bm';
let counter = 0;
/* GET home page. */
router.post('/book', function (req, res, next) {
  const scheduleDate = `0 55 21 * * *`

  console.log(`Current job count: ${counter}`)
  if (counter >= 5) {
    res.send(`Max scheduler = 5, Current scheduler= ${counter}`)
  } else {
    counter++;
    console.log(`Job has scheduled to book ${req.body.location} on ${new Date(req.body.date).toLocaleDateString()} for slot ${req.body.slot}... The script will run at 21:55... Result should be out by 22:05... Max job = 5, Current job count = ${counter}`)
    res.send(`Job has scheduled to book ${req.body.location} on ${new Date(req.body.date).toLocaleDateString()} for slot ${req.body.slot}... The script will run at 21:55... Result should be out by 22:05... Max job = 5,  Current job count = ${counter}`)
    schedule.scheduleJob(scheduleDate, function () {
      let date = new Date(req.body.date);

      let slot = req.body.slot
      let ccName = req.body.location;
      let email = req.body.email;
      (async () => {
        const browser = await puppeteer.launch({
          defaultViewport: null,
          headless: true,
          args: ['--no-sandbox'],
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

        await selectDate(page, date)

        let result = await searchForSlot(table, slot);
        let loopBreaker = 0;
        while (result === false && loopBreaker < 1000) {
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
          await sentEmail(cookies, date, ccName, email);
          fs.writeFile('cookies.json', JSON.stringify(cookies, null, 2), async function (err) {
            if (err) throw err;
            console.log('Completed write of cookies');
            console.log('Booking Completed, Email sent');
            counter--;
            await browser.close();
          });
        } else {
          console.log("Slot Not found")
          counter--;
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
  } catch (err) {
    return false;
  }
  return false;
}

async function selectDate(page, date) {
  let loopBreaker = 0;
  while (loopBreaker < 2000) {
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
        loopBreaker++;
        console.log(`Selecting date.... Refreshing...${loopBreaker}... Time: ${new Date().toLocaleString()}`)
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
