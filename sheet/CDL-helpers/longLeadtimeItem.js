/**
 * Detect all the orders that are either:
 * 1. waiting to be scanned for over 1 month or
 * 2. scanned but the physical copies are not back to KARMS within 1 month
 * 
 * Author: Errelin
 * Last Change: 2022-03-09
 */

const CDLINDEX = {
  ID    : '1DpgC__qjQmxrY1Mltm2OKl-tDn-1w4pFsSiKXZPV1ao',
  URL   : 'https://docs.google.com/spreadsheets/d/1DpgC__qjQmxrY1Mltm2OKl-tDn-1w4pFsSiKXZPV1ao/edit?usp=sharing'
}

const USERS = {
  ME: 'zl37@nyu.edu',
  YF: 'yz8212@nyu.edu'
};

function longLeadtimeItems() {
  let range = vendorCDLSheet.getRange(129, 1, vendorCDLSheet.getLastRow(), vendorCDLSheet.getLastColumn());
  let items = range.getValues().filter(items => items[0].length > 1);
  let averageLeadtime = vendorCDLSheet.getRange(1,10).getValue();

  Logger.log('The avarege lead time is %d', Math.round(averageLeadtime));

  
  let today = new Date();
  let inYear = today.getFullYear();
  let inMonth = today.getMonth() + 1;
  let ondDay = today.getDate();
  
  let trackingNotes = [];
  let vendorToScan = [];
  let waitingForPrint = [];
  
  for (let i = 0, n = items.length; i < n; i++) {
    let item = items[i];
    // Skip cancelled or physically arrived titles
    if (item[1] == 'Cancelled' || item[0] == 'CDL Silent') {
      continue;
    }

    /**
     * | Tracking Notes | ... | Order Date |	Scanning Vendor Payment Date |	PDF Delivery Date |
     * |     I 9        | ... |    M 13    |              N 14             |        O 15        |
     */ 

    // let req = item[12];
    // let reqYear = req.getFullYear();
    // let reqMonth = req.getMonth() + 1;
    // let reqDay = req.getDate();
    
    // Yet to send to scan
    if (item[13] === '') {// Not paid vendor yet (N)
      if (item[8] !== '') {// Has tracking note
        // Email YF or not?
        Logger.log('Have not paid vendor yet, at row %d. \nThe note is %s', i+129, item[8]);
        let tracked = {
          ORDERD    : item[11].toLocaleDateString(),
          TITLE     : item[5],
          ORDER_NUM : item[10],
          BARCODE   : item[9],
          TRACKINGN : item[8],
          LIBNOTES  : item[7]
        };
        trackingNotes.push(tracked);  
      } 
    } else {// Paid vendor: item[13] !== ''
      if (item[14] == '' && item[8] == '') {// but has NOT got PDF and has NO tracking note
        let paid = item[13]
        let paidYear = paid.getFullYear();
        let paidMonth = paid.getMonth() + 1;
        let paidDay = paid.getDate();

        if (inYear - paidYear >= 1) {// Paid in the past year(s)
          if (12 - paidMonth + inMonth > 1) {// and waiting for more than 2 month
            Logger.log('Waiting for PDF for over 1 month at row %d', i+129);
            let toscan = {
              ORDERD    : item[11].toLocaleDateString(),
              TITLE     : item[5],
              ORDER_NUM : item[10],
              BARCODE   : item[9],
              TRACKINGN : item[8],
              LIBNOTES  : item[7]
            };
            vendorToScan.push(toscan);
          } else if ((12 - paidMonth + inMonth == 1) && (31 - paidDay + ondDay > 30)) {// waiting for more than 1 month but not as long as 2
              Logger.log('Waiting for PDF for over 1 month at row %d', i+129);
              let toscan = {
                ORDERD    : item[11].toLocaleDateString(),
                TITLE     : item[5],
                ORDER_NUM : item[10],
                BARCODE   : item[9],
                TRACKINGN : item[8],
                LIBNOTES  : item[7]
              };
              vendorToScan.push(toscan);
          }
        } else if (inYear - paidYear == 0) { // Paid in the same year
            if ((inMonth - paidMonth > 1) && (31 - paidDay + ondDay > 30)) {
              Logger.log('Waiting for PDF over 1 month at row %d', i+129);
              let toscan = {
                ORDERD    : item[11].toLocaleDateString(),
                TITLE     : item[5],
                ORDER_NUM : item[10],
                BARCODE   : item[9],
                TRACKINGN : item[8],
                LIBNOTES  : item[7]
              };
              vendorToScan.push(toscan);
            }
        } else if (inYear - paidYear > 1) { // Waiting for over one year
            Logger.log('Waiting for scaning for over ONE year!');
        }
      }
    }
  }
  Logger.log('These are items with Tracking notes: ');
  Logger.log(trackingNotes);
  let header = `<p> A CDL order will be listed in this email if:\
  <ol>\
  <li>Scanning Vendor Payment Date remians empty for at least one month <em>or</em></li>\
  <li>Vendor got paid but PDF Delivery Date remians empty for at least one month</li>\
  </ol>\
  <p>The following CDL orders on <a href="${CDLINDEX.URL}">CDL Index</a> need your attention:</p>`;
  let withTrackingNotes = tableConstruct(trackingNotes, 'tracking');
  let yetToScan = tableConstruct(vendorToScan, 'scan');
  // let printYetToArrive = tableConstruct(waitingForPrint, 'print');
  let separator = '<p style="margin-top:20px">-----------------------------------</p>'
  let footer = '<p>You may want to copy the above table(s) and email Susan for updates.</p>\
  <p>You will receive the next such notificaiton one month from today.</p>\
  <p>See you then  ʕ·͡ᴥ·ʔ</p>';

  let body = header + withTrackingNotes + yetToScan + separator + footer;

  GmailApp.sendEmail(USERS.YF, 'Long Waiting CDL Orders', 'Placeholder text', {
    from: USERS.ME,
    name: 'Long-Waiting-CDL',
    // cc: USERS.ME,
    cc: USERS.ME + ',' + USERS.YF,
    htmlBody: body,
    noReply: true});

  Logger.log('Email norificiation sent for chekcing long-waiting orders!');
}

