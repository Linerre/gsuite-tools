/**
 * Filter out unnecessary rows and copy the needed to 'Email Susan' Sheet
 * In the future, Email Susan automatically
 * 
 * Author: Errelin
 * Last Change: 2022-02-24
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
// let orders = booksSht.getRange(2,1,booksSht.getLastRow() - booksSht.getFrozenRows(), booksSht.getLastColumn());

/**
 * The following two lines are identical
 */
// getDataRange() returns all the data rows even some have been filtered or hiden
// let orders = booksSht.getRange(1,1,booksSht.getLastRow(), booksSht.getLastColumn());
// let orders = booksSht.getDataRange();

// Since the data is imported so this line will indeed copy over all the data ...
// let headerRange = booksSht.getRange(1,1,1,3);
// Type: filter
// let filter = orders.createFilter();

// Type: criteria
// newFilterCriteira --> builder --> criteria
// setHiddenValues tells the filter to filter out these values
// (Blanks) == ''
// Apply this filter to get all the items that are not CDLed and need to prioritize
let nonCDLIpsCriteria = SpreadsheetApp.newFilterCriteria().setHiddenValues(['','LT',]);
let nonCDLCriteria = SpreadsheetApp.newFilterCriteria().setHiddenValues(['Y','N', '']);

// Yet to ship = CDL-ed but physical copies yet to be shipped
let yetToShipIpsCriteria = SpreadsheetApp.newFilterCriteria().setHiddenValues(['LT']);
let yetToShipCriteria = SpreadsheetApp.newFilterCriteria().setHiddenValues(['N','--', '']);

let shippmentCriteria = SpreadsheetApp.newFilterCriteria().whenCellEmpty();
let sbtOKCriteria = SpreadsheetApp.newFilterCriteria().whenCellEmpty();

// Cols to apply the filter
let isCDLCol = 4;
let ipsColNum = 10;
let sbtCol = 13;
let shippmentCol = 14;


function filterOrders() {
  try {
    
    // Method 1: Put new content under the old
    let emailSht = ss.getSheetByName('Email Susan');
    let lastTimeLeftAt = emailSht.getLastRow();

    Logger.log('Starting to making headers for new data...')
  
    // Setting up timestamp
    let today = new Date();
    emailSht.getRange(lastTimeLeftAt+2,1).setValue('Email sent ' + today.toLocaleDateString());
    emailSht.getRange(lastTimeLeftAt+2,1).setFontWeight('Bold');

    // Setting up headers
    emailSht.getRange(lastTimeLeftAt+3,1).setValue('1st Prioritize: Non-CDL titles');
    emailSht.getRange(lastTimeLeftAt+3,6).setValue('2nd Prioritize: Non-CDL titles');

    
    Logger.log('The yeto ship CDL-ed titles should start at row %d', lastTimeLeftAt+4);

    // Copying over yet to ship titles
    getNonCDLTitles(emailSht, lastTimeLeftAt);
    Logger.log('Highlighting OR status ...')
    // highlight 'OR' orders in magenta or yellow
    highlightOR(emailSht, lastTimeLeftAt, 1, 4);

   
    getYetToShipTitles(emailSht, lastTimeLeftAt);
    // Highlight 'OR' and empty cells 
    highlightOR(emailSht, lastTimeLeftAt, 6, 10);

    Logger.log('Data ready for emailing Susan.');

  } finally {
    if (booksSht.getFilter()) {
      booksSht.getFilter().remove();
      Logger.log('Script terminated due to an error; Filter on Book Sheet has been removed.')
    }
  }
}

