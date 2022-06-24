// sheet that tracks CDL circulation stats
const dueDateSheet = SpreadsheetApp.openById('sheetID').getSheetByName('Sheet1');


// [[dirve_URL, due_date, expire_or_onloan, item_title, ...   manually, manually date ], ...]
//      0           1            2              3       ...      10          11
// from bottom to top
var loansInfo = dueDateSheet.getRange(dueDateSheet.getFrozenRows() + 1, 1, dueDateSheet.getLastRow() - dueDateSheet.getFrozenRows(), dueDateSheet.getLastColumn()).getValues();

function unitTest() {
  Logger.log(loansInfo);
}
// Get the circ PDF col (O=15) on vendor sheet
// var pdfUrls = vendorCDLSheet.getRange(2, 15, realVendorLastRow - 1).getValues().map(url => url[0]);
var pdfUrls = vendorCDLSheet.getRange(vendorCDLSheet.getFrozenRows() + 1, 1, vendorCDLSheet.getLastRow() - vendorCDLSheet.getFrozenRows(), vendorCDLSheet.getLastColumn()).getValues().filter(item => {return item[0] != ''}).map(item => item[14]);

var pdfDueDates = vendorCDLSheet.getRange(2, 18, realVendorLastRow - 1).getValues().map(due => due[0]);

// function test () {
//   Logger.log(pdfUrls[10]);
// }

// run every day
function syncOnLoan() {
  //  Logger.log(pdfItems);
  var onLoans = transformRowToHash(loansInfo);
  fetchDueDate(onLoans, pdfUrls, pdfDueDates, vendorCDLSheet);
  // removeDueDate(loansInfo, pdfUrls, pdfDueDates, vendorCDLSheet);
}


function fetchDueDate(onLoans, itemUrls, itemDueDate, targetSheet) {
  // Logger.log(today);
  var counter = 0;
  for (var loan of onLoans) {
    // indexOf returns -1 if the item is not found in the array
    var currentIndex = itemUrls.indexOf(loan.url);

    if (currentIndex >= 0 && itemDueDate[currentIndex]) {
      Logger.log('The below Title at row %d is still on loan; nothing to update.\n%s', itemUrls.indexOf(loan.url)+2, loan.title);
    } else if (currentIndex >= 0 && !itemDueDate[currentIndex]) {
      counter++;
      Logger.log('Found on-loan title at row %d\nUpdating the due date ...', itemUrls.indexOf(loan.url)+2);
      targetSheet.getRange(currentIndex + 2, 18).setValue(loan.dueDate);
    } else {
      Logger.log('Failed to find URL %s', loan.url);
    }
  } if (counter > 0) {
    Logger.log('Updated due dates for %d titles.', counter)
  } else {
    Logger.log('No due dates need updating.')
  }
}


function transformRowToHash(rows) {
/*
 * Transform a row data structure to a hash table.
 * A simple illustration is as follows:
 * Row := [[row_data_1], [row_data_2], [row_data_3], ... ]
 * =>
 * Hash:= [record1, record2, record3, ...] where a record looks like
 * {
 *  id: idRe.exec(loanInfo[0])[0],
 *  dueDate: loansInfo[1],
 *  status: loanInfo[2],
 *  title: loanInfo[3],
 *  manually: loanInfo[10]
 * }
 */

  // Logger.log(loansInfo);
  // id Pattern, for both file and folder
  // var idRe = /[\w-]{20,}(?=[\/\?])/g;
  // expired items array is not that necessary but keep it for now
  // var expired = [];
  var onloans = [];
  for (var row of rows) {
    if (row[3].startsWith('ILL') || row[2] == 'Expired') {continue;}

    var rowHash = {};
    // recordHash.url = idRe.exec(record[0])[0];

    // just in case the url is not standard
    rowHash.url = row[0].endsWith('drivesdk') ? row[0].replace('drivesdk', 'sharing') : row[0].endsWith('view') ? row[0].replace('view', 'view?usp=sharing') : row[0];
    rowHash.dueDate =row[1];
    rowHash.status =row[2];
    rowHash.title =row[3];

    onloans.push(rowHash);
  }
  // Logger.log(onloans);
  return onloans;
}

// run every 8 hours
function removeDueDate() {
  var logSwitch = 0;
  var status = {};
  // var expired = [];
  for (var row of loansInfo) {
    // skip ILL
    if (row[3].startsWith('ILL')) {
      continue;
    } else if (!row[2]) {
      // skip on-loan titles (i.e row[2] == '')
      // If this is the first time an on-loan  title appears
      if (status[row[0]] == undefined) {
        Logger.log('%s is still on loan.', row[3]);
        status[row[0]] = 'onloan';
      } else if (status[row[0]] == 'expired') {
        // if a title already appeared earlier and was mistakenly treated as 'expired', correct it
        Logger.log('%s is still on loan, correcting its status and due date ...', row[3]);
      // Logger.log(row);
      vendorCDLSheet.getRange(pdfUrls.indexOf(row[0]) + 2, 18).setValue(row[1]);
      status[row[0]] = 'onloan';
      }
    }
    else if (row[2].toLowerCase() == 'expired'){
      // for any expired title, i.e row[2] == 'Expired'
      // row[0] = row[0].endsWith('drivesdk') ? row[0].replace('drivesdk', 'sharing') : row[0];
      row[0] = row[0].endsWith('drivesdk') ? row[0].replace('drivesdk', 'sharing') : row[0].endsWith('view') ? row[0].replace('view', 'view?usp=sharing') : row[0];

      /**
       * the problem:
       * if a title appears twice or more, then the expired history (what we are looking for) could trick the program
       * into believing that it is expired and this removes the due date from the unexpired one!
       * Solution: make a mistake when a title appears for the first tiem and then correct the mistake when the title last appears
      */
      var index = pdfUrls.indexOf(row[0]);
      // var now = new Date();
      // if its due date is still on Index Sheet, then remove the due date
      if (index >= 0 && pdfDueDates[index] && status[row[0]] == undefined) {
        logSwitch++;
        Logger.log('Found the below title at row %d expired. Removing the due date ... \nTitle: %s', pdfUrls.indexOf(row[0])+2, row[3]);
        Logger.log('url is %s', row[0]);
        vendorCDLSheet.getRange(index + 2, 18).setValue('');
        status[row[0]] = 'expired';
      } else {
        continue;
        // Logger.log('The below title from auto-expir sheet is NOT on loan:\n%s', row[3]);
      }
    }
  }
  if (logSwitch == 0) {
    Logger.log('No due dates need to update. Script finished');
  } else {
    Logger.log("Updated %d due dates in total.", logSwitch);
  }
}
