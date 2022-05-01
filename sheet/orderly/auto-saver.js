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
 * To debugg and test, turn on testing drive, spreadsheet and change YF to ME
 *
 * Author: Errelin
 * Last Change: 2022-03-25
 */

// convert their types to `const' later
const RPFILTER = {
  FROM    : 'errelinaaron@gmail.com',
  // FROM    : 'lib-dba@nyu.edu',
  TO      : 'me',
  SUBJ    : 'Shanghai Order Report',
  HAS     : ['attachment'],  // for future extensibility
  NWTH    : '6d'
}

/**
 * USER may prefer two folders:
 * 1. original Excel file
 * 2. converted Google Sheet
 * */

const RPFOLDER = {
  // ID      : '1_tjeJsVK62crqclh2t0M9awzOFRPq9GV', // Real
  ID      : '12XwFii9q5qTwS-8KUDxEdsmaGxOTNofS', // My Test Drive
  NAME    : 'Weekly Order Report',
  OWNER   : 'zl37@nyu.edu'
};

const SHIPFIRST = {
  ID      : '1sDt-MQ8UNLC0XcL0nPcNi4DiPGgMKhClukhwTKxSXNQ',    // Test
  // ID      : '1s-e91uQFsY-O0BfWoEBR8zNEYfysVgnsphmyS5dFcjE', // Real
  URL     : 'https://docs.google.com/spreadsheets/d/1s-e91uQFsY-O0BfWoEBR8zNEYfysVgnsphmyS5dFcjE/edit?usp=sharing',
  // ID      : '1sDt-MQ8UNLC0XcL0nPcNi4DiPGgMKhClukhwTKxSXNQ', // change the ID to that of the one in use
  // target tab where the extracted cols to be inserted
  // INDEX is 0-based for easy use with arrays
  // NAME is subject to change
  TARTAB  : {NAME: 'Sheet3', INDEX: 2}
};

const CDLINDEX = {
  ID   :  '1DpgC__qjQmxrY1Mltm2OKl-tDn-1w4pFsSiKXZPV1ao',
  URL  :  'https://docs.google.com/spreadsheets/d/1DpgC__qjQmxrY1Mltm2OKl-tDn-1w4pFsSiKXZPV1ao/edit?usp=sharing',
  VEND :  {NAME: 'Vendor CDL', INDEX: 0}
};

const USERS = {
  ME: 'zl37@nyu.edu',
  YF: 'yz8212@nyu.edu',
  NB: ''
};

// Run daily
/**
 * How to decide whether or not the report email has been checked?
 * 1. Use labels (+ isRead)
 * 2. Use colorful marks (purple star)
 * */
