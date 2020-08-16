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

### Usage:
#### Script:
1. Clone the project 
2. npm i 
3. Change the input parameters
4. node BookerForParticularCC.js or BadmintonBooking.js

#### Full App
1. Clone the project 
2. npm i 
3. cd frontend 
4. npm i 
5. npm start frontend and backend

# Upadte 16/08/2020
* Added UI for the booker
* Added Scheduler for booker
* The inputs can be selected from UI now
* The Scheduler will automaticly start on the night of the date you have request. if the theres more than one request, it will take the latest.
If you are using a scheduler, the cookies will be email to the input email address, the user have to replace the content in cookies.js, then run the script for OpenBroswerWithCookies.js within 30 mins before the cookies expired. Or the user can run the script directly at local machine.


