function toRadians (angle) {
  return angle * (Math.PI / 180);
}
function toDegrees (angle) {
  return (angle * (180 / Math.PI));
}
function changeStylesheetRule(stylesheet, selector, property, value) {
    for(var i = 0; i < stylesheet.cssRules.length; i++) {
      var rule = stylesheet.cssRules[i];
      if(rule.selectorText === selector) {
        rule.style[property] = value;
        return;
      }
    }
    
    stylesheet.insertRule(selector + " { " + property + ": " + value + "; }", 0);
  }

  function getStyleSheetRule(stylesheet, selector, property) {    
    for(var i = 0; i < stylesheet.cssRules.length; i++) {
      var rule = stylesheet.cssRules[i];
      if(rule.selectorText === selector) {
        return rule.style[property];
      }
    }
    
  }