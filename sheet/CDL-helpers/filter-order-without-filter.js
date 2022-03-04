/**
 * Filter out unnecessary rows and copy the needed to 'Email Susan' Sheet
 * In the future, Email Susan automatically
 * 
 * Author: Errelin
 * Last Change: 2022-03-04
 */

function filterCDLs () {
  let items = booksSht.getRange(5,1,booksSht.getLastRow()-4, booksSht.getLastColumn()).getValues();
  // Logger.log(items)

  let nonCDLItems = [];
  let cdledItems = [];
  let cdlIPS = ['CT', 'GV', 'OR', 'LB'];
  for (let i = 0, n = items.length; i < n; i++) {
    let item = items[i]
    if (item[3] == '--' && cdlIPS.includes(item[9]) && item[12] == '' && item[13] == '') {
      nonCDLItems.push(item);
    }

    if (item[3] == 'Y' && (cdlIPS.includes(item[9]) || item[9] == '') && item[12] == '' && item[13] == '') {
      cdledItems.push(item)
    }
  }
  // Logger.log('Non CDL Titles: ');
  // Logger.log(nonCDLItems);
  checkDup(nonCDLItems,5);
  checkDup(cdledItems,6);
  // Logger.log('Yet-to-ship CDL Titles: ');
  // Logger.log(cdledItems);
}

/**
 * Check if the filtered orders have the same item as those of last week 
 */
function checkDup (items, colNum) {
  let emailSht = ss.getSheetByName('Email Susan');
  let lastTimeLeftAt = emailSht.getLastRow();
  let existing;
  let emailSusan = [];

  if (colNum == 5) {
    // Merged cells will be treated as an array with the same width/len as other rows in the range
    // For example: [Email sent 11/15/2021, , , , ]
    
    // Exisiting order numers: array ['NYUSHXXXX', .... , 'NYUSHYYYY']
    existing = emailSht.getRange(1,1,lastTimeLeftAt,5).getValues().filter(r => r[1].startsWith('NYUSH')).map(r => r[1]);

    elen = existing.length;
    Logger.log('Already emailed Susan: ');
    Logger.log(existing);
  } else {
    existing = emailSht.getRange(1,6,lastTimeLeftAt,6).getValues().filter(r => r[1].startsWith('NYUSH')).map(r => r[1]);
    Logger.log('Already emailed Susan: ');
    Logger.log(existing);
  }

  // compare Col2 == orderNum
  for (let i = 0, n= items.length; i < n; i++) {
    if(existing.includes(items[i][1])) {
      Logger.log('Found existing order number %s', items[i][1]);
    } else {
      emailSusan.push(items[i]);
    }
  }

  if (emailSusan.length > 0) {
    // In this case, drop an draft to YF gmail
    if (colNum == 5) {
      Logger.log('The following Non CDL orders need double checking with Susan');
      Logger.log(emailSusan);
    } else if (colNum == 6) {
      // Find the row of these titles on CDL sheet as well
      Logger.log('The following CDL-ed orders need double checking with Susan');
      Logger.log(emailSusan);
    } 
  } else {
    // In this case, toast a message? and put a line on the sheet?
    Logger.log('No new orders need double checking with Susan');
  }
}