function autoSaver() {
  // It should be impossible for the number of weekly report threads exceeds 100
  // Since I care the latest one ONLY, so 50 would be far more than enough
  let queary = `from:${RPFILTER.FROM} newer_than:6d has:attachment subject:${RPFILTER.SUBJ}`;
  let threads = GmailApp.search(queary, 0, 50);
  if (threads.length < 1) {
    Logger.log('No threads found meeting the search queary! Program terminates now');
    return null;
  }
  if (threads.length > 1) {Logger.log('Two threads found where only ONE is expected!')}
  Logger.log('Get %d threads in total', threads.length);

  // The first contains the latest report
  let atts = threads[0].getMessages()[0].getAttachments();
  if (atts.length > 1) {Logger.log('More than ONE attachment are Found!')}

  let weeklyRepExcelBlob = atts[0].copyBlob(); // this var's life circle matters
  // let weeklyRepExcelBlob = atts[0].getAs('GOOGLE_SHEETS'); // not supported

  try {
    // Store the Excel report to the specific Drive folder; then
    // Convert it to google sheet
    let today = new Date();
    let targetFolder = DriveApp.getFolderById(RPFOLDER.ID);
    let weeklyRepExcel = targetFolder.createFile(weeklyRepExcelBlob);
    let weeklyRepExcelNameOrig = weeklyRepExcel.getName(); // NYUSH ORDER_REPORT.xlsx
    let weeklyRepExcelNameNew = weeklyRepExcelNameOrig.replace('.', '-' + today.toLocaleDateString() + '.'); // NYUSH ORDER_REPORT - DATE.xlsx

    weeklyRepExcel = weeklyRepExcel.setName(weeklyRepExcelNameNew);
    Logger.log('The report name is %s', weeklyRepExcel.getName());
    // 2/25/2022-REPORT NAME
    Logger.log('Successfully stored the order report Excel of this week!\nStart onverting it to Google Sheet ...');

    // For more info: https://developers.google.com/drive/api/v2/reference/files/insert
    let config = {
      title: "[Google Sheets] " + weeklyRepExcel.getName(),
      parents: [{id: RPFOLDER.ID}],
      mimeType: MimeType.GOOGLE_SHEETS
    };

    let spreadsheet = Drive.Files.insert(config, weeklyRepExcelBlob);
    Logger.log('Converting DONE! The converted spreadsheet ID is %s', spreadsheet.id);

    // Extract the needed columns from the excel-turned sheet
    colExtracter(spreadsheet.id);


    // filter order and generate email to Susan in draft
    let tables = filterCDLs();

    // Notify YF everything is done
    // draft is ready
    // CDL Index result
    // spreadsheet urls
    notifier(tables.CDLTABLE, tables.DRAFT, USERS.ME, USERS.ME);
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
   * FROM: | W-Z68_ORDER_NUMBER | B-Z13_TITLE | G-Z30_BARCODE | D-Z71_OPEN_DATE | H-Z30_ITEM_PROCESS_STATUS | M-Z30_PROCESS_STATUS_DATE |
   *                  17               2             7                       21                         8                            10
   * TO:   | A-Z68_ORDER_NUMBER | B-Z13_TITLE | D-Z30_BARCODE | E-Z71_OPEN_DATE | F-Z30_ITEM_PROCESS_STATUS | G-Z30_PROCESS_STATUS_DATE |
   *                  1                2             3                       4                          5                             6
   *
   * 2. Copy the entire sheet to the dest spreadsheet
   */
  let srcCols = ['W:W', 'B:B', 'G:G', 'D:D', 'H:H', 'M:M'];
  for (let i = 0, n = srcCols.length; i < n; i++) {
    srcSht.getRange(srcCols[i]).copyTo(tmpSht.getRange(1,i+1));
  }
  // Trim whitespace before copying the data to the readl Sheet3!!!!!!!!
  tmpSht.getDataRange().trimWhitespace();

  // Copy the tmp sheet to dest spreadsheet
  let destSpreadsheet = SpreadsheetApp.openById(SHIPFIRST.ID);
  let destSht = destSpreadsheet.getSheetByName(SHIPFIRST.TARTAB.NAME); // Sheet3

  Logger.log('Copying tmp sheet contents to the destination spreadsheet...')
  // The copied sheet is named "Copy of [original name]".
  // This copied sheet tab will not increase the number in sheet tab (e.g. sheet1, sheet2, sheet3, ...)
  let tmpSht3 = tmpSht.copyTo(destSpreadsheet);

  Logger.log('Copying data from tmp sheet to Sheet3...')

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


function notifier(cdledtable, draftBody, fromWhom, toWhom) {
  let orderRep = `<p>The Order Report of this week has been processed and updated to <strong>Sheet3</strong> of \
      <a href="${SHIPFIRST.URL}">Books for KARMS shipping prioritized</a></p>`;
  let draftNoty = '<p>A message to Susan has been stored or updated in your Draft with the title <strong>Orders to Check</strong>.</p>';
  let noOrderNoty = '<p>There are <b>no</b> Non-CDL orders to check with Susan this week.</p>';
  let cdlIndexRep = '<p>There are <b>no</b> CDL orders to check with Susan this week.</p>';
  let tableFooter = '</tbody></table>';
  let wishing = '<p style="margin-top: 20px">Have a nice weekend, young lady ٩(^ᴗ^)۶</p>'

  if (cdledtable !== '<br>') {
    cdlIndexRep = `<p>Before emailing Susan, you may want to check the following CDL orders on <a href="${CDLINDEX.URL}">CDL Index</a></p>`;
  };

  if (draftBody != '<br><br><br>') {
    noOrderNoty = '<p>The following Non-CDL orders need to be checked with Susan. They are <b>already in your Draft</b></p>'
  }

  let notifyBody = orderRep + draftNoty + noOrderNoty + draftBody + cdlIndexRep + cdledtable + tableFooter + wishing;
  GmailApp.sendEmail(toWhom, 'Weekly Order Report DONE', 'Placeholder text', {
    from: fromWhom,
    cc: USERS.ME,
    name: 'WEEKOR',
    htmlBody: notifyBody,
    noReply: true});
}
