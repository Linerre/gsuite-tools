const AUTO_EXP = {
  ID    :  '1sobA_LCjtpbsLqNr-ID6rbsFDGFryIw-RiKY3seaYOo',
  SHEET : {NAME: 'Sheet1', INDEX: 0},
};

// let COLS = {
//     FILEURL  :  1,
//     DUETIME  :  2,
//     STATUS   :  3,
//     FILENAME :  4,
//     BARCODE  :  5,
//     PATRON   :  6, // email
//     PATRONLEV:  7, // staff, faculty, student
//     COLL     :  8,
//     STAFF    :  9,
//     IPS      :  10, // should use the translated human-readable one
//     ALEPH    :  11, // operations, either of Chekc out or Check in
//     PRODATE  :  12  // date of last processing
// }

function recordLoan(fileUrl, dueDate, fileName, barcode, patronEmail, coll, staff) {
  let autoSs = SpreadsheetApp.openById(AUTO_EXP.ID);
  let loanSht = autoSs.getSheetByName(AUTO_EXP.SHEET.NAME);
  let today = new Date();
  let record = [[fileUrl, dueDate, '', fileName, barcode, patronEmail, 
                '', coll, staff, 'CDL', '', 'Checked Out', today.toLocaleDateString()]];

  // write url to the first col
  loanSht.getRange(loanSht.getLastRow()+1, 1, 1, 13).setValues(record);
}
