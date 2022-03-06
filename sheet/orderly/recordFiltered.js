/**
 * If found any orders that need double checking with Susan,
 * in addition to creating a draft containing the orders info,
 * record them on "Email Susan" sheet as well
 * 
 * Author: Errelin
 * Last Change: 2022-03-06
 */


function recordEmailSusanOrders (noncdl, cdled) {
  /**
   * Copy specific cols from items from Books to Email Susan
   * INPUT: [[order1], [order2], [order3], ... []]
   * OUTPUT: [[Title], [Order Num], [Create Date], [IPS],
   *           ........................................ ]
   */
  Logger.log('Start setting up Email headers ...')
  // Setting up timestamp
  let today = new Date();
  emailSht.getRange(lastTimeLeftAt+2,1).setValue('Email sent ' + today.toLocaleDateString());
  emailSht.getRange(lastTimeLeftAt+2,1).setFontWeight('Bold');

  // Setting up Email headers
  emailSht.getRange(lastTimeLeftAt+3,1).setValue('1st Prioritize: Non-CDL titles').setFontWeight('bold');
  emailSht.getRange(lastTimeLeftAt+3,1,1,4).mergeAcross().setHorizontalAlignment('center');
  
  emailSht.getRange(lastTimeLeftAt+3,6).setValue('2nd Prioritize: CDL titles').setFontWeight('bold');
  emailSht.getRange(lastTimeLeftAt+3,6,1,5).mergeAcross().setHorizontalAlignment('center');

  if (noncdl.length > 0) {
    // Setting up order headers
    Logger.log('Start setting up headers for Non-CDL orders ...')
    emailSht.getRange(lastTimeLeftAt+4,1,1,5).setValues([['Title','Order number','Order Create Date','IPS', 'Note']])
    .setFontWeight('Bold');

    Logger.log('Start copying need-to-check Non-CDL orders ...')
    for (let i = 0, n = noncdl.length; i < n; i++) {
      emailSht.getRange(lastTimeLeftAt+i+5,1,1,4).setValues([noncdl[i][0], noncdl[i][1], noncdl[i][2], noncdl[i][9]]);
    }
    Logger.log('Start highlighting IPS of Non-CDL orders ...')
    highlightOR(emailSht, lastTimeLeftAt, 1, 4);
  } else {
    Logger.log('No new non-CDL orders need checking with Susan this week.\nLeaving a note on the Susan sheet...')
    emailSht.getRange(lastTimeLeftAt+5,1,1,1).setValue('No new Non-CDL orders need checking with Susan this week')
    .setFontColor('#34a853').setFontWeight('bold');
  }

  if (cdled.length > 0) {
    Logger.log('Start setting up headers for Non-CDL orders ...')
    emailSht.getRange(lastTimeLeftAt+4,6,1,6).setValues([['Title','Order number','Order Create Date','CDLed (Y/N/--)','IPS','Note']])
    .setFontWeight('Bold');

    Logger.log('Start copying need-to-check CDL orders ...')
    for (let i = 0, n = cdled.length; i < n; i++) {
      emailSht.getRange(lastTimeLeftAt+i+5,6,1,5).setValues([[cdled[i][0], cdled[i][1], cdled[i][2], cdled[i][3],cdled[i][9]]]);
    }
    Logger.log('Start highlighting IPS of CDL-ed orders ...')
    highlightOR(emailSht, lastTimeLeftAt, 6, 10);
  } else {
    Logger.log('No new CDL-ed orders need checking with Susan this week.\nLeaving a note on the Susan sheet...')
    emailSht.getRange(lastTimeLeftAt+5,6,1,1).setValue('No new CDL-ed orders need checking with Susan this week')
    .setFontColor('#34a853').setFontWeight('bold');
  }
}
    
  
    
function highlightOR(sheet, startRow, fromCol, toCol) {
  let targetRange = sheet.getRange(startRow+5, fromCol, sheet.getLastRow(), toCol);
  let targetValues = targetRange.getValues();
  let targetValuesNum = targetValues.length;

  /**
   * Two possibilities: 
   * 1. Non CDL titles: 5 cols and highlight the 4th col
   * 2. Yet to ship CDL-ed titles: 6 cols and highlight the 5th col 
   * */
   
  for (var i = 0; i < targetValuesNum; i++) {
    if (toCol == 4) {
      if (targetValues[i][0] !== '' && targetValues[i][toCol-1] == 'OR') {
        sheet.getRange(startRow+5+i, toCol).setBackground('magenta');
        Logger.log('Found IPS %s at row %d', targetValues[i][toCol-1], startRow+5+i);
      } else if (targetValues[i][0] !== '' && targetValues[i][toCol-1] == '') {
        sheet.getRange(startRowpos+5+i, toCol).setBackground('yellow');
        Logger.log('Found empty IPS at row %d', startRow+5+i);
      }
    } 

    if (toCol == 10) {
      if (targetValues[i][0] !== '' && targetValues[i][toCol-6] == 'OR') {
        sheet.getRange(startRow+5+i, toCol).setBackground('magenta');
        Logger.log('Found IPS %s at row %d', targetValues[i][toCol-6], startRow+5+i);
      } else if (targetValues[i][0] !== '' && targetValues[i][toCol-6] == '') {
        sheet.getRange(startRow+5+i, toCol).setBackground('yellow');
        Logger.log('Found empty IPS at row %d', startRow+5+i);
      }
    }
  }
}
