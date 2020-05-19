/**
 * Get an object from the cache, or if not, get it elsewhere and cache it.
 * @param {string} getterName   Name of the function that retrieves the object if it's not in the cache.  
 * @param {number} lengthInMinutes  Length of time to leave in cache.  Defaults to 15.
 * Note: The value of getterName will be used as the key for the cached object. 
 */
function getCachedObject(getterName, lengthInMinutes){
  lengthInMinutes = lengthInMinutes || 15
  var cache = CacheService.getScriptCache();
  var cached = cache.get(getterName);
  if (cached != null) {
    // console.log("getCachedObject: Found object '" + getterName + "' in the cache.")
    return JSON.parse(cached);
  }
  // Call the getter function
  var result = this[getterName]()
  cache.put(getterName, JSON.stringify(result), lengthInMinutes * 60); 
  // console.log("getCachedObject: '" +getterName + "' has been stored in the cache.")
  return result;  
}

function clearCachedObject(getterName){
  var cache = CacheService.getScriptCache();
  cache.remove(getterName)
  // console.warn('clearCachedObject: "' + getterName + '" cleared from cache.')
}
