/*
 * There are two types of barcodes for CDL files:
 * 1. temporary, 10-digit long, e.g.: 7183459-10
 * 2. permanent, 14-digit long, e.g.: 31124063877456
 *
 * When a CDL file is ready, its barcode is very likely to be the 1st one.
 * And a while later it will be updated in catalog to become the 2nd type.
 * When such a change is made, it will be also sync-ed on the tracking and index spreadsheet.
 * However, it will NOT be sync-ed to the CDL filenames in the Drive.
 * This script tries to solve the problem and reduce the manual work of sync-ing to zero.
 *
 * Author: Errelin
 * Date: 2021-3-23
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
  if (vendorBarcodeColHeader !== 'Barcode') {
    Logger.log('Barcode Column moved! Execution terminated to protect the original data!');
    return
  }

  // get a combined/merged hash table
  // otherwise the file obj will have null items which were indeed folders
  var fileBarcodeUrl = driveFileHashTable(circFiles);
  var fileFolderBarcodeUrl = driveFileHashTable(circFolders);
  var barcodeUrl = Object.assign(fileBarcodeUrl, fileFolderBarcodeUrl);
  var barcodes = vendorBarcodes;
  var logSwitch = 0;

  // loop through barcodes and find those that differ from files
  for (var i = 0, n = barcodes.length; i < n; i++) {
    // if no barcode or circUrl; then the circ copy has not been uploaded yet; skip over
    if ((barcodes[i].length < 5) || (barcodes[i] > 5 && circUrlVendorSheet[i] == '')) {
      // Logger.log('No barcode or no vendor file block gets executed');
      Logger.log(
        'File at row %d has not been uploaded to Drive or the order was cancelled.\nFile title is %s',
        i+2,
        vendorTitles[i]
        );
    }
    // if circUrl, barcode exits on sheet, but barcode not in drive, then update the barcode in drive using that on sheet
    // TODO: may need to extend barcode length to 14 digits
    if (circUrlVendorSheet[i] != '' && barcodes[i].length > 5 && barcodeUrl[barcodes[i]] == undefined) {
      var fileType = (circUrlVendorSheet[i].search(/file\/d/) > 0) ? 'file' : 'folder';
      var fileOrFolderId = circUrlVendorSheet[i].match(/[-\w]{25,}/);
      logSwitch++;
      // Logger.log('Barcode file block gets executed');

      if (fileType == 'file') {
        var file = DriveApp.getFileById(fileOrFolderId);
        var oldFilename = file.getName();
        Logger.log('Found updated barcode %s at row %d', barcodes[i], i+2);
        Logger.log('Old filename is %s', oldFilename);

        // update filename
        var newFilename = updateFileOrFolder(oldFilename, barcodes[i]);
        file.setName(newFilename);
        Logger.log('Barcode updated and now filename is %s', newFilename);
      } else if (fileType == 'folder') {
        // loop through files under the folder
        Logger.log('Found updated barcode %s at row %d. Start updating ... ', barcodes[i], i+2);

        var fileFolder = DriveApp.getFolderById(fileOrFolderId);
        var splittedChapters = fileFolder.getFiles();

        // first update chapters' barcodes
        var chapterCounter = 0;
        while (splittedChapters.hasNext()) {
          var chapterFile = splittedChapters.next();
          chapterCounter += 1;

          var oldChapterName = chapterFile.getName();
          var newChapterName = updateFileOrFolder(oldChapterName, barcodes[i]);
          chapterFile.setName(newChapterName);

        }
        // then update the folder's barcode
        var oldFolderName = fileFolder.getName();
        var newFolderName = updateFileOrFolder(oldFolderName, barcodes[i]);

        fileFolder.setName(newFolderName);
        Logger.log('Folder barcode upated and now is %s', newFolderName);
        Logger.log('Updated %d chapters in total under the folder.', chapterCounter);
      }
    } else continue;
  }
  if (logSwitch <= 0) { Logger.log('There is nothing to update.') }
}

function updateFileOrFolder(origFilOrFoldereName, newPart)
{
  return origFilOrFoldereName.replace(origFilOrFoldereName.slice(0, origFilOrFoldereName.search('_')), newPart);
}