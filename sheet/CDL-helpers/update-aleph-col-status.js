/**
 * This script checks the following columns:
 * 1. Expiration Time (Column B)
 * 2. Expiration Status (Column C)
 * 3. Aleph (Column L)
 * If an item is expired but the Aleph col remains "Checked out", 
 * change it to "Checked in", in case we forget to do so.
 * 
 * It runs every 12 hours to make sure an item will NOT be checked in too early,
 * that is, before the staff manually check it in via Aleph.
 * 
 * Author: Errelin <zl37@nyu.edu>
 * Last Change: 2022-06-08
 */

// run every 12 hours
function manullayCheckedIn() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheets()[0];
  var records = sheet.getRange(sheet.getFrozenRows() + 1, 1, sheet.getLastRow() - sheet.getFrozenRows(), sheet.getLastColumn()).getValues();
  var logSwitch = 0;

  try {
    for (let i = 0, n = records.length; i < n; i++) {
      let record = records[i]
      if (record[2] == '') {continue;} // skip those still on loan

      if (record[2]) {// if the item is expired

        if (record[11].toLowerCase() == 'checked out') {// but the Aleph row remains "Checked Out" (also ignores ILL as Nita tends to ignore)
          logSwitch++;
          Logger.log('Found expired item with "Checked Out" status at row %d', i+2);
          Logger.log('Change the status to "Checked In" ...');
          sheet.getRange(i+2,12).setValue('Checked In');
          Logger.log('DONE! Status updated to "Checked In".')
        }
      }
    }
    if (logSwitch > 0) {
      Logger.log('Found and corrected %d URLs with wrong Aleph status.', logSwitch)
    } else {
      Logger.log('No items have been manually checked in.')
    }
  } catch(e) {
        Logger.log('File type is neither file nor folder. Script terminates. See error message below:\n%s', e.toString());
  }
}
