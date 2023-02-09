/*
 * Extract shared URLs from NYU52 circ copy folder,
 * based on the barcodes on the CDL File Index spreadsheet.
 * Barcodes are stored in the Col_8 (H);
 * shared URLs will be put in the Col_15(O).
 *
 * Files are divided into 2 catagories:
 * 1. Normal PDF file
 * 2. Folder-like file, which is a folder holding all the chapters/sections from a book
 *
 * Author: Errelin
 * Date: 2020-12-26
 */


function addCircFileUrl()
{
  var circUrl = (activeSheetName == 'CDL') ? circUrlVendorSheet : circUrlLocalSheet;
  // Logger.log('Now on the sheet: %s', activeSheetName);
  // Logger.log(circUrl);
  // Logger.log(circUrlVendorSheet);
  var sheet = (activeSheetName == 'CDL') ? vendorCDLSheet : localCDLSheet;
  var barcodes = (activeSheetName == 'CDL') ? vendorBarcodes : localBarcodes;

  // get a combined/merged hash table
  // otherwise the file obj will have null items which were indeed folders
  var fileBarcodeUrl = driveFileHashTable(circFiles);
  var fileFolderBarcodeUrl = driveFileHashTable(circFolders);

  var barcodeUrl = Object.assign(fileBarcodeUrl, fileFolderBarcodeUrl);

  // Logger.log(fileBarcodeUrl);


  // the original titles/barcodes arrays are NOT sorted
  // so binary search is impossible
  // to find each title, the barcodes array needs to be looped through
  // complexity: O(n^2)

  // below is a rather bold try: search barcode in a joined long "title string", instead of the opposite
  // by doing so, only the barcodes array will be looped through for once only
  // complexity: O(n)
  var allBarcodes = Object.keys(fileBarcodeUrl).join('|')
                        + '|'
                        + Object.keys(fileFolderBarcodeUrl).join('|');
  // Logger.log(Object.keys(fileBarcodeUrl).length);
  // Logger.log(Object.keys(fileFolderBarcodeUrl).length);
  // Logger.log(allBarcodes);

  try {
    // Loop through files/folders first
    urlExtracter(barcodeUrl, barcodes, allBarcodes, circUrl, sheet)

    // then loop through folder-file
    // urlExtracter(barcodeUrl, barcodes, allBarcodes, circUrl, sheet)
  } catch (e) {
    Logger.log(e);
  }
}


function urlExtracter(biblio, barcodesArray, barcodeSearchAgainst, urlArray, targetSheet)
{
  for (var i = 0, n = barcodesArray.length; i < n; i++) {
    // skip over titles that already have urls or have not got a barcode yet
    if (urlArray[i].search('google') > 0 || barcodesArray[i].length < 4) {
      // Logger.log('This title already with url or w/out a barcode yet: %s', vendorTitles[i]);
      continue;
    } else {
      // check if the file name contains the current barcode
      // if not => not matched => next barcode
      if (barcodeSearchAgainst.search(barcodesArray[i]) == -1) {
        Logger.log('No such file %s with the given barcode: %s. Order for this title probably got cancelld. Check row %d for more info.', vendorTitles[i], barcodesArray[i], i+2);
        continue;
      } else {
        // matched
        Logger.log('Found file %s with the given barcode: %s', biblio[barcodesArray[i]]['filename'], barcodesArray[i]);
        Logger.log('Its URL is: %s', biblio[barcodesArray[i]]['url']);
        targetSheet.getRange(i+2, 15).setValue(biblio[barcodesArray[i]]['url']);
      }
    }
  }
  return 'DONE';
}

function driveFileHashTable(fileOrFolderIterator) {
  var barcodeUrl = {};
  while (fileOrFolderIterator.hasNext()) {
    // loop through the interator
    var file = fileOrFolderIterator.next();
    var filename = file.getName();
    var fileurl = file.getUrl().endsWith('drivesdk') ? file.getUrl().replace('drivesdk', 'sharing') : file.getUrl() + '?usp=sharing';


    /*
     * somehow about a half of the files/folders,
     * failed to match the pattern,
     * thouhg the names look perfectly right!
     * so I have to concatanate all filenames instead.
     * Thank you JavaScript!
     */
    // if (barcodePattern.test(filename)) {
   barcodeUrl[filename.slice(0, filename.search('_'))] = {'filename': filename,
   'url': fileurl};
    /* turn fileIterator into a hash table
    * {
    *   { 'barcode': {filname: filename, url: url} },
    *     ...
    *  }
    */
    // } else {
    //   Logger.log('%s failed to match the barcode pattern.', filename);
    // }
  }
  return barcodeUrl;
  // Logger.log(barcodeUrl);
}
