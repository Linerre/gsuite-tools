# Orderly
A bunch of functions to automate the tedious workflow of my colleague.

## Backgroud
On Fridays, New York University Library will generate an Order Report (in MS Excel format) and send it to NYU Shanghai Library via email. 

Once receiving it, the colleague will:
1. Download the Excel file or store it in her own Google Drive
2. Copy and paste the columns she needs to the SH's order spreadsheet under her maintainance
3. Use vlookup function and filters to get a list of items that need double checking with NY
4. Email NY for updates on these titles

The orders that need double checking usually fall into one of the folliwng cases:
1. The book needs to be scanned, but there seems something wrong. For example, it has been scanned but yet to deliever to us;
2. The book needs to be shipped to us but there is no update on the shipping

Sometimes, there are other tricky situations in which she needs to figure out what on earth is going on.

## Solution
The scripts under `orderly` automate the above steps for her.

The entry point function is [`autoSaver()`](https://github.com/Linerre/gsuite-tools/blob/2f6364f07fd043b12e180a2c1cce82cbbf4f9a1a/sheet/orderly/auto-saver.js#L71) which runs during 12:00-1:00 PM on Fridays, roughly after the report is sent to us at noon. 

With these scripts, my colleague simply needs to focus on checking some tricky cases.

An exmaple of the email notifications she will receive after the scripts finish runing is like the following:
![Email Notification](https://github.com/Linerre/gsuite-tools/blob/master/email-susan.png)
