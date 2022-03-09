// @ts-nocheck
/**
 * Filter out unnecessary rows and copy the needed to 'Email Susan' Sheet
 * 
 * Author: Errelin
 * Last Change: 2022-03-09
 */


const ss = SpreadsheetApp.openById(SHIPFIRST.ID);
const booksSht = ss.getSheetByName('Books');
const emailSht = ss.getSheetByName('Email Susan');
let lastTimeLeftAt = emailSht.getLastRow();

function filterCDLs () {
  // Get all the data on Books sheet
  // [[order1], [order2], ... [orderN]]
  let items = booksSht.getRange(5,1,booksSht.getLastRow() - 4, booksSht.getLastColumn()).getValues();
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
  Logger.log('Successfully filtered orders');

  // Start checking and generating reports 
  Logger.log('Start constructing table body for non CDL titles ....');
  let nonCDL = checkDup(nonCDLItems,5);
  let nonCDLRep = bodyTable(nonCDL, false); // could be <br>

  Logger.log('Start constructing table body for CDL-ed titles ....');
  let cdled = checkDup(cdledItems,6);
  let cdledRep = bodyTable(cdled, true); // could be <br>

  draftMaker([nonCDLRep, cdledRep], USERS.YF, USERS.NB);
  Logger.log('Constructing DONE! Draft ready!');
  
  Logger.log('Start recording orders on Email Susan sheet ...')
  recordEmailSusanOrders(nonCDL, cdled);
  
  Logger.log('DONE! Check out Susan sheet')
  let cdlCheckResult = checkCDLIndex(cdled); // get a table about CDL Index
  return cdlCheckResult;

}

/**
 * Check if the filtered orders have the same item as those of last week 
 */
function checkDup (items, colNum) {
  // let emailSht = ss.getSheetByName('Email Susan');
  // let lastTimeLeftAt = emailSht.getLastRow();
  let existing;
  let emailSusan = [];

  // Merged cells will be treated as an array with the same width/len as other rows in the range
  // For example: [Email sent 11/15/2021, , , , ]
  // Exisiting order numers: array ['NYUSHXXXX', .... , 'NYUSHYYYY']
  existing = colNum == 5 ? 
  emailSht.getRange(1,1,lastTimeLeftAt,5).getValues().filter(r => r[1].startsWith('NYUSH')).map(r => r[1]) : 
  emailSht.getRange(1,6,lastTimeLeftAt,6).getValues().filter(r => r[1].startsWith('NYUSH')).map(r => r[1]);
  
  Logger.log('Already emailed Susan: ');
  Logger.log(existing);

  // compare Col2 == orderNum
  for (let i = 0, n= items.length; i < n; i++) {
    if(existing.includes(items[i][1])) {
      continue;
      // Logger.log('Found existing order number %s', items[i][1]);
    } else {
      Logger.log('Found need-to-check order %s, adding it to the list ...', items[i][1]);
      emailSusan.push(items[i]);
    }
  }

  // [[order1], [order2], ... [orderN]]
  if (emailSusan.length > 0) {
    // In this case, drop an draft to YF gmail
    if (colNum == 5) {
      Logger.log('The following Non CDL orders need double checking with Susan');
      Logger.log(emailSusan);
      // TODO: write emailSusan to Email Susan Sheet 
    } else if (colNum == 6) {
      // Find the row of these titles on CDL sheet as well
      Logger.log('The following CDL-ed orders need double checking with Susan');
      Logger.log(emailSusan);
    }  
  } else {
    // In this case, toast a message? and put a line on the sheet?
    Logger.log('No new orders need double checking with Susan');
  }
  return emailSusan; 
}

// Take body text, add headers, footers, make a draft
function draftMaker (bodyList, fromWhom, toWhom) {
  let greetingText;
  let closingText;
  let emailBody;

  if (bodyList[0] == '<br>' && bodyList[1] == '<br>') {
    emailBody = '<p>There are no orders need chekcing with Susan this week.</p>';  
  } else {
    greetingText = '<p>Hello Susan, </p><p>Could you please help check the following orders? Thank you.</p>';
    closingText = '<p>Best regards,<br>Yifei<p>';
    emailBody = greetingText + bodyList.join('<br>') + closingText;
  }

  let drafts = GmailApp.getDrafts();
  if (drafts.length == 0) { // If no drafts at all, create one
    GmailApp.createDraft(toWhom, 'Orders to Check', 'Placeholder Text', {from: fromWhom, htmlBody: emailBody});
  } else {
    let counter = 0; // User may have some drafts but none of them has a subject like 'Orders to Check'
    for (let i = 0, n = drafts.length; i < n; i++) {
      if (drafts[i].getMessage().getSubject() == 'Orders to Check') {
        Logger.log('Found old draft, updating ...')
        drafts[i].update(toWhom, 'Orders to Check', 'Placeholder Text', {from: fromWhom, htmlBody: emailBody})
        counter += 1;
        break;
      }
    }
    if (counter == 0) { // If no such drafts as above, create one
      GmailApp.createDraft(toWhom, 'Orders to Check', 'Placeholder Text', {from: fromWhom, htmlBody: emailBody});
    }
  } 
}

