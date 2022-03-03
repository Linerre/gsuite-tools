function loanCDL(trow, netid, staff, coll, dueDate) {
  let fileUrl = vendorCDLSheet.getRange(trow, 5).getValue();
  let title = vendorCDLSheet.getRange(trow, 6).getValue();
  let barcode = vendorCDLSheet.getRange(trow, 10).getValue();
  let author = vendorCDLSheet.getRange(trow, 19).getValue();

  let dueTime = " 18:00";
  // let fileIdPat = fileUrl.match(/[-\w]{25,}|[-\d]{10}/);
  let fileIdPat = fileUrl.match(/[-\w]{25,}/);
  let fileId = fileIdPat.length == 1 ? fileIdPat[0] : null;
  if (!fileId) {
    Logger.log('Failed to match any file ID.');
    return null;
  };
  
  let fileName = DriveApp.getFileById(fileId).getName();
  let patronEmail = netid + "@nyu.edu";

  Logger.log('The title to check out is at row %d', trow); 
  Logger.log('The file name is %s', fileName);
  Logger.log('The item belongs to %s collection', coll);
  Logger.log('The title to check out to %s', patronEmail); 
  Logger.log('The operation is done by %s', staff); 
  Logger.log(fileIdPat);
  Logger.log('Start checking out the item to patron %s', netid);

  
  updateFilePermission(netid, fileId);

  
  notifyPatron(patronEmail, title, author, fileUrl, dueDate + dueTime);
  recordLoan(fileUrl, dueDate + dueTime, fileName, barcode, patronEmail, coll, staff);

  Logger.log('DONE! Due date is %s', dueDate + dueTime);
  
}

function updateFilePermission(userinfo, fileId) {
  // Dirve API changed a LOT!
  // See https://developers.google.com/drive/api/v3/reference/permissions
  Drive.Permissions.insert(
    {
      "role"                   : "reader",
      "type"                   : "user",
      "value"                  : `${userinfo}@nyu.edu`
    }
    ,
    fileId,
    {
      "supportsAllDrives"      : true,
      "sendNotificationEmails" : false,
    });
}

// Author info needed in the email template
function notifyPatron(patronEmail, title, author, cdlUrl, dueTimeStr) {
  let recipient = patronEmail;
  let subject = 'Your Library Request is Available Electronically';
  let body = '<p>Hello, </p><p>In reference to the following request:</p>';
      body += `<p>Title: <i> ${title} </i><br>Author: ${author}</p>`;
      body += '<p>Due to Covid-19, in lieu of shipping the physical book from overseas, this material has been digitized for your personal use and scholarship. <br>Please note that <b>sharing, copying, and/or printing this file is prohibited per digital loan restrictions</b>, and these features have been disabled.<p>';
      body += `<p> ${cdlUrl} </p>`;
      body += `<p>Your access to this file will end on <b>${dueTimeStr}</b> (China Standard Time).</p>`;
      body += '<p>Please note that all loans are subject to recall, which will shorten the loan period.</p>\
      <p>If you have any questions or concerns, feel free to contact us at <a href="mailto:shanghai.circulation@nyu.edu">shanghai.circulation@nyu.edu</a></p><br>\
      <p>Best regards,<br>NYU Shanghai Library Access Services</p>';
      
  Logger.log(body);
  MailApp.sendEmail(recipient, subject, '', {cc: 'shanghai.circulation@nyu.edu', htmlBody: body, noReply: true});
}

function toast() {
  SpreadsheetApp.openById('1DpgC__qjQmxrY1Mltm2OKl-tDn-1w4pFsSiKXZPV1ao').toast('Item checked out successfully!');
}
