// https://developers.google.com/apps-script/guides/dialogs#file-open_dialogs

/**
 * Gets the user's OAuth 2.0 access token so that it can be passed to Picker.
 * This technique keeps Picker from needing to show its own authorization
 * dialog, but is only possible if the OAuth scope that Picker needs is
 * available in Apps Script. In this case, the function includes an unused call
 * to a DriveApp method to ensure that Apps Script requests access to all files
 * in the user's Drive.
 *
 * @return {string} The user's OAuth 2.0 access token.
 */
function getOAuthToken() {
  // DriveApp.getRootFolder();
  return ScriptApp.getOAuthToken();
}


function showPicker(message, fileType) {
  message = message || 'Choose a file.'
  var template = HtmlService.createTemplateFromFile('picker-dialog')
  template.fileType = fileType
  var html = template.evaluate()
    .setWidth(600)
    .setHeight(425)
    .setSandboxMode(HtmlService.SandboxMode.IFRAME)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  SpreadsheetApp.getUi().showModalDialog(html, message);
}

function showTemplatePicker() {
  showPicker('Choose a template document', MimeType.GOOGLE_DOCS)
  
  // Poll for result.
  var result;
  do {
    Utilities.sleep(1000)
    result = checkForFilePickerResult()
  } while (!result);
  return JSON.stringify(result)
  
}

function setFilePickerResult(pickerData) {
  var props = PropertiesService.getUserProperties();
  // Even if user canceled, we mark as a change, so the sidebar knows the picker is finished.  
  // In that case, the previous selection (if it exists) remains in effect. 
  props.setProperty('picker_result_updated', 'true')
  
  if (pickerData.action == 'cancel') return;

  var fileId = pickerData.docs[0].id
  // console.log("setFilePickerResult: Got result " + fileId)
  props.setProperty('filePickerResult', fileId);
}

function checkForFilePickerResult() {
  var props = PropertiesService.getUserProperties()
  var status = props.getProperty('picker_result_updated')
  // console.log("Picker updated? " + status)
  if (status != 'true') return null; // No result yet
  
  // We got a result, so reset the updated flag and return the name and id.
  props.setProperty('picker_result_updated', 'false')
  var fileData = {
    'name': 'No file selected.',
    'id': ''
  }
  var fileId = props.getProperty('filePickerResult');
  if (fileId) {
    fileData.id = fileId;
    fileData.name = DriveApp.getFileById(fileId).getName()
  }
  return fileData
}