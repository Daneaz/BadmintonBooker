# BadmintonBooker
BadmintonBooker is a web clawer which used puppeteer library to book badminton courts through PA webpage. 

# BadmintonBooking.js
Check all the slots available at all CC on a paticular day. 
### Inputs: 
* **date:** dd/mm/yyyy

# BookerForParticularCC.js
Check for pariticular slot and book
Book a pariticular slots at a pariticular CC on a paticular day. 
### Inputs: 
* **slot:** the slot you would like to book, count from the PA webpage. eg the first slot the input will be [1]. First and second slot [1, 2]
* **ccName:** the name of the CC in full. eg. Jurong Green CC
* **date:** the date you would like to book dd/mm/yyyy. eg 22/07/2020
* **twoDayBeforeDate:** two day before the date you would like to book to avoid PA webpage bug. eg desired date 22/07/2020. twoDayBeforeDate will be 20/07/2020