function getNonCDLTitles(targetSht, lastTimeLeftAt) {
  // let orders = booksSht.getRange(2,1,booksSht.getLastRow() - booksSht.getFrozenRows(), booksSht.getLastColumn());
  let orders = booksSht.getDataRange();
  let filter = orders.createFilter();
  Logger.log('Start filtering CDL titles from all...');
  // Get Non CDL titles (--)
  filter.setColumnFilterCriteria(ipsColNum,nonCDLIpsCriteria);     // ['CT', 'GV', 'OR', 'LB']
  filter.setColumnFilterCriteria(isCDLCol,nonCDLCriteria);         // --
  filter.setColumnFilterCriteria(sbtCol,sbtOKCriteria);            // empty
  filter.setColumnFilterCriteria(shippmentCol,shippmentCriteria);  // empty

  let nonCDLOrderInfo = booksSht.getRange('A:C');
  let nonCDLIPSInfo = booksSht.getRange('J:J');
  nonCDLOrderInfo.copyTo(targetSht.getRange(lastTimeLeftAt+4,1));
  nonCDLIPSInfo.copyTo(targetSht.getRange(lastTimeLeftAt+4,4));

  // let nowLastRow = targetSht.getLastRow();
  // Note Row
  targetSht.getRange(lastTimeLeftAt+4,5).setValue('Note');
  targetSht.getRange(lastTimeLeftAt+3,1,2,5).setFontWeight('Bold');
  Logger.log('Non-CDL titles dat4 pasted')
  
  filter.remove();

  return null;
}

function getYetToShipTitles(targetSht, startRow) {
  let orders = booksSht.getDataRange();
  // let orders = booksSht.getRange(2,1,booksSht.getLastRow() - booksSht.getFrozenRows(), booksSht.getLastColumn());
  let filter = orders.createFilter();
  Logger.log('Start filtering Yet to CDL titles from all...');
  // Get CDL-ed titles titles (--)
  filter.setColumnFilterCriteria(ipsColNum,yetToShipIpsCriteria);
  filter.setColumnFilterCriteria(isCDLCol,yetToShipCriteria);
  filter.setColumnFilterCriteria(sbtCol,sbtOKCriteria);
  filter.setColumnFilterCriteria(shippmentCol,shippmentCriteria);

  // Will this also copy the filtered rows? No
  let yetToShipOrderInfo = booksSht.getRange('A:D');
  let yetToShipIPSInfo = booksSht.getRange('J:J');

  yetToShipOrderInfo.copyTo(targetSht.getRange(startRow+4,6))  
  yetToShipIPSInfo.copyTo(targetSht.getRange(startRow+4,10));

  // Note Col
  targetSht.getRange(startRow+4,11).setValue('Note');
  targetSht.getRange(startRow+3,6,2,6).setFontWeight('Bold');
  Logger.log('Yet to CDL titles data pasted')
  
  // remove fi
  filter.remove();

  return null;
}

function highlightOR(sheet, startRow, fromCol, toCol) {
  let targetRange = sheet.getRange(startRow+5, fromCol, sheet.getLastRow(), toCol);
  let targetValues = targetRange.getValues();
  let targetValuesNum = targetValues.length;

  /**
   * Two possibilities: 
   * 1. Non CDL titles: 5 cols and highlight the 4th col
   * 2. Yet to ship CDL-ed titles: 6 cols and highlight the 5th col 
   * */
   
  for (var i = 0; i < targetValuesNum; i++) {
    if (toCol == 4) {
      if (targetValues[i][0] !== '' && targetValues[i][toCol-1] == 'OR') {
        sheet.getRange(startRow+5+i, toCol).setBackground('magenta');
        Logger.log('Found IPS %s at row %d', targetValues[i][toCol-1], startRow+5+i);
      } else if (targetValues[i][0] !== '' && targetValues[i][toCol-1] == '') {
        sheet.getRange(startRowpos+5+i, toCol).setBackground('yellow');
        Logger.log('Found empty IPS at row %d', startRow+5+i);
      }
    } 

    if (toCol == 10) {
      if (targetValues[i][0] !== '' && targetValues[i][toCol-6] == 'OR') {
        sheet.getRange(startRow+5+i, toCol).setBackground('magenta');
        Logger.log('Found IPS %s at row %d', targetValues[i][toCol-6], startRow+5+i);
      } else if (targetValues[i][0] !== '' && targetValues[i][toCol-6] == '') {
        sheet.getRange(startRow+5+i, toCol).setBackground('yellow');
        Logger.log('Found empty IPS at row %d', startRow+5+i);
      }
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
