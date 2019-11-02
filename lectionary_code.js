// Some of the html functionality, and the lectionary.html, were adapted from 
// https://stackoverflow.com/questions/33561079/parse-html-using-google-app-script
function onOpen() {
 var ui = SpreadsheetApp.getUi();
    ui.createMenu("Bulletins")
      .addItem("Insert Readings and Custom Fields", "showDialog")
      .addToUi();
}

// Show a sidebar with the given html.
function showInSidebar(html,title) {
  var sideBar = HtmlService.createHtmlOutput(html)
                           .setTitle(title);
  SpreadsheetApp.getUi().showSidebar(sideBar);
}

// Open a dialog that allows the user to set all options for the bulletins.
function showDialog() {
  var dialog = HtmlService.createHtmlOutputFromFile("dialog");
  SpreadsheetApp.getUi().showModelessDialog(dialog, 'Bulletin Creation');
}

// Fetch the html content of the lectionary website for the given Sunday.
function getUrlData(url) {
 var doc = UrlFetchApp.fetch(url).getContentText();
 return doc;                               
}

// Main function to save a copy of the template document, 
// then insert collect and readings.
function copyDocAndWriteReadings(bulletinData) {
  bulletinData = addCustomFields(bulletinData);
  // Return URL's and names for new docs so user can open them.
  var newDocs = [];
  //bulletinData.targetFiles has structure {templateID:targetName,...}
  var docs = bulletinData.targetFiles;
  for (var templateId in docs) {
    if( docs.hasOwnProperty(templateId) ) {
      var targetName = docs[templateId];
      var newFileId = copyDocument(templateId, targetName);
      // Add URL to newDocs[] for returning.
      var docInfo = {};
      var newDocumentFile = DriveApp.getFileById(newFileId);
      docInfo.name = newDocumentFile.getName();
      docInfo.url = newDocumentFile.getUrl();
      docInfo.id = newFileId;
      newDocs.push(docInfo);
      
      // Thanks to https://coderwall.com/p/_kakfa/javascript-iterate-through-object-keys-and-values
      // for how to iterate names and properties.
      for (var field in bulletinData.fields) {
        if( bulletinData.fields.hasOwnProperty(field) ) {
          writeHtmlToDocument(newFileId, field, bulletinData.fields[field]);
        } 
      }   
     } 
  }  
  Logger.log(newDocs);
  return newDocs;
}
// Create a copy of the template document, in the same folder as the original, and return the copy's ID.
function copyDocument(docId, fileName) {
  var file = DriveApp.getFileById(docId);
  var fileFolder = file.getParents().next();
  var newFileId = file.makeCopy(fileName,fileFolder).getId();
  return newFileId;
}

// Search for a paragraph containing the field name.  
// Replace the entire paragraph with the 
// given text.
function writeToDocument(fileId, field, text) {
  var fieldCode = '{' + field + '}';
  var body = DocumentApp.openById(fileId).getBody();
  body.replaceText(fieldCode, text);
}

// Same as writeToDocument, but used when the text contains html tags.  
// Attempts to parse the html to plain text.
// But XmlService.parse() is strict and will fail if the html is not properly formed,
// So this won't always work.
// I've tried to catch common reasons for failure and clean up the html a bit.
function writeHtmlToDocument(fileId, field, htmlString) { 
  // Give it a root element.
  htmlString = '<xml>' + htmlString + '</xml>';
  // Clean up html:
  // Add self-closing to singleton line break tags: Replace all '<br>' with <br/>'.
  htmlString = htmlString.split('<br>').join('<br/>');
  // Attempt to parse:
  try {
    var text = XmlService.parse(htmlString).getRootElement().getValue();
    writeToDocument(fileId, field, text);
  } catch(e) {
    Logger.log(e);
    Logger.log(htmlString);
  }
  return;
  
}

