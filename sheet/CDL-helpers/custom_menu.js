function loadForm() {
  var htmlServ = HtmlService.createTemplateFromFile('form-dialog');
  const html = htmlServ.evaluate();
  html.setWidth(400).setHeight(280);
  const ui = SpreadsheetApp.getUi();
  ui.showModalDialog(html, 'Add Book');
}

function loadSidebar() {
  var htmlServ = HtmlService.createTemplateFromFile('form-side');
  const html = htmlServ.evaluate();
  html.setWidth(200);
  html.setTitle('CDL Loan');
  const ui = SpreadsheetApp.getUi();
  ui.showSidebar(html);
}

function createMenu_() {
  let ui = SpreadsheetApp.getUi();
  let menu = ui.createMenu('CDL');
  menu.addItem('Loan CDL', 'loadSidebar')
      .addSeparator();
  menu.addSubMenu(SpreadsheetApp.getUi().createMenu('CDL Helpers')
      .addItem('Get file URL', 'addCircFileUrl')
      .addItem('Update file barcode', 'updateFileBarcode'))
      .addToUi();
}

// function extensions() {
//   var ui = SpreadsheetApp.getUi();
//   var myMenu = ui.createAddonMenu();
//   myMenu.addItem('Get file URL', 'addCircFileUrl');
//   myMenu.addItem('Update file barcode', 'updateFileBarcode');
//   myMenu.addToUi();
// }

function onOpen(e){
  createMenu_();
}
