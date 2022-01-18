function extensions() {
  var ui = SpreadsheetApp.getUi();
  var myMenu = ui.createAddonMenu();
  myMenu.addItem('Get file URL', 'addCircFileUrl');
  myMenu.addItem('Update file barcode', 'updateFileBarcode');
  myMenu.addToUi();

}

function onOpen(e) {
  extensions();
}
