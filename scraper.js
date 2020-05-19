/** 
 * Table Scraper
 * Pull tables from a web page
 * @returns {Object} of the form {'April 2020': [{'day': 2, 'feast': '2nd Sunday after Pentecost', url: 'http://...' }, ...], ... }
 */
function getLectionaryCalendar() {
  const BASE_URL = 'http://www.lectionarypage.net/'
  const TABLE_PATTERN = /<table[\s\S]*?<\/table>/g
  const TABLE_TITLE_PATTERN = /<h3[\s\S]*?>([\s\S]*?)<\/h3>/
  const CELL_PATTERN = /<td[\s\S]*?<\/td>/g
  const DATE_PATTERN = /<font[\s\S]*?>[\s"]*?(\d+)[\s\S]*?(<\/font>[\s\S]*)/
  const FEAST_TITLE_PATTERN = /<\/font>\s*(?!<)([\s\S]+?)</
  const ANCHOR_PATTERN = /<a[\s\S]*?href="([\s\S]*?)"[\s\S]*?>([\s\S]*?)<\/a>/g
  var html = getCachedObject('getLectionaryMainPage')
  var calendarData = {}

  // Search for <table> ... </table>
  var tableMatches = [...html.matchAll(TABLE_PATTERN)];
  // console.log("getLectionaryCalendar: found %s tables.", tableMatches.length)
  tableMatches.forEach(function(table){
    // Pull the title from inside the <h3> tag. e.g. March 2020
    var titleMatch = table[0].match(TABLE_TITLE_PATTERN)
    if (!titleMatch) return; // Next table, because some tables are not calendars.
    var tableName = stripHtml(titleMatch[1])
    if (!/^.+ 20\d{2}/.test(tableName)) return; // Again, checking if it's a calendar.
    // console.log(tableName);
    calendarData[tableName] = []
    
    // Search for <td> ... </td> to find the elements of the table.
    var cellMatches = [...table[0].matchAll(CELL_PATTERN)];
    
    cellMatches.forEach(function(cell){
      var cellHtml = cell[0]
      var dateMatch = cellHtml.match(DATE_PATTERN)
      if (!dateMatch) return; // Not a date cell.
      var dayNumber = stripHtml(dateMatch[1])
      var remainder = dateMatch[2]
      var feastTitleMatch = remainder.match(FEAST_TITLE_PATTERN)
      var dayTitle = feastTitleMatch ? stripHtml(feastTitleMatch[1]) : '';
      // console.log(dayNumber)
      var anchorMatches = [...remainder.matchAll(ANCHOR_PATTERN)];
      anchorMatches.forEach(function(anchor){
        var url = BASE_URL + anchor[1]
        var linkText = stripHtml(anchor[2])
        if (dayTitle) linkText = dayTitle + ' (' + linkText + ')'
        var feastObject = {
          'day': dayNumber,
          'feast': linkText,
          'url': url
        }
        calendarData[tableName].push(feastObject)
      })
    })    
  })
  
  return calendarData
}

/**
 * Get the lectionary main page with the calendar tables.
 */
function getLectionaryMainPage() {
  return UrlFetchApp.fetch('http://www.lectionarypage.net/').getContentText();
}

function stripHtml(html) {
  // Get rid of tags, and unescape the special characters.
  var noTags = html.replace(/<[\s\S]*?>/g,'').replace(/&nbsp;/g,'')
  return XmlService.parse('<root>'+noTags+'</root>').getRootElement().getText().trim();
}