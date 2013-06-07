/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * content of this file comes from the httpd.js component,
 * developed by Mozilla
 */


const Ci = Components.interfaces;
const Cr = Components.results;

this.EXPORTED_SYMBOLS = ['headerUtils', 'htmlEscape']



// Response CONSTANTS

// token       = *<any CHAR except CTLs or separators>
// CHAR        = <any US-ASCII character (0-127)>
// CTL         = <any US-ASCII control character (0-31) and DEL (127)>
// separators  = "(" | ")" | "<" | ">" | "@"
//             | "," | ";" | ":" | "\" | <">
//             | "/" | "[" | "]" | "?" | "="
//             | "{" | "}" | SP  | HT
const IS_TOKEN_ARRAY =
  [0, 0, 0, 0, 0, 0, 0, 0, //   0
   0, 0, 0, 0, 0, 0, 0, 0, //   8
   0, 0, 0, 0, 0, 0, 0, 0, //  16
   0, 0, 0, 0, 0, 0, 0, 0, //  24

   0, 1, 0, 1, 1, 1, 1, 1, //  32
   0, 0, 1, 1, 0, 1, 1, 0, //  40
   1, 1, 1, 1, 1, 1, 1, 1, //  48
   1, 1, 0, 0, 0, 0, 0, 0, //  56

   0, 1, 1, 1, 1, 1, 1, 1, //  64
   1, 1, 1, 1, 1, 1, 1, 1, //  72
   1, 1, 1, 1, 1, 1, 1, 1, //  80
   1, 1, 1, 0, 0, 0, 1, 1, //  88

   1, 1, 1, 1, 1, 1, 1, 1, //  96
   1, 1, 1, 1, 1, 1, 1, 1, // 104
   1, 1, 1, 1, 1, 1, 1, 1, // 112
   1, 1, 1, 0, 1, 0, 1];   // 120


/**
 * Determines whether the given character code is a CTL.
 *
 * @param code : uint
 *   the character code
 * @returns boolean
 *   true if code is a CTL, false otherwise
 */
function isCTL(code)
{
  return (code >= 0 && code <= 31) || (code == 127);
}


/**
 * A container for utility functions used with HTTP headers.
 */
var headerUtils =
{
  /**
   * Normalizes fieldName (by converting it to lowercase) and ensures it is a
   * valid header field name (although not necessarily one specified in RFC
   * 2616).
   *
   * @throws NS_ERROR_INVALID_ARG
   *   if fieldName does not match the field-name production in RFC 2616
   * @returns string
   *   fieldName converted to lowercase if it is a valid header, for characters
   *   where case conversion is possible
   */
  normalizeFieldName: function(fieldName)
  {
    if (fieldName == "")
    {
      //dumpn("*** Empty fieldName");
      throw Cr.NS_ERROR_INVALID_ARG;
    }

    for (var i = 0, sz = fieldName.length; i < sz; i++)
    {
      if (!IS_TOKEN_ARRAY[fieldName.charCodeAt(i)])
      {
        //dumpn(fieldName + " is not a valid header field name!");
        throw Cr.NS_ERROR_INVALID_ARG;
      }
    }

    return fieldName//.toLowerCase();
  },

  /**
   * Ensures that fieldValue is a valid header field value (although not
   * necessarily as specified in RFC 2616 if the corresponding field name is
   * part of the HTTP protocol), normalizes the value if it is, and
   * returns the normalized value.
   *
   * @param fieldValue : string
   *   a value to be normalized as an HTTP header field value
   * @throws NS_ERROR_INVALID_ARG
   *   if fieldValue does not match the field-value production in RFC 2616
   * @returns string
   *   fieldValue as a normalized HTTP header field value
   */
  normalizeFieldValue: function(fieldValue)
  {
    // field-value    = *( field-content | LWS )
    // field-content  = <the OCTETs making up the field-value
    //                  and consisting of either *TEXT or combinations
    //                  of token, separators, and quoted-string>
    // TEXT           = <any OCTET except CTLs,
    //                  but including LWS>
    // LWS            = [CRLF] 1*( SP | HT )
    //
    // quoted-string  = ( <"> *(qdtext | quoted-pair ) <"> )
    // qdtext         = <any TEXT except <">>
    // quoted-pair    = "\" CHAR
    // CHAR           = <any US-ASCII character (octets 0 - 127)>

    // Any LWS that occurs between field-content MAY be replaced with a single
    // SP before interpreting the field value or forwarding the message
    // downstream (section 4.2); we replace 1*LWS with a single SP
    var val = fieldValue.replace(/(?:(?:\r\n)?[ \t]+)+/g, " ");

    // remove leading/trailing LWS (which has been converted to SP)
    val = val.replace(/^ +/, "").replace(/ +$/, "");

    // that should have taken care of all CTLs, so val should contain no CTLs
    //dumpn("*** Normalized value: '" + val + "'");
    for (var i = 0, len = val.length; i < len; i++)
      if (isCTL(val.charCodeAt(i)))
      {
        //dump("*** Char " + i + " has charcode " + val.charCodeAt(i));
        throw Cr.NS_ERROR_INVALID_ARG;
      }

    // XXX disallows quoted-pair where CHAR is a CTL -- will not invalidly
    //     normalize, however, so this can be construed as a tightening of the
    //     spec and not entirely as a bug
    return val;
  }
};



/**
 * Converts the given string into a string which is safe for use in an HTML
 * context.
 *
 * @param str : string
 *   the string to make HTML-safe
 * @returns string
 *   an HTML-safe version of str
 */
function htmlEscape(str)
{
  // this is naive, but it'll work
  var s = "";
  for (var i = 0; i < str.length; i++)
    s += "&#" + str.charCodeAt(i) + ";";
  return s;
}
