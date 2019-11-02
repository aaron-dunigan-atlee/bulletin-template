// Return an object variable containing all of the fields in the spreadsheet that will be filled in the document template.
function addCustomFields(bulletinData) {
  
  var customFieldSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var values = customFieldSpreadsheet.getSheetByName("Field Data").getDataRange().getValues();
  for (var i=1; i<values.length; i++) // Start at 1 because first row (index 0) is header.
  {
    bulletinData.fields[values[i][0]] = values[i][1];
  }
  return bulletinData;
}
