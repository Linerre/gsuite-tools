function getTotoalSize()
{
  // calculate folderFile size
  var folderSizeInTotal = 0;
  var folderCount = 0;
  while (circFolders.hasNext()) {
    var singleFolder = circFolders.next();
    var folderName = singleFolder.getName();
    var singleFolderSize = getTotalFileSize(singleFolder.getFiles());
    folderSizeInTotal += singleFolderSize;
    folderCount++;
  }
  Logger.log('Folders size in total: %s MB', folderSizeInTotal);
  Logger.log('Folders in total: %s', folderCount);

  // calculate single PDF file size
  var fileSizeInTotal = getTotalFileSize(circFiles);
  Logger.log('Folders size in total: %s MB', fileSizeInTotal);
}



// always return 0; weired!
function test()
{
  while (circFolders.hasNext()) {
    var singleFolder = circFolders.next();
    var singleFolderName = singleFolder.getName()
    var singleFolderSize = singleFolder.getSize();
    Logger.log('%s Folder size is %s MB', singleFolderName, singleFolderSize);
  }
}




function getTotalFileSize(fileIterator)
{
  var FilesSizeInTotal = 0.0;
  var fileCount = 0;
  while(fileIterator.hasNext()) {
    var singleFile = fileIterator.next();
    var fileName = singleFile.getName().slice(-3,);
    if (fileName !== 'pdf') {
      continue
    } else {
      var singFileSize = singleFile.getSize();
      FilesSizeInTotal += singFileSize;
      fileCount++;
    }
  }
  FilesSizeInTotal = FilesSizeInTotal / (1024 * 1024);
  // Logger.log('The total size of the items is %s MB',ItemSizeInTotal);
  Logger.log('Filse in total: %s', fileCount);
  return FilesSizeInTotal;
}
