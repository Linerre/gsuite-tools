// run hourly
function updatePStatus() {
  // Check the title Col (F=6) first
  let titles = vendorCDLSheet.getRange(3,6, vendorCDLSheet.getLastRow() - vendorCDLSheet.getFrozenRows(), 1).getValues();
  let status = vendorCDLSheet.getRange(3,2, vendorCDLSheet.getLastRow() - vendorCDLSheet.getFrozenRows(), 1).getValues();
  let counter = 0;
  for (let i = 0, n = titles.length; i < n; i++ ) {
    if (titles[i][0] !== '' && status[i][0] == '') {
      let title = titles[i][0];
      Logger.log('Found title %s with empty status! Check row %d', title, i+3);
      Logger.log('Setting the Status for it...');
      vendorCDLSheet.getRange(i+3,2).setValue('Not Arrived');
      Logger.log('The title %s has been marked as Not Arrived', title);
      counter++;
    }
  }

  if (counter > 0) {
    Logger.log('Updated the status of %d titles in total', counter);
  } else {
    Logger.log('No titles\' status need to be updated: %d', counter);
  }
}
