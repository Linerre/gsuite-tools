/*
 * Global vars of sheets for various functions spread through
 * the `.gs` scripts below the current one
 *
 * Author: Errelin
 * Date: 2021-03-23
 *
 */

// Circ Files Folder
const circFilesFolder = DriveApp.getFolderById('sheetID');

// file Or Folder Iterator
var circFiles = circFilesFolder.getFiles();
var circFolders = circFilesFolder.getFolders();

// Vendor CDL Sheet
const vendorCDLSheet = SpreadsheetApp.openById('sheetID').getSheetByName('CDL');

// Local CDL Sheet
// const localCDLSheet = SpreadsheetApp.openById('sheetID').getSheetByName('Local CDL');

// Currently Active Sheet
var activeSheetName = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet().getName();

// this lastRow reaches 200 which all contain formulas
// so even empty cells get counted as well
var lastRowVendor = vendorCDLSheet.getLastRow();
// var lastRowLocal = localCDLSheet.getLastRow();

// Get F=7 column of titles
// Note that here lastRow is safe since empty title means empty row
var vendorTitles = vendorCDLSheet.getRange(3, 7, lastRowVendor - 1).getValues().filter(t => t[0].length > 0);
// var localTitles = localCDLSheet.getRange(3, 7, lastRowLocal - 1).getValues().filter(t => t[0].length > 0);

// this is the real last row, the row that holds a title
var realVendorLastRow = vendorTitles.length;
// var realLocalLastRow = localTitles.length;

// get E=5 column of available dates
var vendorAvailableDates = vendorCDLSheet.getRange(3, 5, realVendorLastRow).getValues();
// var localAvailableDates = localCDLSheet.getRange(3, 5, realLocalLastRow).getValues();

// Get J=10 column of barcodes
// note that barcodes with strikthrough will be counted as well
// filtering empty cells risk losing those that are going to be filled in
// instead, set the lastRow var wisely and dynamically accoridng to num of titles
var vendorBarcodeColHeader = vendorCDLSheet.getRange(2, 10).getValue();
var vendorBarcodes = vendorCDLSheet.getRange(3, 10, realVendorLastRow).getValues().map(b => b[0].toString());
// var localBarcodes = localCDLSheet.getRange(3, 10, realLocalLastRow).getValues().map(b => b[0].toString());

// Get J=10 column of bobcat links
var vendorBobcatUrl = vendorCDLSheet.getRange(3, 13, realVendorLastRow).getValues().map(b => b[0]);
// var localBarcodes = localCDLSheet.getRange(3, 13, realLocalLastRow).getValues().map(b => b[0]);
// Get K=11 column of vendor links
// not applicable to local CDL
var vendorFileUrl = vendorCDLSheet.getRange(3, 11, realVendorLastRow).getValues().map(b => b[0]);

// Get E=5 column of circ copy url
var circUrlVendorSheet = vendorCDLSheet
                        .getRange(3, 5, realVendorLastRow)
                        .getValues()
                        .map(u => u[0]);
// var circUrlLocalSheet = localCDLSheet
//                         .getRange(3, 5, realLocalLastRow)
//                         .getValues()
//                         .map(u => u[0]);

// barcode pattern; may be unnecessary
var barcodePattern = /[0-9]{5,}/gm;

function myLogger() {
  Logger.log(lastRowVendor);
  Logger.log(realVendorLastRow);

}