function bodyTable (checklist, cdled) {
  /**
   * INPUT: [[order1], [order2], [order3], ... [ordern]], true/false
   * OUTPUT: a string represents a table in HTML 
   * For non CDL titles
   * TITLE | ORDER_NUM | CREATE DATE | IPS | NOTE 
   *  
   * For CDL-ed titles
   * TITLE | ORDER_NUM | CREATE DATE | CDL-ed | IPS | NOTE 
  */
  if (checklist.length == 0) {
    Logger.log('There is not item in the checklist.\The body constructor terminates now.')
    return '<br>';
  }

  let tableHeader = cdled ? 
  '<table border="1px" cellpadding="5px" style="border-collapse:collapse;border-color:#666;table-layout:fixed;width:900px">\
  <tbody><tr>\
  <th>Title</th>\
  <th>Order Num</th>\
  <th>Order Create Date</th>\
  <th>CDL-ed(Y/N/--)</th>\
  <th>IPS</th><th>NOTE</th></tr>' : 
  '<table border="1px" cellpadding="5px" style="border-collapse:collapse;border-color:#666">\
  <tbody><tr>\
  <th>Title</th>\
  <th>Order Num</th>\
  <th>Order Create Date</th>\
  <th>IPS</th>\
  <th>NOTE</th></tr>';  
  let colNum = cdled ? 6 : 5;
  

  // empty string
  let rows = '';
  if (colNum == 5) {
    // Non CDL titles
    for (let i = 0, n = checklist.length; i < n; i++) {
      if (checklist[i][9].trim() == 'OR') {
        rows += `<tr><td style="width:450px;word-wrap:break-word">${checklist[i][0]}</td><td>${checklist[i][1]}</td>\
        <td>${checklist[i][2].toString()}</td><td style="background-color:#FF00FF">${checklist[i][9]}</td><td></td></tr>`;
      } else {
        rows += `<tr><td style="width:450px;word-wrap:break-word">${checklist[i][0]}</td><td>${checklist[i][1]}</td>\
        <td>${checklist[i][2].toString()}</td><td>${checklist[i][9]}</td><td>${checklist[i][14]}</td></tr>`;
      }
    }
    let emailHeader = '<p><strong>1st Prioritize: Non-CDL titles</strong><p>';
    let tableFooter = '</tbody></table>';
    let table = emailHeader + tableHeader + rows + tableFooter;
    return table;
  } 
  
  if (colNum == 6) {
    // CDL-ed titles
    for (let i = 0, n = checklist.length; i < n; i++) {
      if (checklist[i][9].trim() == 'OR') {
        rows += `<tr>\
        <td style="width:450px;word-wrap:break-word">${checklist[i][0]}</td>\
        <td>${checklist[i][1]}</td>\
        <td>${checklist[i][2].toString()}</td>\
        <td>${checklist[i][3]}</td>\
        <td style="background-color:#FF00FF">${checklist[i][9]}</td>\
        <td>${checklist[i][14]}</td></tr>`;
      } else {
         rows += `<tr>\
         <td style="width:450px;word-wrap:break-word">${checklist[i][0]}</td>\
         <td>${checklist[i][1]}</td>\
         <td>${checklist[i][2].toString()}</td>\
         <td>${checklist[i][3]}</td>\
         <td>${checklist[i][9]}</td>\
         <td>${checklist[i][14]}</td></tr>`;
      }
    }
    let emailHeader = '<p><strong>2nd Prioritize: CDL titles</strong><p>';
    let tableFooter = '</tbody></table>';
    let table = emailHeader + tableHeader + rows + tableFooter;
    return table;
  }
}

function checkCDLIndex (checklist) {
  if (checklist.length < 1) {
    Logger.log('No CDL orders need checking this week');
    return '<br>';
  }
  let cdlIndexSht = SpreadsheetApp.openById(CDLINDEX.ID).getSheetByName(CDLINDEX.VEND.NAME);
  let orderNumsIndex= cdlIndexSht.getRange(3,11,cdlIndexSht.getLastRow() - 2, 1).trimWhitespace().getValues().filter(c => c[0].length > 0).map(c => c[0]);
  let tableHeader = '<table border="1px" cellpadding="5px" style="border-collapse:collapse;border-color:#666;table-layout:fixed;width:900px">\
  <tbody><tr>\
  <th>Row</th>\
  <th>Title</th>\
  <th>Order Num</th>\
  <th>Order Create Date</th>\
  <th>CDL-ed(Y/N/--)</th>\
  <th>IPS</th>\
  <th>NOTE</th></tr>';
  let rows = '';
  let tableFooter = '</tbody></table>';

  for (let i = 0, n = checklist.length; i < n; i++) {
    if (orderNumsIndex.includes(checklist[i][1].trim())) {
      Logger.log('Found this title on CDL Index at row %d', orderNumsIndex.indexOf(checklist[i][1]) + 3);
      rows += `<tr>\
      <td>${orderNumsIndex.indexOf(checklist[i][1]) + 3}</td>\
      <td style="width:450px;word-wrap:break-word">${checklist[i][0]}</td>\
      <td>${checklist[i][1]}</td><td>${checklist[i][2]}</td>\
      <td>${checklist[i][3]}</td>\
      <td style="background-color:yellow">${checklist[i][9]}</td>\
      <td></td></tr>`;
    }
  }
  return tableHeader + rows + tableFooter;
}
