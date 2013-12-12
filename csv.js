var CSV = (function () {
  function sanitize(str) {
    if(str.indexOf("\uFFFD") < 0) return str;
    return str.replace(/\uFFFD/g, "");
  }


  function getTokens(line) {
    var tokens = [];
    var lastIndex = 0;
    var quoted = false;
    for(var end = 0; end < line.length; end++) {
      if(!quoted) {
        if(line[end] === ",") {
          tokens.push(sanitize(line.substring(lastIndex, end)));
          lastIndex = end + 1;
        } else if(line[end] === "\"") {
          quoted = true;
        }
      } else if(line[end] === "\"") {
        quoted = false;
      }
    }
    tokens.push(sanitize(line.substring(lastIndex,line.length)));
    return tokens;
  }

  function getObjects(lines) {
    var header = getTokens(lines[0]);
    var objects = new Array(lines.length - 1);

    for(var i = 1; i < lines.length; i++) {
      var object = {};
      var tokens = getTokens(lines[i]);
      for(var fieldIndex = 0; fieldIndex < header.length; fieldIndex++) {
        object[header[fieldIndex]] = tokens[fieldIndex];
      }
      objects[i-1] = object;
    }
    return objects;
  }

  return {
    getTokens: getTokens,
    getObjects: getObjects
  };
})();
