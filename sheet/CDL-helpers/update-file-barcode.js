/*
 * There are two types of barcodes for CDL files:
 * 1. temporary, 10-digit long: 7183459-10
 * 2. permanent, 14-digit long: 31124063877456
 * 
 * When a CDL file is ready, its barcode is very likely to be the 1st one.
 * And a while later it will be updated in catalog to become the 2nd type. 
 * When such a change is made, it may be updated manually on the index spreadsheet.
 * However, it will NOT be sync-ed to the CDL filenames in the Drive.
 * This script tries to solve the problem and reduce the manual work of sync-ing.
 *
 * Author: Errelin <zl37@nyu.edu>
 * Date: 2023-02-09
 */

function updateFileBarcode() 
{
  /** Rely on barcodes rather than filenames because:
   * 1. Filenames are given rather arbitrarily;
   * 2. Even for the same book, its filename on the spreadsheet differs from that in the drive.
   * 
   * Algorithm:
   * for each_barcode on the_spreadsheet
   *  if (current_barcode_on_spreadsheet !exists in the_drive)
   *    skip;
   *  if (current_barcode_on_spreadsheet != old_barcode_in_filename)
   *    replace old_barcode with current_barcode;
   *    next loop;
   **/

  // In case the linked source spreasheet gets changed (say, one more col is inserted)
  if (!vendorBarcodeColHeader.startsWith('Barcode')) {
    Logger.log('Barcode Column moved! Execution terminated to protect the original data!');
    return
  }

  // Get a combined/merged hash table
  // otherwise the file obj will have null items which were indeed folders
  let fileTable = createIdFileTable(circFiles);
  let folderTable = createIdFileTable(circFolders);
  let idFileTable = Object.assign(fileTable, folderTable);
  let barcodes = vendorBarcodes;
  let logSwitch = 0;

  // for (i = 0; i < 10; i++) {
  //   if (idFileTable[barcodes[i]]) {
  //     Logger.log(idFileTable[barcodes[i]])
  //   } else {
  //     Logger.log((idFileTable[barcodes[i]]) && true)
  //     Logger.log(barcodes[i])
  //   }
  // }

  // loop through barcodes and find those that differ from files
  for (let i = 0, n = barcodes.length; i < n; i++) {
    // if no barcode or circUrl; then the circ copy has not been uploaded yet; skip over
    if ((barcodes[i].length < 5) || (barcodes[i] > 5 && (circUrlVendorSheet[i] == '' || circUrlVendorSheet[i] == '/' || circUrlVendorSheet[i] == ' '))) {
      // Logger.log('No barcode or no vendor file block gets executed');
      Logger.log(
        'File at row %d has not been uploaded to Drive or the order was cancelled. \nIt could also be a DVD.\nFile title is %s', 
        i+3, 
        vendorTitles[i]
        );
    }
    // BUG: This ID is extracted from the file URL, which is not checked in nay way. 
    // It could be of files stored in Original folder, other than Circ, thus
    // causing original files to be renamed by mistake! 
    let fileOrFolderId = circUrlVendorSheet[i].match(/[-\w]{25,}/);

    // SOLUTION: Barcodes cannot be used due to the above bug. Use fileId (unique) instead.
    // Even when a file's barcode gets updated on the sheet, its fileid wont, and can be used to check file identity!
    if (idFileTable[fileOrFolderId]) {
      // This means the file exists in Circ folder
      let correctBarcode = idFileTable[fileOrFolderId]['barcode'];
      if (circUrlVendorSheet[i].length > 10 && barcodes[i].length > 5 && barcodes[i] != correctBarcode) {
        let fileType = (circUrlVendorSheet[i].search(/file\/d/) > 0) ? 'file' : 'folder';
        logSwitch++;
        // Logger.log('Barcode file block gets executed');

        if (fileType == 'file') {
          let file = DriveApp.getFileById(fileOrFolderId);
          let oldFilename = file.getName();
          Logger.log('Found updated file barcode %s at row %d', barcodes[i], i+3);
          Logger.log('Old filename is %s', oldFilename);

          // update filename
          let newFilename = updateFileOrFolder(oldFilename, barcodes[i]);
          file.setName(newFilename);
          Logger.log('Barcode updated and new filename is %s', newFilename);
        } else if (fileType == 'folder') {
          // loop through files under the folder
          Logger.log('Found updated folder barcode %s at row %d. Start updating ... ', barcodes[i], i+3);

          let fileFolder = DriveApp.getFolderById(fileOrFolderId);
          let splittedChapters = fileFolder.getFiles();

          // first update chapters' barcodes
          let chapterCounter = 0;
          while (splittedChapters.hasNext()) {
            let chapterFile = splittedChapters.next();
            chapterCounter += 1;

            let oldChapterName = chapterFile.getName();
            let newChapterName = updateFileOrFolder(oldChapterName, barcodes[i]);
            chapterFile.setName(newChapterName);

          }
          // then update the folder's barcode
          let oldFolderName = fileFolder.getName();
          let newFolderName = updateFileOrFolder(oldFolderName, barcodes[i]);

          fileFolder.setName(newFolderName);
          Logger.log('Folder barcode upated and now is %s', newFolderName);
          Logger.log('Updated %d chapters in total under the folder.', chapterCounter);
        }
      } else continue;
    } else {
      // This means the file doesnt exist in Circ folder, and very likely it is in Original one!
      Logger.log(
        'File at row %d is VERY likely an Orignal Copy! \nCheck its Google URL First! \nFile title is %s', 
        i+3, 
        vendorTitles[i]
        );
    }
  }
  if (logSwitch <= 0) { Logger.log('There is nothing to update.') }
}

function createIdFileTable(fileOrFolderIterator) {
  let idFileTable = {};
  while (fileOrFolderIterator.hasNext()) {
    // loop through the interator
    let file = fileOrFolderIterator.next();
    let filename = file.getName();
    let fileurl = file.getUrl().endsWith('drivesdk') ? file.getUrl().replace('drivesdk', 'sharing') : file.getUrl() + '?usp=sharing';
    let fileid = file.getId(); // to avoid two same-barcode files but in different folders

    /*
     * Somehow about a half of the files/folders,
     * failed to match the pattern,
     * thouhg the names look perfectly right!
     * so I have to concatanate all filenames instead.
     * Thank you JavaScript!
     *  turn fileIterator into a hash table
     * {
     *   { 'fileid': {filname: filename, url: url, fileid: id, barcode: barcode} },
     *     ...
     * }
     */
    // if (barcodePattern.test(filename)) {
   idFileTable[fileid] = {
     'barcode': filename.slice(0, filename.search('_')), 
     'filename': filename,
     'url': fileurl,
     'id': fileid
   };
  }
  return idFileTable;
  // Logger.log(idFileTable);
}

function updateFileOrFolder(origFilOrFoldereName, newPart)
{
  return origFilOrFoldereName.replace(origFilOrFoldereName.slice(0, origFilOrFoldereName.search('_')), newPart);
}
