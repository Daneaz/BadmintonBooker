# BadmintonBooker
BadmintonBooker is a web clawer which used puppeteer library to book badminton courts through PA webpage. 

# BadmintonBooking.js
Check all the slots available at all CC on a paticular day. The output will be generatate at the result folder in screenshot format, Not much use during busy peroid. 
### Inputs: 
* **date:** dd/mm/yyyy

# BookerForParticularCC.js
Check for pariticular slot and book
Book a pariticular slots at a pariticular CC on a paticular day. 
### Inputs: 
* **slot:** The slot you would like to book, count from the PA webpage. eg the first slot the input will be [1]. First and second slot [1, 2]
* **ccName:** The name of the CC in full. eg. Jurong Green CC
* **date:** The date you would like to book dd/mm/yyyy. eg 22/07/2020
* **twoDayBeforeDate:** two day before the date you would like to book to avoid PA webpage bug. eg desired date 22/07/2020. twoDayBeforeDate will be 20/07/2020

Lazy to code the UI part and no plans for the UI page for now. 

### Usage:
1. Clone the project 
2. npm i 
3. Change the input parameters
4. node BookerForParticularCC.js or BadmintonBooking.js
