/* ------------- patterns for Google Books ------------- */
  var metaPat = /<table id="metadata_content_table">.*?<\/table>/gm,
  // the quotes in dir="ltr" will be stripped!
      titlePat = /Title<\/td><td class="metadata_value">[^<i>]?<span dir=ltr>(?<title>.*?)<\/span>/gm,
      authorPat = /<a class="primary" href="[^<>]+"><span dir=ltr>(?<author>.*?)<\/span><\/a>/gm,
      pubPat = /Publisher<\/span><\/td><td class="metadata_value"><span dir=ltr>(?<pub>[\w\s]+), (?<puby>\d+)<\/span>/gm,
      isbnPat = /ISBN<\/span><\/td><td class="metadata_value"><span dir=ltr>\d{10}, (?<isbn13>\d{13})<\/span>/gm;


function fetchGoogleBooks() {
//  var url = 'https://books.google.com.hk/books?id=F05TvgAACAAJ&dq=Case+in+point.+Graph+analysis+for+consulting+and+case+interviews&hl=en&sa=X&ved=2ahUKEwj6qZSZptbqAhUayYsBHcY7BR0Q6AEwAHoECAAQAg'
  var url = 'https://books.google.com.hk/books?id=01wAoQEACAAJ&dq=Religious+ecology+and+sinofuturism+:+religious+studies+and+modernities+in+contemporary+Chinese+discourse&hl=en&sa=X&ved=2ahUKEwiSv5fXtdbqAhWHUt4KHTU0B8kQ6AEwCXoECAQQAg'
  var webContent = UrlFetchApp.fetch(url).getContentText('UTF-8');

  // string
  var metadata = metaPat.exec(webContent),
      biblio = metadata[0];

  Logger.log(biblio);


  var title = titlePat.exec(biblio),
      publisher = pubPat.exec(biblio),
      author = authorPat.exec(biblio),
      isbn = isbnPat.exec(biblio),
      authorname,
      authors = [];

  // the first boolean operation must be bracketed
  // otherwise js will force it to become boolean value and then compare with null!
  while ((authorname = authorPat.exec(biblio)) !== null) {
    authors.push(authorname.groups.author);
  }


  Logger.log('Title: ', title.groups.title);

  Logger.log('Author: ', authors.join('; '));

  Logger.log('Publisher: ', publisher.groups.pub);

  Logger.log('Publication Year: ', publisher.groups.puby);

  Logger.log('ISBN: ', isbn.groups.isbn13);


  var fetchTime = Utilities.formatDate(new Date(), 'Etc/GMT', 'yyyy-MM-dd HH:mm:ssZ');
  Logger.log(fetchTime);
}
