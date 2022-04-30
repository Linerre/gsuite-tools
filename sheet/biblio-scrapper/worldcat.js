/*
  Fetch key info of a title from WorldCat page or
  from Amazon production page.

*/



/* ------------- patterns for World Cat ------------- */
var authorBlock = /<td id="bib-author-cell">.*?<\/td>/gm,
    worldCatAuth = /<a href=['"]?[^ ]+['"]? title=["']?Search for more by this author["']?>(?<auth>.*?)<\/a>/gm,
    worldPub = /<td id="bib-publisher-cell">(?<pub>[^\[\]\d©]+)/gm,
    worldTitle =/<h1 class=['"]title['"]>(?<ti>.*?)<\/h1>/gm,
    // worldIsbn = /<td>(?<isbns>[\d ]+)<\/td>/gm;
    worldIsbn = /<th>ISBN:<\/th>\s+<td>(?<isbns>.*)<\/td>/gm;



/* ------------- drive and sheets ------------- */
const driveFolderId = '1kB7zTlvuAbScmZO220xdIQl0vLz2rLhA';
const spreadSheetId = '1ujtfzGHXrU_AY-ABTFHhIfoOS10Yao5a8z8NQu_4Ykg';

function fetchWorldCat(url, barcode) {
  var barcodePat = new RegExp(barcode);
  var content = UrlFetchApp.fetch(url).getContentText('UTF-8');
  var authorBox = authorBlock.exec(content)[0],
      authorname,
      authors = [],
      publisher = worldPub.exec(content),
      title = worldTitle.exec(content),
      isbns = worldIsbn.exec(content);


  // get all the author(s)
  while ((authorname = worldCatAuth.exec(authorBox)) !== null) {
    Logger.log(authorname);
    authors.push(authorname.groups.auth);
  }

   Logger.log(title.groups.ti);

  // Array
   Logger.log(authors);

  //string
   Logger.log(publisher.groups.pub);

  //string
   Logger.log(isbns.groups.isbns);
  //split method has no default separators!
  var isbn13s = isbns.groups.isbns.split(' ').filter(no => no.length > 10).join(', ');

   addBook(title.groups.ti, authors.join('; '), publisher.groups.pub, isbn13s, barcode);
}



/* ----------------- add one book ------------------  */
// may be able to add a batch of books at a time
function addBook(title, author, pub, isbn13, barcode) {

  // get the file url
  var files = DriveApp.getFolderById(driveFolderId).getFiles();

  while (files.hasNext()) {
    var file = files.next();

    if (file.getName().search(barcode) !== -1) {
      var correctUrl = file.getUrl();
      break;
    } else {Logger.log('File not found.')}
  }


  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var bookRecords = ss.getSheetByName('books');
  bookRecords.appendRow([title, author, pub, isbn13, barcode, 'Available', 'Main', correctUrl]);
}






/* ---------------- less useful ---------------- */
