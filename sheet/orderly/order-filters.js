/**
 * Filter out unnecessary rows and copy the needed to 'Email Susan' Sheet
 * 
 * Author: Errelin
 * Last Change: 2022-02-22
 */

// Type: sheet obj
let ss = SpreadsheetApp.getActiveSpreadsheet();
let booksSht = ss.getSheetByName('Items');

/**
 * Because the testing spreadsheet is imported from another 
 * .getDataRange() method may behave unexpectedly
 * The following line works as expected
 */
// Type: Range
let orders = booksSht.getRange(2,1,booksSht.getLastRow() - booksSht.getFrozenRows(), booksSht.getLastColumn());

/**
 * The following two lines are identical
 */
// getDataRange() returns all the data rows even some have been filtered or hiden
// let orders = booksSht.getRange(1,1,booksSht.getLastRow(), booksSht.getLastColumn());
// let orders = booksSht.getDataRange();

// Since the data is imported so this line will indeed copy over all the data ...
// let headerRange = booksSht.getRange(1,1,1,3);

// Type: filter
let filter = orders.createFilter();

// Type: criteria
// newFilterCriteira --> builder --> criteria
// setHiddenValues tells the filter to filter out these values
// (Blanks) == ''
// Apply this filter to get all the items that are not CDLed and need to prioritize
let ipsCriteria = SpreadsheetApp.newFilterCriteria().setHiddenValues(['','LT',]);
let nonCDLCriteria = SpreadsheetApp.newFilterCriteria().setHiddenValues(['Y','N']);
let shippmentCriteria = SpreadsheetApp.newFilterCriteria().whenCellEmpty();
let sbtOKCriteria = SpreadsheetApp.newFilterCriteria().whenCellEmpty();

let isCDLCol = 4;
let ipsColNum = 10;
let sbtCol = 13;
let shippmentCol = 14;


function filterNonCDLOrders() {
  filter.setColumnFilterCriteria(ipsColNum,ipsCriteria);
  filter.setColumnFilterCriteria(isCDLCol,nonCDLCriteria);
  filter.setColumnFilterCriteria(sbtCol,nonCDLCriteria);
  filter.setColumnFilterCriteria(shippmentCol,shippmentCriteria);

  /**
   * The following line will not work however; neither will `let filteredRange = booksSht.getDataRange()`
   * Both will instead copy all (including those filtered out) to the new sheet.
   */
  // get the filtered result
  // let filteredRange = booksSht.getRange(1,1,booksSht.getLastRow() - booksSht.getFrozenRows(), booksSht.getLastColumn())

  try {
    // Method 1: Put new content under the old
    let emailSht = ss.getSheetByName('Email Susan');
    let lastTimeLeftAt = emailSht.getLastRow();
    let today = new Date()
    let tableHeaders = [['Title','Order Number','Order Created Date','IPS','Note']];
    emailSht.getRange(lastTimeLeftAt+2,1).setValue('Email sent ' + today.toLocaleDateString());
    emailSht.getRange(lastTimeLeftAt+3,1).setValue('1st Prioritize: Non-CDL titles');
    emailSht.getRange(lastTimeLeftAt+4,1,1,5).setValues(tableHeaders);

    orders.copyTo(emailSht.getRange(lastTimeLeftAt+5,1));

    // remove filter
    filter.remove();

    // highlight 'OR' orders in magenta
    highlightOR(emailSht,lastTimeLeftAt,0);
  } finally {
    filter.remove();
  }
  

  // copy filtered result to a new sheet
  // let newSheet = ss.insertSheet();
  // newSheet.setName("Email Susan");
  // orders.copyTo(newSheet.getRange(2,1));
}

function highlightOR(sheet,startpos,coloffset) {
  let range = sheet.getRange(startpos+5, 4, sheet.getLastRow() - sheet.getFrozenRows(), 1);
  let values = range.getValues();
  let valuesNum = values.length;
  for (var i = 0; i < valuesNum; i++) {
    if (values[i][0] == 'OR') {
      sheet.getRange(startpos+5+i, 4+coloffset).setBackground('magenta');
    }
  }
}

function method2() {
  // keep Col 1, 2, 3, 10
  newSheet.deleteColumns(11,5);
  newSheet.deleteColumns(4,6);

  // set up header
  // headerRange.copyTo(newSheet.getRange(1,1));
  newSheet.getRange(1,1).setValue('Title');
  newSheet.getRange(1,2).setValue('Order Number');
  newSheet.getRange(1,3).setValue('Order Created Date');
  newSheet.getRange(1,4).setValue('IPS');
  newSheet.getRange(1,5).setValue('Note');
  newSheet.getRange(1,1,1,5).setFontWeight('bold');
}
