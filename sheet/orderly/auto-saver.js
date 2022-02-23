/**
 * 
 * This script will automate the following steps:
 * 1. Look for Shanghai Order Report (On Fris, with an Excel as attachment)
 * 2. Store the Excel to a specific Drive folder (e.g Weekly Order Report)
 * 3. Convert it to Google Sheet
 * 4. Extract the needed columns from the sheet and insert them into 'Books for KARMS shipping prioritized'
 * 5. Notify YF via email that the above steps are done
 * 
 * It is supposed to run only ONCE every day so there is NO need to worry about
 * it will make any kind of duplicate checking
 * 
 * Author: Errelin
 * Last Change: 2022-02-23
 */

// convert their types to `const' later
const RPFILTER = {
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

const RPFOLDER = {
  ID      : '12XwFii9q5qTwS-8KUDxEdsmaGxOTNofS',
  NAME    : 'Weekly Order Report',
  OWNER   : 'zl37@nyu.edu'
}

const RPTEMPLATE = {
  ID      :  '1xbSkUrYQARf64c26BX291NHu530aCHqJQ8ZrnxtYIkE',
  NAME    :  '[Reprot-Template]',
  OWNER   :  'zl37@nyu.edu'
}

const SHIPFIRST = {
  ID      : '1sDt-MQ8UNLC0XcL0nPcNi4DiPGgMKhClukhwTKxSXNQ', // change the ID to that of the one in use
  OWNER   : 'zl37@nyu.edu',
  // target tab where the extracted cols to be inserted
  // INDEX is 0-based for easy use with arrays 
  // NAME is subject to change
  TARTAB  : {NAME: 'Sheet3', INDEX: 2} 
}

const NOTIFYBODY = {
  cc       : 'zl37@nyu.edu',
  name     : 'YF',
  sender   : 'zl37@nyu.edu', // from whom a msg to send out
  from     : 'zl37@nyu.edu', // change to YF's email later,
  htmlBody : '<p>The weekly order report of this week has been processed and updated to Sheet3 on \
              <a href="https://docs.google.com/spreadsheets/d/1sDt-MQ8UNLC0XcL0nPcNi4DiPGgMKhClukhwTKxSXNQ/edit?usp=sharing">\
              Books for KARMS shipping prioritized</a>\
              </p>'
  //replyTo  : 'zl37@nyu.edu',  // default to the user: me            
}

// Run daily
/**
 * How to decide whether or not the report email has been checked?
 * 1. Use labels (+ isRead)
 * 2. Use colorful marks (purple star) 
 * */
function autoSaver() {
  // It should be impossible for the number of weekly report threads exceeds 100
  // Since I care the latest one ONLY, so 50 would be far more than enough
  let threads = GmailApp.search(`newer_than:3d has:attachment subject:Shanghai Order Report`, 0, 50);
  if (threads.length < 1) {
    Logger.log('No threads found meeting the search queary! Program terminates now');
    return null;
  }
  if (threads.length > 1) {Logger.log('Two threads found where only ONE is expected!')}
  Logger.log('Get %d threads in total', threads.length);

  // The first contains the latest report
  let atts = threads[0].getMessages()[0].getAttachments();
  if (atts.length > 1) {Logger.log('More than ONE attachment are Found!')}

  let weeklyReportExcelBlob = atts[0].copyBlob(); // this var's life circle matters
  // let weeklyReportExcelBlob = atts[0].getAs('GOOGLE_SHEETS'); // not supported
  let weeklyReportExcelName = atts[0].getName(); 
  Logger.log('The report name is %s', weeklyReportExcelName);


  
  try {
    // Store the Excel report to the specific Drive folder; then
    // Convert it to google sheet
    let targetFolder = DriveApp.getFolderById(RPFOLDER.ID);
    targetFolder.createFile(weeklyReportExcelBlob);
    Logger.log('Successfully stored the order report Excel of this week!\nStarting to convert it to Google Sheet ...');
    
    // For more info: https://developers.google.com/drive/api/v2/reference/files/insert
    let config = {
      title: "[Google Sheets] Weekly " + weeklyReportExcelName,
      parents: [{id: RPFOLDER.ID}],
      mimeType: MimeType.GOOGLE_SHEETS
    };

    let spreadsheet = Drive.Files.insert(config, weeklyReportExcelBlob);                
    Logger.log('Converting DONE! The converted spreadsheet ID is %s', spreadsheet.id);

    // Extract the needed columns from the excel-turned sheet
    let shpsstUrl = colExtracter(spreadsheet.id);

    NOTIFYBODY.htmlBody = `<p>The Order Report of this week has been processed and updated to <strong>Sheet3</strong> of \
              <a href="${shpsstUrl}">Books for KARMS shipping prioritized</a></p>`;
    // Notify YF everything is ready
    notifyStatus(threads[0],NOTIFYBODY);
  } catch(err) {
    Logger.log(err);
  }
}


function colExtracter(spreadsheetID) {
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
   * 1. Copy the needed columns to Books for KARMS shipping prioritized
   * 
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
 
  // Copy the tmp sheet to dest spreadsheet
  let destSpreadsheet = SpreadsheetApp.openById(SHIPFIRST.ID);
  let destSht = destSpreadsheet.getSheetByName(SHIPFIRST.TARTAB.NAME); // Sheet3
  
  Logger.log('Starting copying tmp sheet contents to the destination spreadsheet...')
  // The copied sheet is named "Copy of [original name]".
  let tmpSht3 = tmpSht.copyTo(destSpreadsheet);
  Logger.log('Starting copying data from tmp sheet to Sheet3...')
  
  // Clear will remove the content on the first row
  // Try to overwrite instead
  // destSht.clear();

  // Skip the Col C while copying data
  tmpSht3.getRange('A2:B').copyTo(destSht.getRange('A2:B'));
  tmpSht3.getRange('C2:F').copyTo(destSht.getRange('D2:G'));

  Logger.log('Copying DONE!\nDeleting tmp sheet on dest spreadsheet...')
  // delete tmp sheet
  destSpreadsheet.deleteSheet(tmpSht3);

  Logger.log('Deleting tmp sheet on src spreadsheet...')
  srcSpreadsheet.deleteSheet(tmpSht);
  
  return destSpreadsheet.getUrl();

}


function notifyStatus(thread, config) {
  // reply and add a mark: read or a label？
  thread.reply('Placeholder text', config);
  Logger.log('Processing Done. Notification sent')
}
