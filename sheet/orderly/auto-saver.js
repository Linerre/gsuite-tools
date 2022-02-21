/**
 * 
 * This script will automate the following steps:
 * 1. Look for Shanghai Order Report (weekly, Excel as attachment)
 * 2. Store the Excel to a specific Drive folder
 * 3. Convert it to Google Sheet
 * 4. Extract the needed columns and insert them into Books for KARMS shipping prioritized
 * 5. Notify YF once the above steps are done
 * 
 * Author: Errelin
 * Last Change: 2022-02-21
 */

// convert their types to `const' later
let RPFILTER = {
  FROM    : 'lib-dba@nyu.edu',
  TO      : 'me',
  SUBJ    : 'Shanghai Order Report',
  HAS     : ['attachment'],  // for future extensibility
  NWTH    : '1d'
}

/** 
 * USER may prefer two folders:
 * 1. original Excel file 
 * 2. converted Google Sheet 
 * */ 

let RPFOLDER = {
  ID      : '12XwFii9q5qTwS-8KUDxEdsmaGxOTNofS',
  NAME    : 'Weekly Order Report',
  OWNER   : 'zl37@nyu.edu'
}

let RPTEMPLATE = {
  ID      :  '1xbSkUrYQARf64c26BX291NHu530aCHqJQ8ZrnxtYIkE',
  NAME    :  '[Reprot-Template]',
  OWNER   :  'zl37@nyu.edu'
}


/**
 * How to decide whether or not the report email has been checked?
 * 1. Use labels (+ isRead)
 * 2. Use colorful marks (purple star) */
function autoSaver() {
  // It should be impossible for the number of weekly report threads exceeds 100
  // Since I care the latest one ONLY, so 50 would be far more than enough
  let threads = GmailApp.search(`newer_than:${RPFILTER.NWTH} has:attachment subject:Shanghai Order Report`, 0, 50);
  if (threads.length > 1) {Logger.log('Two threads found where only ONE is expected!')}
  Logger.log('Get %d threads in total', threads.length);


  let atts = threads[0].getMessages()[0].getAttachments();
  if (atts.length > 1) {Logger.log('More than ONE attachment are Found!')}

  let weeklyReportExcelBlob = atts[0].copyBlob(); // this var's life circle matters
  // let weeklyReportExcelBlob = atts[0].getAs('GOOGLE_SHEETS'); // not supported
  let weeklyReportExcelName = atts[0].getName(); 
  Logger.log('The report name is %s', weeklyReportExcelName);

  // Store the Excel report to the specific Drive folder
  try {
    let targetFolder = DriveApp.getFolderById(RPFOLDER.ID);
    targetFolder.createFile(weeklyReportExcelBlob);
    Logger.log('Successfully Added the order report Excel of this week!');
    
    // For more info: https://developers.google.com/drive/api/v2/reference/files/insert
    let config = {
      title: "[Google Sheets] Weekly " + weeklyReportExcelName,
      parents: [{id: RPFOLDER.ID}],
      mimeType: MimeType.GOOGLE_SHEETS
    };


    let spreadsheet = Drive.Files.insert(config, weeklyReportExcelBlob);
                      
    Logger.log(spreadsheet.id);

  } catch(err) {
    Logger.log(err);
  }
}

let SHIPFIRST = {
  ID      : '1sDt-MQ8UNLC0XcL0nPcNi4DiPGgMKhClukhwTKxSXNQ',
  OWNER   : 'zl37@nyu.edu',
  // target tab where the extracted cols to be inserted
  // INDEX is 0-based for easy use with arrays 
  // NAME is subject to change
  TARTAB  : {NAME: 'Sheet3', INDEX: 2} 
}

// Extract the needed columns from the excel-turned sheet
function colExtracter() {
  let spreadsheetID = '1f1hjGQyixI6JHHfNedo_D8qIv47cNImvwQPlY6ni0WA';
  // In case there are no sheets at all
  let srcSpreadsheet = SpreadsheetApp.openById(spreadsheetID);
  let sheets = srcSpreadsheet.getSheets();
  if (sheets.length < 1) {
    Logger.log('Require at least ONE tab but found NONE! The program terminates now.');
    return null;
  }

  // src sheet which contains the data from Excel
  let srcSht = sheets[0];
  // tmp sheet which contains the needed columns copied from src sheet and gets deleted afterwards
  let tmpSht = srcSpreadsheet.insertSheet('tmp');

  /**
   * 1. Copy the needed columns to an adjacent sheet
   * Need the following columns
   * FROM: | Q-Z68_ORDER_NUMBER | B-Z13_TITLE | G-Z30_BARCODE | U-Z68_ORDER_STATUS_DATE_X | H-Z30_ITEM_PROCESS_STATUS | J-Z30_PROCESS_STATUS_DATE |
   *                  17               2             7                       21                         8                            10
   * TO:   | A-Z68_ORDER_NUMBER | B-Z13_TITLE | D-Z30_BARCODE | E-Z68_ORDER_STATUS_DATE_X | F-Z30_ITEM_PROCESS_STATUS | G-Z30_PROCESS_STATUS_DATE |
   *                  1                2             3                       4                          5                             6 
   * 
   * 2. Copy the entire sheet to the dest spreadsheet
   */
  let srcCols = ['Q:Q', 'B:B', 'G:G', 'U:U', 'H:H', 'J:J'];
  for (let i = 0, n = srcCols.length; i < n; i++) {
    srcSht.getRange(srcCols[i]).copyTo(tmpSht.getRange(1,i+1));
  }
 
  // Logger.log(srcSht.getSheetName());

  let destSht = SpreadsheetApp.openById(SHIPFIRST.ID).getSheetByName(SHIPFIRST.TARTAB.NAME);
  
  /**
   * The for loop below is a typical error. 
   * Correct and acceptable Time Complexity O(n) + wrong data structure
   * leads to a disaster: 15 minutes to copy over simply ONE column of 3500+ records!
   */
  // for (let i = 0, n = testColVals.length; i < n; i++) {
  //   destSht.getRange(i+1,1).setValue(testColVals[i][0]);
  // }
  //  let testColVals = srcSht.getRange(1,1,srcSht.getLastRow(),1).getValues(); 
  // This does not work because of the following error:
  // Exception: Target range and source range must be on the same spreadsheet.
  // testCol.copyTo(destSht.getRange(1,1));
 
  Logger.log('DONE!')

}
