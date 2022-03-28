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

### The problem
A CDL items is a physical book being scanned into PDF and to be loaned as a print, that is, only one patron can check it out at a time. 

The library staff, when receiving those PDF files, will upload them to a Shared Drive of the team. While they are able to upload a batch of files in one sitting, there is no way for them to get the shared URL of each file in the way they do the uploading. Instead, they have to manually get the URLs and paste them to the corresponding cells under Column E.  

### Solution
Using the barcodes under Column J, the script will first look for a file with its barcode. If it finds the file, the file's URL will be fetched and updated to its own row. The script is also time-driven, runing every a few hours (customizable) each day. There is no longer any need for the library staff to worry about the URLs. They just upload the files and record their correct barcodeds. 

If they are really eager to fill in the spreadsheet, the function is bound to a button under the custom menu of the spreadsheet's UI:
![Get file URL Button](https://github.com/Linerre/gsuite-tools/blob/master/get-file-url.png)

## updateFileBarcode