/**
 * Convert an object to table string in HTML
 */
function tableConstruct(checklist, checkType) {
  if (checklist.length < 1) {
    Logger.log('Found zero-length checklist. Skipping it ...');
    return '<br>';
  }
  let tableHeader = '<table border="1px" cellpadding="5px" style="border-collapse:collapse;border-color:#666;table-layout:fixed;width:1000px"><tbody>\
  <tr><th style="width:120px">Order Date</th>\
  <th style="width:120px">Order Number</th>\
  <th style="width:340px;word-wrap:break-word">Title</th>\
  <th style="width:210px">Library Notes</th>\
  <th style="width:210px">Tracking Notes</th></tr>';
  let rows = '';
  let subHeader = '';
  let footer = '</tbody></table>';
  switch(checkType) {
    case 'tracking':
    subHeader = '<p>Orders With Tracking Notes:</p>';
    for (let i = 0, n = checklist.length; i < n; i++) {
      rows += `<tr><td>${checklist[i].ORDERD}</td>\
      <td>${checklist[i].ORDER_NUM}</td>\
      <td>${checklist[i].TITLE}</td>\
      <td>${checklist[i].LIBNOTES}</td>\
      <td>${checklist[i].TRACKINGN}</td></tr>`;
    } 
    break;

    case 'scan':
    subHeader = '<p>Still waiting for PDF of the following orders:</p>';
    for (let i = 0, n = checklist.length; i < n; i++) {
      rows += `<tr><td>${checklist[i].ORDERD}</td>\
      <td>${checklist[i].ORDER_NUM}</td>\
      <td>${checklist[i].TITLE}</td>\
      <td>${checklist[i].LIBNOTES}</td>\
      <td>${checklist[i].TRACKINGN}</td></tr>`;
    }
    break;

    case 'print':
    subHeader = '<p>Physical Copies Yet To Arrive:</p>';
    for (let i = 0, n = checklist.length; i < n; i++) {
      rows += `<tr><td>${checklist[i].ORDERD}</td>\
      <td>${checklist[i].ORDER_NUM}</td>\
      <td>${checklist[i].TITLE}</td>\
      <td>${checklist[i].LIBNOTES}</td>\
      <td>${checklist[i].TRACKINGN}</td></tr>`;
    }
  }
  return subHeader + tableHeader + rows + footer;
}
