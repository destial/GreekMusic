/**
 * 
 * @param {string} string 
 */
const parseString = (string) => {
    var s = string.split('&quot;').join('"');
    s = s.split('&#39;').join("'");
    return s;
}

module.exports = parseString;