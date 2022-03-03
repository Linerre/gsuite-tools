function longLeadtimeItems() {
  let range = vendorCDLSheet.getRange(129, 1, vendorCDLSheet.getLastRow(), vendorCDLSheet.getLastColumn());
  let items = range.getValues().filter(items => items[0].length > 1);
  let averageLeadtime = vendorCDLSheet.getRange(1,10).getValue();

  Logger.log('The avarege lead time is %d', Math.round(averageLeadtime));
  
  for (let i = 0, n = items.length; i < n ; i++) {
    let item = items[i];
    let today = new Date();
    let inYear = today.getFullYear();
    let inMonth = today.getMonth() + 1;
    // let ondDay = today.getDate();
    let itemInQuestion = {};

    // Skip cancelled or physically arrived titles
    if (item[1] == 'Cancelled' || item[0] == 'CDL Silent') {
      continue;
    } 

    // Requestd 
    if (item[12] !== '') {
      let req = item[12];
      let reqYear = req.getFullYear();
      let reqMonth = req.getMonth() + 1;
      // let reqDay = req.getDate();
      
      // Yet to send to scan
      if (item[13] === '') {
        // Has tracking note?
        if (item[8] !== '') {
          // Email YF or not?
          Logger.log('Still waiting for vendor PDF at row %d. \nThe note is %s', i+129, item[8]);
        } else {// Not scanned and no tracking note         
          // Ordered last year
          if (inYear - reqYear == 1) {
            // and longer than 1 month
            if (12 - reqMonth + inMonth > 1) {
              Logger.log('Waiting for PDF for over 1 month at row %d', i+129);
            }
          } else if (inYear - reqYear == 0) { // Ordered in the same year
            if (inMonth - reqMonth > 1) {
              Logger.log('Waiting for PDF over 1 month at row %d', i+129);
            }
          } else if (inYear - reqYear > 1) { // Waiting for over one year
              Logger.log('Waiting for scaning for over ONE year!');
          }
        }
      }

      // Sent to scan (N !== '')
      if (item[13] !== '') {
        let req = item[13];
        let reqYear = req.getFullYear();
        let reqMonth = req.getMonth() + 1;
        // let reqDay = req.getDate();
        // Physical copy not arrived
        if (item[15] == '') {
          if (inYear - reqYear == 1) {
            if (12 - reqMonth + inMonth > 1) {
              Logger.log('Waiting for print for over 1 month at row %d', i+129)
            } else if (inYear - reqYear == 0) { // Ordered in the same year
              if (inMonth - reqMonth > 1) {
                Logger.log('Waiting for print for over 1 month at row %d', i+129);
              } else if (inYear - reqYear > 1) { // Waiting for over one year
                Logger.log('Waiting for print for over ONE year!');   
              } 
            }
          }
        }
      }
    }
  }
}
