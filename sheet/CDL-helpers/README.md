# CDL Helpers
A series of scripts that automate the CDL procedure, including batch fetching file URLs, updating loan due dates and other states.

There are a few functions worth highlighting. These functions are all written in [Google Apps Script](https://developers.google.com/apps-script). Basically, it is JavaScript with API access to applications in [Google Workspace](https://workspace.google.com/).

## Background
The Access Team at NYUSH Library maintains a master spreadsheet for recording the CDL items. The spreadsheet has many columns, of which the following are important to the daily maintainance:
|       A       |         B          |           C        |      E     |   J   |     L     |    M     |           N                |        O        |
|---------------|--------------------|--------------------|------------|-------|-----------|----------|----------------------------|-----------------|
|CDL Item Status|Physical Copy Status|Due Date (auto-sync)|Circ PDF URL|Barcode|Reqest Date|Order Date|Scanning Vendor Payment Date|PDF Delivery Date|
| status        | status             |  yyyy-mm-dd        | google url |14-dig | mm/dd/yyyy|mm/dd/yyyy|            mm/dd/yyyy      |  mm/dd/yyy      |

With these fields above, the following functions may make more sense.

## getFileUrls
Defined in [get-file-urls.js](https://github.com/Linerre/gsuite-tools/blob/master/sheet/CDL-helpers/get-file-urls.js). 

### Problem
A CDL items is a physical book being scanned into PDF and to be loaned as a print, that is, only one patron can check it out at a time. 

The library staff, when receiving those PDF files, will upload them to a Shared Drive of the team. While they are able to upload a batch of files in one sitting, there is no way for them to get the shared URL of each file in the way they do the uploading. Instead, they have to manually get the URLs and paste them to the corresponding cells under Column E. 

Besides, as the number of the files grow bigger, it is definitely a pain in the neck to search for a specific title in Google Drive every time.

Such URLs are necessary in that when notifying a patron about their CDL loan, the corresponding URL will be included in the email sent to the patron. 

### Solution
Using the barcodes under Column J, the script will first look for a file with its barcode. If it finds the file, the file's URL will be fetched and updated to its own row. The script is also time-driven, runing every a few hours (customizable) each day. There is no longer any need for the library staff to worry about the URLs. They just upload the files and record their correct barcodeds. 

If they are really eager to fill in the spreadsheet, the function is bound to a button under the custom menu of the spreadsheet's UI:
![Get file URL Button](https://github.com/Linerre/gsuite-tools/blob/master/get-file-url.png)

## updateFileBarcode
Defined in [update-file-barcode.js](https://github.com/Linerre/gsuite-tools/blob/master/sheet/CDL-helpers/update-file-barcode.js).

### Problem
Handling barcodes is a bit tricky. The barcode of a title will go through the following two phases:
1. When the title is first ordered, it will be given a temporary, 10-digit barcode like 7546207-10;
2. When the phsyical copy gets cataloged finally, the barcode will be updated to its normal form, a 14-digit numeric string like: 31124057208879.

When uploading a PDF file, the staffer will name the file in the format of **barcode_title**. It is very likely that the barcode is the first case above. Later, they may remember to update the barcode on the spreadsheet, but forget to do so to the file in Google Drive. Again, searching for the file is tedious. 

Even worse, there are folders that hold the scan of all chapters/sections from a book; to update each such filename is painful. 

### Solution
The function will take care as long as there is a mismatch between the barcode on the spreadsheet and that of a file. If the file is a folder, all the files' barcodes under it will get updated.

Similarly, the function is bound to a custome menu:
![Update Barcode](https://github.com/Linerre/gsuite-tools/blob/master/update-barcode.png)

But I recommend that the script runs itself according to the time-tricker set on it.
