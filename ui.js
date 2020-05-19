function onOpen(e) {
  var ui = SpreadsheetApp.getUi();
  ui.createAddonMenu()
    .addItem("Create bulletin", "showNewBulletinSidebar")
    .addToUi();
 }
 

 // Show a modal dialog with the given html.
 function showInDialog(html,title) {
   var htmlOutput = HtmlService.createHtmlOutput(html)
                            .setTitle(title);
   SpreadsheetApp.getUi().showModalDialog(htmlOutput, title)
 }
 

/**
 * Show the sidebar for creating a new bulletin.
 */
function showNewBulletinSidebar(){
  // TODO: Handle no data shees or no calendar.
  var dataSheetNames = getDataSheetNames()
  var calendar = getLectionaryCalendar()
  var ui = SpreadsheetApp.getUi()
  var userInterface = HtmlService.createTemplateFromFile('sidebar');
  userInterface.context = {
    dataSheetNames: dataSheetNames,
    calendar: calendar
  }
  ui.showSidebar(userInterface.evaluate().setTitle('Create bulletin'));
}

/**
 * Include one html template in another, passing an optional context object for filling the template.
 * @param {string} filename 
 * @param {Object} context 
 */
function include(filename, context){
  var template = HtmlService.createTemplateFromFile(filename);
  if (context) template.context = context;
  return template.evaluate().getContent();
}

function onInstall(e) {
  onOpen(e)
}