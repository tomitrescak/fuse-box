// Hey this is my banner! Copyright 2016!
(function(FuseBox){
var __process_env__ = {"foo":"bar"};
var __fsbx_css = function(__filename, contents) {
    if (FuseBox.isServer) {
        return;
    }
    var styleId = __filename.replace(/[\.\/]+/g, "-");
    if (styleId.charAt(0) === '-') styleId = styleId.substring(1);
    var exists = document.getElementById(styleId);
    if (!exists) {
        //<link href="//fonts.googleapis.com/css?family=Covered+By+Your+Grace" rel="stylesheet" type="text/css">
        var s = document.createElement(contents ? "style" : "link");
        s.id = styleId;
        s.type = "text/css";
        if (contents) {
            s.innerHTML = contents;
        } else {
            s.rel = "stylesheet";
            s.href = __filename;
        }
        document.getElementsByTagName("head")[0].appendChild(s);
    }
}
FuseBox.on("async", function(name) {
    if (FuseBox.isServer) {
        return;
    }
    if (/\.css$/.test(name)) {
        __fsbx_css(name);
        return false;
    }
});
FuseBox.pkg("default", {}, function(___scope___){
___scope___.file("index.js", function(exports, require, module, __filename, __dirname){ 

"use strict";
var wires_reactive_1 = require("wires-reactive");
console.log(wires_reactive_1.Watch);
var data = {
    "dist/commonjs/index.js": function (exports, require, module, __filename, __dirname) { }
};

});
});
FuseBox.pkg("wires-reactive", {}, function(___scope___){
___scope___.file("dist/commonjs/index.js", function(exports, require, module, __filename, __dirname){ 

"use strict";
var XPath_1 = require("./XPath");
exports.XPath = XPath_1.XPath;
var Eval_1 = require("./Eval");
exports.Eval = Eval_1.Eval;
var Watch_1 = require("./Watch");
exports.Watch = Watch_1.Watch;
var Utils_1 = require("./Utils");
exports.precompileString = Utils_1.precompileString;
exports.precompileExpression = Utils_1.precompileExpression;
exports.extractWatchables = Utils_1.extractWatchables;

});
___scope___.file("dist/commonjs/XPath.js", function(exports, require, module, __filename, __dirname){ 

'use strict';
var XPath = function () {
    function XPath() {
    }
    XPath.dotNotation = function (path) {
        if (path instanceof Array) {
            return {
                path: path,
                str: path.join('.')
            };
        }
        if (typeof path !== 'string') {
            return;
        }
        return {
            path: path.split('.'),
            str: path
        };
    };
    XPath.hasProperty = function (obj, path) {
        if (path && path.length === 0 || obj === undefined) {
            return false;
        }
        var notation = this.dotNotation(path);
        if (!notation) {
            return false;
        }
        path = notation.path;
        var validNext = true;
        for (var i = 0; i < path.length; i++) {
            if (validNext && obj.hasOwnProperty(path[i])) {
                obj = obj[path[i]];
                if (obj === undefined) {
                    validNext = false;
                }
            } else {
                return false;
            }
        }
        return true;
    };
    XPath.get = function (obj, path) {
        if (path.length === 0 || obj === undefined) {
            return undefined;
        }
        var notation = this.dotNotation(path);
        if (!notation) {
            return;
        }
        path = notation.path;
        for (var i = 0; i < path.length; i++) {
            obj = obj[path[i]];
            if (obj === undefined) {
                return undefined;
            }
        }
        return obj;
    };
    XPath.set = function (obj, xpath, v) {
        var path = xpath.split('.');
        if (path.length === 1) {
            obj[xpath] = v;
        }
        if (path.length >= 2) {
            var initialArray = obj[path[0]];
            var value = initialArray;
            if (value === undefined) {
                value = {};
                obj[path[0]] = value;
            }
            for (var i = 1; i < path.length; i++) {
                var x = path[i];
                if (i === path.length - 1) {
                    value[x] = v;
                } else {
                    if (value[x] === undefined) {
                        var nvalue = {};
                        value[x] = nvalue;
                        value = nvalue;
                    } else {
                        value = value[x];
                    }
                }
            }
        }
    };
    return XPath;
}();
exports.XPath = XPath;
});
___scope___.file("dist/commonjs/Eval.js", function(exports, require, module, __filename, __dirname){ 

'use strict';
var XPath_1 = require('./XPath');
var wires_angular_expressions_1 = require('wires-angular-expressions');
var extract_vars_1 = require('extract-vars');
var exprCache = {};
var Eval = function () {
    function Eval() {
    }
    Eval.assign = function (context, expression, value) {
        var cached = exprCache[expression];
        var variables = [];
        if (cached) {
            variables = cached;
        } else {
            variables = extract_vars_1.dig(expression);
            exprCache[expression] = variables;
        }
        var targetVariable = variables[0];
        if (targetVariable) {
            if (context.locals && XPath_1.XPath.get(context.locals, targetVariable) !== undefined) {
                XPath_1.XPath.set(context.locals, targetVariable, value);
            } else {
                XPath_1.XPath.set(context.scope, targetVariable, value);
            }
        }
    };
    Eval.expression = function (context, expression) {
        var model = wires_angular_expressions_1.Compile(expression);
        return model(context.scope, context.locals);
    };
    return Eval;
}();
exports.Eval = Eval;
});
___scope___.file("dist/commonjs/Watch.js", function(exports, require, module, __filename, __dirname){ 

'use strict';
var Eval_1 = fusebox_require('1');
var XPath_1 = fusebox_require('0');
var Utils_1 = require('./Utils');
var wires_angular_expressions_1 = require('wires-angular-expressions');
var async_watch_1 = require('async-watch');
var Watch = function () {
    function Watch() {
    }
    Watch.evalTemplate = function (context, tpl) {
        if (typeof tpl === 'string') {
            tpl = Utils_1.precompileString(tpl);
        }
        var str = [];
        for (var i = 0; i < tpl.length; i++) {
            var item = tpl[i];
            if (typeof item === 'object') {
                var expression = item[0];
                var model = wires_angular_expressions_1.Compile(expression);
                str.push(model(context.scope, context.locals));
            } else {
                str.push(item);
            }
        }
        return str.join('');
    };
    Watch.expression = function (context, expression, fn) {
        if (typeof expression === 'string') {
            expression = Utils_1.precompileExpression(expression);
        }
        var watchables = expression[1];
        var template = expression[0];
        fn(Eval_1.Eval.expression(context, template));
        if (watchables.length === 0) {
            return;
        }
        var watchers = [];
        var initial = true;
        for (var i = 0; i < watchables.length; i++) {
            var vpath = watchables[i];
            if (context.locals && XPath_1.XPath.hasProperty(context.locals, vpath)) {
                watchers.push(async_watch_1.AsyncWatch(context.locals, vpath, function () {
                    return null;
                }));
            } else {
                watchers.push(async_watch_1.AsyncWatch(context.scope, vpath, function (value) {
                    return null;
                }));
            }
        }
        return async_watch_1.AsyncSubscribe(watchers, function (ch) {
            if (initial === false) {
                fn(Eval_1.Eval.expression(context, template));
            }
            initial = false;
        });
    };
    Watch.template = function (context, tpl, fn) {
        var _this = this;
        if (typeof tpl === 'string') {
            tpl = Utils_1.precompileString(tpl);
        }
        var precompiled = tpl;
        var watchables = [];
        for (var i = 0; i < precompiled.length; i++) {
            var item = precompiled[i];
            if (typeof item === 'object') {
                var watchable = item[1];
                for (var w = 0; w < watchable.length; w++) {
                    var variable = watchable[w];
                    if (watchables.indexOf(variable) === -1) {
                        watchables.push(variable);
                    }
                }
            }
        }
        fn(this.evalTemplate(context, tpl));
        if (watchables.length === 0) {
            return;
        }
        var initial = true;
        var watchers = [];
        for (var i = 0; i < watchables.length; i++) {
            var vpath = watchables[i];
            if (context.locals && XPath_1.XPath.hasProperty(context.locals, vpath)) {
                watchers.push(async_watch_1.AsyncWatch(context.locals, vpath, function () {
                    return null;
                }));
            } else {
                watchers.push(async_watch_1.AsyncWatch(context.scope, vpath, function (value) {
                    return null;
                }));
            }
        }
        return async_watch_1.AsyncSubscribe(watchers, function (ch) {
            if (initial === false) {
                fn(_this.evalTemplate(context, tpl));
            }
            initial = false;
        });
    };
    return Watch;
}();
exports.Watch = Watch;
});
___scope___.file("dist/commonjs/Utils.js", function(exports, require, module, __filename, __dirname){ 

'use strict';
var extract_vars_1 = require('extract-vars');
exports.precompileString = function (str) {
    var re = /({{\s*[^}]+\s*}})/g;
    var list = str.split(re).map(function (x) {
        var expr = x.match(/{{\s*([^}]+)\s*}}/);
        if (expr) {
            var expressionString = expr[1].trim();
            return [
                expressionString,
                extract_vars_1.dig(expressionString)
            ];
        }
        return x;
    });
    var filtered = [];
    for (var i = 0; i < list.length; i++) {
        if (list[i] !== undefined && list[i] !== '') {
            filtered.push(list[i]);
        }
    }
    return filtered;
};
exports.precompileExpression = function (str) {
    return [
        str,
        extract_vars_1.dig(str)
    ];
};
exports.extractWatchables = function (str) {
    return extract_vars_1.dig(str);
};
});
return ___scope___.entry = "dist/commonjs/index.js";
});
FuseBox.pkg("wires-angular-expressions", {}, function(___scope___){
___scope___.file("src/index.js", function(exports, require, module, __filename, __dirname){ 

// We don't want to lint angular's code...
/* eslint-disable */

// Angular environment stuff
// ------------------------------
function noop() {}

// Simplified extend() for our use-case
function extend(dst, obj) {
   var key;

   for (key in obj) {
      if (obj.hasOwnProperty(key)) {
         dst[key] = obj[key];
      }
   }

   return dst;
}

function isDefined(value) {
   return typeof value !== 'undefined';
}

function valueFn(value) {
   return function() {
      return value;
   };
}

function $parseMinErr(module, message, arg1, arg2, arg3) {
   var args = arguments;

   message = message.replace(/{(\d)}/g, function(match) {
      return args[2 + parseInt(match[1])];
   });

   throw new SyntaxError(message);
}

function lowercase(string) {
   return typeof string === "string" ? string.toLowerCase() : string;
}

// Simplified forEach() for our use-case
function forEach(arr, iterator) {
   arr.forEach(iterator);
}

// Sandboxing Angular Expressions
// ------------------------------
// Angular expressions are generally considered safe because these expressions only have direct
// access to $scope and locals. However, one can obtain the ability to execute arbitrary JS code by
// obtaining a reference to native JS functions such as the Function constructor.
//
// As an example, consider the following Angular expression:
//
//   {}.toString.constructor(alert("evil JS code"))
//
// We want to prevent this type of access. For the sake of performance, during the lexing phase we
// disallow any "dotted" access to any member named "constructor".
//
// For reflective calls (a[b]) we check that the value of the lookup is not the Function constructor
// while evaluating the expression, which is a stronger but more expensive test. Since reflective
// calls are expensive anyway, this is not such a big deal compared to static dereferencing.
//
// This sandboxing technique is not perfect and doesn't aim to be. The goal is to prevent exploits
// against the expression language, but not to prevent exploits that were enabled by exposing
// sensitive JavaScript or browser apis on Scope. Exposing such objects on a Scope is never a good
// practice and therefore we are not even trying to protect against interaction with an object
// explicitly exposed in this way.
//
// A developer could foil the name check by aliasing the Function constructor under a different
// name on the scope.
//
// In general, it is not possible to access a Window object from an angular expression unless a
// window or some DOM object that has a reference to window is published onto a Scope.

function ensureSafeMemberName(name, fullExpression) {
   if (name === "constructor") {
      throw $parseMinErr('isecfld',
         'Referencing "constructor" field in Angular expressions is disallowed! Expression: {0}',
         fullExpression);
   }
   return name;
}

function ensureSafeObject(obj, fullExpression) {
   // nifty check if obj is Function that is fast and works across iframes and other contexts
   if (obj) {
      if (obj.constructor === obj) {
         throw $parseMinErr('isecfn',
            'Referencing Function in Angular expressions is disallowed! Expression: {0}',
            fullExpression);
      } else if ( // isWindow(obj)
         obj.document && obj.location && obj.alert && obj.setInterval) {
         throw $parseMinErr('isecwindow',
            'Referencing the Window in Angular expressions is disallowed! Expression: {0}',
            fullExpression);
      } else if ( // isElement(obj)
         obj.children && (obj.nodeName || (obj.prop && obj.attr && obj.find))) {
         throw $parseMinErr('isecdom',
            'Referencing DOM nodes in Angular expressions is disallowed! Expression: {0}',
            fullExpression);
      }
   }
   return obj;
}

var OPERATORS = {
   /* jshint bitwise : false */
   'null': function() {
      return null;
   },
   'true': function() {
      return true;
   },
   'false': function() {
      return false;
   },
   undefined: noop,
   '+': function(self, locals, a, b) {
      a = a(self, locals);
      b = b(self, locals);
      if (isDefined(a)) {
         if (isDefined(b)) {
            return a + b;
         }
         return a;
      }
      return isDefined(b) ? b : undefined;
   },
   '-': function(self, locals, a, b) {
      a = a(self, locals);
      b = b(self, locals);
      return (isDefined(a) ? a : 0) - (isDefined(b) ? b : 0);
   },
   '*': function(self, locals, a, b) {
      return a(self, locals) * b(self, locals);
   },
   '/': function(self, locals, a, b) {
      return a(self, locals) / b(self, locals);
   },
   '%': function(self, locals, a, b) {
      return a(self, locals) % b(self, locals);
   },
   '^': function(self, locals, a, b) {
      return a(self, locals) ^ b(self, locals);
   },
   '=': noop,
   '===': function(self, locals, a, b) {
      return a(self, locals) === b(self, locals);
   },
   '!==': function(self, locals, a, b) {
      return a(self, locals) !== b(self, locals);
   },
   '==': function(self, locals, a, b) {
      return a(self, locals) == b(self, locals);
   },
   '!=': function(self, locals, a, b) {
      return a(self, locals) != b(self, locals);
   },
   '<': function(self, locals, a, b) {
      return a(self, locals) < b(self, locals);
   },
   '>': function(self, locals, a, b) {
      return a(self, locals) > b(self, locals);
   },
   '<=': function(self, locals, a, b) {
      return a(self, locals) <= b(self, locals);
   },
   '>=': function(self, locals, a, b) {
      return a(self, locals) >= b(self, locals);
   },
   '&&': function(self, locals, a, b) {
      return a(self, locals) && b(self, locals);
   },
   '||': function(self, locals, a, b) {
      return a(self, locals) || b(self, locals);
   },
   '&': function(self, locals, a, b) {
      return a(self, locals) & b(self, locals);
   },
   //    '|':function(self, locals, a,b){return a|b;},
   '|': function(self, locals, a, b) {
      return b(self, locals)(self, locals, a(self, locals));
   },
   '!': function(self, locals, a) {
      return !a(self, locals);
   }
};
/* jshint bitwise: true */
var ESCAPE = {
   "n": "\n",
   "f": "\f",
   "r": "\r",
   "t": "\t",
   "v": "\v",
   "'": "'",
   '"': '"'
};

/////////////////////////////////////////

/**
 * @constructor
 */
var Lexer = function(options) {
   this.options = options;
};

Lexer.prototype = {
   constructor: Lexer,

   lex: function(text) {
      this.text = text;

      this.index = 0;
      this.ch = undefined;
      this.lastCh = ':'; // can start regexp

      this.tokens = [];

      var token;
      var json = [];

      while (this.index < this.text.length) {
         this.ch = this.text.charAt(this.index);
         if (this.is('"\'')) {
            this.readString(this.ch);
         } else if (this.isNumber(this.ch) || this.is('.') && this.isNumber(this.peek())) {
            this.readNumber();
         } else if (this.isIdent(this.ch)) {
            this.readIdent();
            // identifiers can only be if the preceding char was a { or ,
            if (this.was('{,') && json[0] === '{' &&
               (token = this.tokens[this.tokens.length - 1])) {
               token.json = token.text.indexOf('.') === -1;
            }
         } else if (this.is('(){}[].,;:?')) {
            this.tokens.push({
               index: this.index,
               text: this.ch,
               json: (this.was(':[,') && this.is('{[')) || this.is('}]:,')
            });
            if (this.is('{[')) json.unshift(this.ch);
            if (this.is('}]')) json.shift();
            this.index++;
         } else if (this.isWhitespace(this.ch)) {
            this.index++;
            continue;
         } else {
            var ch2 = this.ch + this.peek();
            var ch3 = ch2 + this.peek(2);
            var fn = OPERATORS[this.ch];
            var fn2 = OPERATORS[ch2];
            var fn3 = OPERATORS[ch3];
            if (fn3) {
               this.tokens.push({
                  index: this.index,
                  text: ch3,
                  fn: fn3
               });
               this.index += 3;
            } else if (fn2) {
               this.tokens.push({
                  index: this.index,
                  text: ch2,
                  fn: fn2
               });
               this.index += 2;
            } else if (fn) {
               this.tokens.push({
                  index: this.index,
                  text: this.ch,
                  fn: fn,
                  json: (this.was('[,:') && this.is('+-'))
               });
               this.index += 1;
            } else {
               this.throwError('Unexpected next character ', this.index, this.index + 1);
            }
         }
         this.lastCh = this.ch;
      }
      return this.tokens;
   },

   is: function(chars) {
      return chars.indexOf(this.ch) !== -1;
   },

   was: function(chars) {
      return chars.indexOf(this.lastCh) !== -1;
   },

   peek: function(i) {
      var num = i || 1;
      return (this.index + num < this.text.length) ? this.text.charAt(this.index + num) : false;
   },

   isNumber: function(ch) {
      return ('0' <= ch && ch <= '9');
   },

   isWhitespace: function(ch) {
      // IE treats non-breaking space as \u00A0
      return (ch === ' ' || ch === '\r' || ch === '\t' ||
         ch === '\n' || ch === '\v' || ch === '\u00A0');
   },

   isIdent: function(ch) {
      return ('a' <= ch && ch <= 'z' ||
         'A' <= ch && ch <= 'Z' ||
         '_' === ch || ch === '$');
   },

   isExpOperator: function(ch) {
      return (ch === '-' || ch === '+' || this.isNumber(ch));
   },

   throwError: function(error, start, end) {
      end = end || this.index;
      var colStr = (isDefined(start) ? 's ' + start + '-' + this.index + ' [' + this.text.substring(start, end) + ']' : ' ' + end);
      throw $parseMinErr('lexerr', 'Lexer Error: {0} at column{1} in expression [{2}].',
         error, colStr, this.text);
   },

   readNumber: function() {
      var number = '';
      var start = this.index;
      while (this.index < this.text.length) {
         var ch = lowercase(this.text.charAt(this.index));
         if (ch == '.' || this.isNumber(ch)) {
            number += ch;
         } else {
            var peekCh = this.peek();
            if (ch == 'e' && this.isExpOperator(peekCh)) {
               number += ch;
            } else if (this.isExpOperator(ch) &&
               peekCh && this.isNumber(peekCh) &&
               number.charAt(number.length - 1) == 'e') {
               number += ch;
            } else if (this.isExpOperator(ch) &&
               (!peekCh || !this.isNumber(peekCh)) &&
               number.charAt(number.length - 1) == 'e') {
               this.throwError('Invalid exponent');
            } else {
               break;
            }
         }
         this.index++;
      }
      number = 1 * number;
      this.tokens.push({
         index: start,
         text: number,
         json: true,
         fn: function() {
            return number;
         }
      });
   },

   readIdent: function() {
      var parser = this;

      var ident = '';
      var start = this.index;

      var lastDot, peekIndex, methodName, ch;

      while (this.index < this.text.length) {
         ch = this.text.charAt(this.index);
         if (ch === '.' || this.isIdent(ch) || this.isNumber(ch)) {
            if (ch === '.') lastDot = this.index;
            ident += ch;
         } else {
            break;
         }
         this.index++;
      }

      //check if this is not a method invocation and if it is back out to last dot
      if (lastDot) {
         peekIndex = this.index;
         while (peekIndex < this.text.length) {
            ch = this.text.charAt(peekIndex);
            if (ch === '(') {
               methodName = ident.substr(lastDot - start + 1);
               ident = ident.substr(0, lastDot - start);
               this.index = peekIndex;
               break;
            }
            if (this.isWhitespace(ch)) {
               peekIndex++;
            } else {
               break;
            }
         }
      }

      var token = {
         index: start,
         text: ident
      };

      // OPERATORS is our own object so we don't need to use special hasOwnPropertyFn
      if (OPERATORS.hasOwnProperty(ident)) {
         token.fn = OPERATORS[ident];
         token.json = OPERATORS[ident];
      } else {
         var getter = getterFn(ident, this.options, this.text);
         token.fn = extend(function(self, locals) {
            return (getter(self, locals));
         }, {
            assign: function(self, value) {
               return setter(self, ident, value, parser.text, parser.options);
            }
         });
      }

      this.tokens.push(token);

      if (methodName) {
         this.tokens.push({
            index: lastDot,
            text: '.',
            json: false
         });
         this.tokens.push({
            index: lastDot + 1,
            text: methodName,
            json: false
         });
      }
   },

   readString: function(quote) {
      var start = this.index;
      this.index++;
      var string = '';
      var rawString = quote;
      var escape = false;
      while (this.index < this.text.length) {
         var ch = this.text.charAt(this.index);
         rawString += ch;
         if (escape) {
            if (ch === 'u') {
               var hex = this.text.substring(this.index + 1, this.index + 5);
               if (!hex.match(/[\da-f]{4}/i))
                  this.throwError('Invalid unicode escape [\\u' + hex + ']');
               this.index += 4;
               string += String.fromCharCode(parseInt(hex, 16));
            } else {
               var rep = ESCAPE[ch];
               if (rep) {
                  string += rep;
               } else {
                  string += ch;
               }
            }
            escape = false;
         } else if (ch === '\\') {
            escape = true;
         } else if (ch === quote) {
            this.index++;
            this.tokens.push({
               index: start,
               text: rawString,
               string: string,
               json: true,
               fn: function() {
                  return string;
               }
            });
            return;
         } else {
            string += ch;
         }
         this.index++;
      }
      this.throwError('Unterminated quote', start);
   }
};

/**
 * @constructor
 */
var Parser = function(lexer, $filter, options) {
   this.lexer = lexer;
   this.$filter = $filter;
   this.options = options;
};

Parser.ZERO = function() {
   return 0;
};

Parser.prototype = {
   constructor: Parser,

   parse: function(text) {
      this.text = text;

      this.tokens = this.lexer.lex(text);

      var value = this.statements();

      if (this.tokens.length !== 0) {
         this.throwError('is an unexpected token', this.tokens[0]);
      }

      value.literal = !!value.literal;
      value.constant = !!value.constant;

      return value;
   },
   tokenize: function(text) {
      this.text = text;
      //2
      this.tokens = this.lexer.lex(text);
      return this.tokens;
   },

   primary: function() {
      var primary;
      if (this.expect('(')) {
         primary = this.filterChain();
         this.consume(')');
      } else if (this.expect('[')) {
         primary = this.arrayDeclaration();
      } else if (this.expect('{')) {
         primary = this.object();
      } else {
         var token = this.expect();
         primary = token.fn;
         if (!primary) {
            this.throwError('not a primary expression', token);
         }
         if (token.json) {
            primary.constant = true;
            primary.literal = true;
         }
      }

      var next, context;
      while ((next = this.expect('(', '[', '.'))) {
         if (next.text === '(') {
            primary = this.functionCall(primary, context);
            context = null;
         } else if (next.text === '[') {
            context = primary;
            primary = this.objectIndex(primary);
         } else if (next.text === '.') {
            context = primary;
            primary = this.fieldAccess(primary);
         } else {
            this.throwError('IMPOSSIBLE');
         }
      }
      return primary;
   },

   throwError: function(msg, token) {
      throw $parseMinErr('syntax',
         'Syntax Error: Token \'{0}\' {1} at column {2} of the expression [{3}] starting at [{4}].',
         token.text, msg, (token.index + 1), this.text, this.text.substring(token.index));
   },

   peekToken: function() {
      if (this.tokens.length === 0)
         throw $parseMinErr('ueoe', 'Unexpected end of expression: {0}', this.text);
      return this.tokens[0];
   },

   peek: function(e1, e2, e3, e4) {
      if (this.tokens.length > 0) {
         var token = this.tokens[0];
         var t = token.text;
         if (t === e1 || t === e2 || t === e3 || t === e4 ||
            (!e1 && !e2 && !e3 && !e4)) {
            return token;
         }
      }
      return false;
   },

   expect: function(e1, e2, e3, e4) {
      var token = this.peek(e1, e2, e3, e4);
      if (token) {
         this.tokens.shift();
         return token;
      }
      return false;
   },

   consume: function(e1) {
      if (!this.expect(e1)) {
         this.throwError('is unexpected, expecting [' + e1 + ']', this.peek());
      }
   },

   unaryFn: function(fn, right) {
      return extend(function(self, locals) {
         return fn(self, locals, right);
      }, {
         constant: right.constant
      });
   },

   ternaryFn: function(left, middle, right) {
      return extend(function(self, locals) {
         return left(self, locals) ? middle(self, locals) : right(self, locals);
      }, {
         constant: left.constant && middle.constant && right.constant
      });
   },

   binaryFn: function(left, fn, right) {
      return extend(function(self, locals) {
         return fn(self, locals, left, right);
      }, {
         constant: left.constant && right.constant
      });
   },

   statements: function() {
      var statements = [];
      while (true) {
         if (this.tokens.length > 0 && !this.peek('}', ')', ';', ']')) {
            statements.push(this.filterChain());
         }
         if (!this.expect(';')) {
            // optimize for the common case where there is only one statement.
            // TODO(size): maybe we should not support multiple statements?
            return (statements.length === 1) ? statements[0] : function(self, locals) {
               var value;
               for (var i = 0; i < statements.length; i++) {
                  var statement = statements[i];

                  if (statement) {
                     value = statement(self, locals);
                  }
               }
               return value;
            };
         }
      }
   },

   filterChain: function() {
      var left = this.expression();
      var token;
      while (true) {
         if ((token = this.expect('|'))) {
            left = this.binaryFn(left, token.fn, this.filter());
         } else {
            return left;
         }
      }
   },

   filter: function() {
      var token = this.expect();
      var fn = this.$filter(token.text);
      var argsFn = [];
      while (true) {
         if ((token = this.expect(':'))) {
            argsFn.push(this.expression());
         } else {
            var fnInvoke = function(self, locals, input) {
               var args = [input];
               for (var i = 0; i < argsFn.length; i++) {
                  args.push(argsFn[i](self, locals));
               }
               return fn.apply(self, args);
            };
            return function() {
               return fnInvoke;
            };
         }
      }
   },

   expression: function() {
      return this.assignment();
   },

   assignment: function() {
      var left = this.ternary();
      var right;
      var token;
      if ((token = this.expect('='))) {
         if (!left.assign) {
            this.throwError('implies assignment but [' +
               this.text.substring(0, token.index) + '] can not be assigned to', token);
         }
         right = this.ternary();
         return function(scope, locals) {
            return left.assign(scope, right(scope, locals), locals);
         };
      }
      return left;
   },

   ternary: function() {
      var left = this.logicalOR();
      var middle;
      var token;
      if ((token = this.expect('?'))) {
         middle = this.ternary();
         if ((token = this.expect(':'))) {
            return this.ternaryFn(left, middle, this.ternary());
         } else {
            this.throwError('expected :', token);
         }
      } else {
         return left;
      }
   },

   logicalOR: function() {
      var left = this.logicalAND();
      var token;
      while (true) {
         if ((token = this.expect('||'))) {
            left = this.binaryFn(left, token.fn, this.logicalAND());
         } else {
            return left;
         }
      }
   },

   logicalAND: function() {
      var left = this.equality();
      var token;
      if ((token = this.expect('&&'))) {
         left = this.binaryFn(left, token.fn, this.logicalAND());
      }
      return left;
   },

   equality: function() {
      var left = this.relational();
      var token;
      if ((token = this.expect('==', '!=', '===', '!=='))) {
         left = this.binaryFn(left, token.fn, this.equality());
      }
      return left;
   },

   relational: function() {
      var left = this.additive();
      var token;
      if ((token = this.expect('<', '>', '<=', '>='))) {
         left = this.binaryFn(left, token.fn, this.relational());
      }
      return left;
   },

   additive: function() {
      var left = this.multiplicative();
      var token;
      while ((token = this.expect('+', '-'))) {
         left = this.binaryFn(left, token.fn, this.multiplicative());
      }
      return left;
   },

   multiplicative: function() {
      var left = this.unary();
      var token;
      while ((token = this.expect('*', '/', '%'))) {
         left = this.binaryFn(left, token.fn, this.unary());
      }
      return left;
   },

   unary: function() {
      var token;
      if (this.expect('+')) {
         return this.primary();
      } else if ((token = this.expect('-'))) {
         return this.binaryFn(Parser.ZERO, token.fn, this.unary());
      } else if ((token = this.expect('!'))) {
         return this.unaryFn(token.fn, this.unary());
      } else {
         return this.primary();
      }
   },

   fieldAccess: function(object) {
      var parser = this;
      var field = this.expect().text;
      var getter = getterFn(field, this.options, this.text);

      return extend(function(scope, locals, self) {
         return getter(self || object(scope, locals));
      }, {
         assign: function(scope, value, locals) {
            var o = object(scope, locals);
            if (!o) object.assign(scope, o = {}, locals);
            return setter(o, field, value, parser.text, parser.options);
         }
      });
   },

   objectIndex: function(obj) {
      var parser = this;

      var indexFn = this.expression();
      this.consume(']');

      return extend(function(self, locals) {
         var o = obj(self, locals),
            i = indexFn(self, locals),
            v, p;

         if (!o) return undefined;
         v = ensureSafeObject(o[i], parser.text);
         return v;
      }, {
         assign: function(self, value, locals) {
            var key = indexFn(self, locals);
            // prevent overwriting of Function.constructor which would break ensureSafeObject check
            var o = ensureSafeObject(obj(self, locals), parser.text);
            if (!o) obj.assign(self, o = [], locals);
            return o[key] = value;
         }
      });
   },

   functionCall: function(fn, contextGetter) {
      var argsFn = [];
      if (this.peekToken().text !== ')') {
         do {
            argsFn.push(this.expression());
         } while (this.expect(','));
      }
      this.consume(')');

      var parser = this;

      return function(scope, locals) {
         var args = [];
         var context = contextGetter ? contextGetter(scope, locals) : scope;

         for (var i = 0; i < argsFn.length; i++) {
            args.push(argsFn[i](scope, locals));
         }

         var fnPtr = fn(scope, locals, context) || noop;

         ensureSafeObject(context, parser.text);
         ensureSafeObject(fnPtr, parser.text);

         // IE stupidity! (IE doesn't have apply for some native functions)
         var v = fnPtr.apply ? fnPtr.apply(context, args) : fnPtr(args[0], args[1], args[2], args[3], args[4]);

         return ensureSafeObject(v, parser.text);
      };
   },

   // This is used with json array declaration
   arrayDeclaration: function() {
      var elementFns = [];
      var allConstant = true;
      if (this.peekToken().text !== ']') {
         do {
            if (this.peek(']')) {
               // Support trailing commas per ES5.1.
               break;
            }
            var elementFn = this.expression();
            elementFns.push(elementFn);
            if (!elementFn.constant) {
               allConstant = false;
            }
         } while (this.expect(','));
      }
      this.consume(']');

      return extend(function(self, locals) {
         var array = [];
         for (var i = 0; i < elementFns.length; i++) {
            array.push(elementFns[i](self, locals));
         }
         return array;
      }, {
         literal: true,
         constant: allConstant
      });
   },

   object: function() {
      var keyValues = [];
      var allConstant = true;
      if (this.peekToken().text !== '}') {
         do {
            if (this.peek('}')) {
               // Support trailing commas per ES5.1.
               break;
            }
            var token = this.expect(),
               key = token.string || token.text;
            this.consume(':');
            var value = this.expression();
            keyValues.push({
               key: key,
               value: value
            });
            if (!value.constant) {
               allConstant = false;
            }
         } while (this.expect(','));
      }
      this.consume('}');

      return extend(function(self, locals) {
         var object = {};
         for (var i = 0; i < keyValues.length; i++) {
            var keyValue = keyValues[i];
            object[keyValue.key] = keyValue.value(self, locals);
         }
         return object;
      }, {
         literal: true,
         constant: allConstant
      });
   }
};

//////////////////////////////////////////////////
// Parser helper functions
//////////////////////////////////////////////////

function setter(obj, path, setValue, fullExp) {
   var element = path.split('.'),
      key;
   for (var i = 0; element.length > 1; i++) {
      key = ensureSafeMemberName(element.shift(), fullExp);
      var propertyObj = obj[key];
      if (!propertyObj) {
         propertyObj = {};
         obj[key] = propertyObj;
      }
      obj = propertyObj;
   }
   key = ensureSafeMemberName(element.shift(), fullExp);
   obj[key] = setValue;
   return setValue;
}

var getterFnCache = {};

/**
 * Implementation of the "Black Hole" variant from:
 * - http://jsperf.com/angularjs-parse-getter/4
 * - http://jsperf.com/path-evaluation-simplified/7
 */
function cspSafeGetterFn(key0, key1, key2, key3, key4, fullExp) {
   ensureSafeMemberName(key0, fullExp);
   ensureSafeMemberName(key1, fullExp);
   ensureSafeMemberName(key2, fullExp);
   ensureSafeMemberName(key3, fullExp);
   ensureSafeMemberName(key4, fullExp);

   return function cspSafeGetter(scope, locals) {
      var pathVal = (locals && locals.hasOwnProperty(key0)) ? locals : scope;

      if (pathVal == null) return pathVal;
      pathVal = pathVal[key0];

      if (!key1) return pathVal;
      if (pathVal == null) return undefined;
      pathVal = pathVal[key1];

      if (!key2) return pathVal;
      if (pathVal == null) return undefined;
      pathVal = pathVal[key2];

      if (!key3) return pathVal;
      if (pathVal == null) return undefined;
      pathVal = pathVal[key3];

      if (!key4) return pathVal;
      if (pathVal == null) return undefined;
      pathVal = pathVal[key4];

      return pathVal;
   };
}

function simpleGetterFn1(key0, fullExp) {
   ensureSafeMemberName(key0, fullExp);

   return function simpleGetterFn1(scope, locals) {
      if (scope == null) return undefined;
      return ((locals && locals.hasOwnProperty(key0)) ? locals : scope)[key0];
   };
}

function simpleGetterFn2(key0, key1, fullExp) {
   ensureSafeMemberName(key0, fullExp);
   ensureSafeMemberName(key1, fullExp);

   return function simpleGetterFn2(scope, locals) {
      if (scope == null) return undefined;
      scope = ((locals && locals.hasOwnProperty(key0)) ? locals : scope)[key0];
      return scope == null ? undefined : scope[key1];
   };
}

function getterFn(path, options, fullExp) {
   // Check whether the cache has this getter already.
   // We can use hasOwnProperty directly on the cache because we ensure,
   // see below, that the cache never stores a path called 'hasOwnProperty'
   if (getterFnCache.hasOwnProperty(path)) {
      return getterFnCache[path];
   }

   var pathKeys = path.split('.'),
      pathKeysLength = pathKeys.length,
      fn;

   // When we have only 1 or 2 tokens, use optimized special case closures.
   // http://jsperf.com/angularjs-parse-getter/6
   if (pathKeysLength === 1) {
      fn = simpleGetterFn1(pathKeys[0], fullExp);
   } else if (pathKeysLength === 2) {
      fn = simpleGetterFn2(pathKeys[0], pathKeys[1], fullExp);
   } else if (options.csp) {
      if (pathKeysLength < 6) {
         fn = cspSafeGetterFn(pathKeys[0], pathKeys[1], pathKeys[2], pathKeys[3], pathKeys[4], fullExp,
            options);
      } else {
         fn = function(scope, locals) {
            var i = 0,
               val;
            do {
               val = cspSafeGetterFn(pathKeys[i++], pathKeys[i++], pathKeys[i++], pathKeys[i++],
                  pathKeys[i++], fullExp, options)(scope, locals);

               locals = undefined; // clear after first iteration
               scope = val;
            } while (i < pathKeysLength);
            return val;
         };
      }
   } else {
      var code = 'var p;\n';
      forEach(pathKeys, function(key, index) {
         ensureSafeMemberName(key, fullExp);
         code += 'if(s == null) return undefined;\n' +
            's=' + (index
               // we simply dereference 's' on any .dot notation
               ?
               's'
               // but if we are first then we check locals first, and if so read it first
               :
               '((k&&k.hasOwnProperty("' + key + '"))?k:s)') + '["' + key + '"]' + ';\n';
      });
      code += 'return s;';

      /* jshint -W054 */
      var evaledFnGetter = new Function('s', 'k', 'pw', code); // s=scope, k=locals, pw=promiseWarning
      /* jshint +W054 */
      evaledFnGetter.toString = valueFn(code);
      fn = evaledFnGetter;
   }

   // Only cache the value if it's not going to mess up the cache object
   // This is more performant that using Object.prototype.hasOwnProperty.call
   if (path !== 'hasOwnProperty') {
      getterFnCache[path] = fn;
   }
   return fn;
}

var parse = Parser;
var filters = {};
var lexer = new Lexer({});
var parser = new Parser(lexer, function getFilter(name) {
   return filters[name];
});

/**
 * Compiles src and returns a function that executes src on a target object.
 * The compiled function is cached under compile.cache[src] to speed up further calls.
 *
 * @param {string} src
 * @returns {function}
 */
function compile(src) {
   var cached;

   if (typeof src !== "string") {
      throw new TypeError("src must be a string, instead saw '" + typeof src + "'");
   }

   if (!compile.cache) {
      return parser.parse(src);
   }

   cached = compile.cache[src];

   if (!cached) {
      cached = compile.cache[src] = parser.parse(src);
   }

   return cached;
}

/**
 * A cache containing all compiled functions. The src is used as key.
 * Set this on false to disable the cache.
 *
 * @type {object}
 */
compile.cache = {};

exports.Lexer = Lexer
exports.Parser = Parser;
exports.Compile = compile
exports.filters = filters;

});
return ___scope___.entry = "src/index.js";
});
FuseBox.pkg("extract-vars", {}, function(___scope___){
___scope___.file("dist/commonjs/index.js", function(exports, require, module, __filename, __dirname){ 

"use strict";
var Digger_1 = require("./Digger");
exports.dig = Digger_1.dig;

});
___scope___.file("dist/commonjs/Digger.js", function(exports, require, module, __filename, __dirname){ 

'use strict';
var ReserverdVariableDefinition_1 = require('./rules/collection/ReserverdVariableDefinition');
var TokenRules_1 = require('./rules/TokenRules');
var ValidCharacter_1 = require('./rules/ValidCharacter');
var ParserState_1 = require('./ParserState');
var States_1 = require('./States');
var Digger = function () {
    function Digger() {
        this.variables = [];
        this.state = new ParserState_1.ParserState();
        this.ignoreNext = false;
        this.rules = new TokenRules_1.TokenRules(this.state, [new ReserverdVariableDefinition_1.ReserverdVariableDefinition()]);
        this.state.set(States_1.States.PENDING_FOR_VARIABLE);
    }
    Digger.prototype.consumeVariable = function (char) {
        this.latest = this.latest || [];
        this.latest.push(char);
    };
    Digger.prototype.cancelCurrentVariable = function () {
        this.latest = null;
        this.state.set(States_1.States.PENDING_FOR_VARIABLE);
        this.state.unset(States_1.States.CONSUMING_VARIABLE);
    };
    Digger.prototype.cancelLatest = function () {
        if (!this.state.has(States_1.States.TOKEN_PERSISTED)) {
            this.variables.pop();
        }
    };
    Digger.prototype.accept = function (token) {
        return this.rules.verify(token);
    };
    Digger.prototype.consumeString = function (char) {
        this.consumingString = char;
    };
    Digger.prototype.ignoreUntilNot = function (char) {
        this.ignoredUntilNot = char;
    };
    Digger.prototype.finalizeVariable = function () {
        if (this.latest) {
            var tokenName = this.latest.join('');
            this.cancelCurrentVariable();
            if (this.accept(tokenName)) {
                if (!this.state.once(States_1.States.CANCEL_NEXT_TOKEN)) {
                    if (ValidCharacter_1.VariableCharacters.validVariableStart(tokenName[0])) {
                        this.variables.push(tokenName);
                    }
                    this.state.unset(States_1.States.TOKEN_PERSISTED);
                }
            }
        }
    };
    Digger.prototype.receive = function (char, end) {
        if (this.ignoreNext) {
            this.ignoreNext = false;
            return;
        }
        if (char === '\\') {
            this.ignoreNext = true;
            return;
        }
        if (this.state.once(States_1.States.EXPECT_ASSIGNING)) {
            if (char !== '=') {
                this.cancelLatest();
                this.state.set(States_1.States.CANCEL_NEXT_TOKEN);
            }
        }
        if (this.state.once(States_1.States.CANCEL_PREV_TOKEN)) {
            this.cancelLatest();
        }
        if (this.ignoredUntilNot) {
            if (this.ignoredUntilNot !== char) {
                delete this.ignoredUntilNot;
            } else {
                return;
            }
        }
        if (this.consumingString) {
            if (this.consumingString === char) {
                delete this.consumingString;
            }
            return;
        }
        if (this.state.has(States_1.States.PENDING_FOR_VARIABLE)) {
            if (ValidCharacter_1.VariableCharacters.isValid(char)) {
                this.state.unset(States_1.States.PENDING_FOR_VARIABLE);
                this.state.set(States_1.States.CONSUMING_VARIABLE);
            }
        }
        if (this.state.has(States_1.States.CONSUMING_VARIABLE)) {
            if (!ValidCharacter_1.VariableCharacters.isValid(char)) {
                if (char === '(') {
                    return this.cancelCurrentVariable();
                }
                if (!ValidCharacter_1.VariableCharacters.hasStringQuotes(char)) {
                    this.finalizeVariable();
                } else {
                    this.consumeVariable(char);
                }
            } else {
                this.consumeVariable(char);
                if (end) {
                    return this.finalizeVariable();
                }
            }
            return;
        }
        if (char === ':') {
            return this.state.set(States_1.States.CANCEL_PREV_TOKEN);
        }
        if (char === '=') {
            this.ignoreUntilNot(char);
            return this.state.set(States_1.States.EXPECT_ASSIGNING);
        }
        if (char === '\'' || char === '"' || char === '`') {
            this.state.set(States_1.States.TOKEN_PERSISTED);
            return this.consumeString(char);
        }
    };
    Digger.prototype.getVariables = function () {
        return this.variables.filter(function (varname) {
            var isValid = ValidCharacter_1.VariableCharacters.isValid(varname);
            return isValid;
        });
    };
    return Digger;
}();
exports.dig = function (expression) {
    var digger = new Digger();
    for (var i = 0; i < expression.length; i++) {
        digger.receive(expression[i], i === expression.length - 1);
    }
    var vars = digger.getVariables();
    return digger.variables;
};
});
___scope___.file("dist/commonjs/rules/collection/ReserverdVariableDefinition.js", function(exports, require, module, __filename, __dirname){ 

'use strict';
var __extends = this && this.__extends || function (d, b) {
    for (var p in b)
        if (b.hasOwnProperty(p))
            d[p] = b[p];
    function __() {
        this.constructor = d;
    }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var TokenRule_1 = require('../TokenRule');
var States_1 = require('../../States');
var ReserverdVariableDefinition = function (_super) {
    __extends(ReserverdVariableDefinition, _super);
    function ReserverdVariableDefinition() {
        _super.apply(this, arguments);
    }
    ReserverdVariableDefinition.prototype.getTokens = function () {
        return [
            'let',
            'var',
            'const'
        ];
    };
    ReserverdVariableDefinition.prototype.process = function (state, token) {
        state.set(States_1.States.TOKEN_PERSISTED);
        state.set(States_1.States.CANCEL_NEXT_TOKEN);
        return false;
    };
    return ReserverdVariableDefinition;
}(TokenRule_1.TokenRule);
exports.ReserverdVariableDefinition = ReserverdVariableDefinition;
});
___scope___.file("dist/commonjs/rules/TokenRule.js", function(exports, require, module, __filename, __dirname){ 

'use strict';
var TokenRule = function () {
    function TokenRule() {
    }
    TokenRule.prototype.getTokens = function () {
        return [];
    };
    TokenRule.prototype.belongs = function (token) {
        var tokens = this.getTokens();
        return tokens.indexOf(token) > -1;
    };
    TokenRule.prototype.process = function (state, token) {
        return true;
    };
    return TokenRule;
}();
exports.TokenRule = TokenRule;
});
___scope___.file("dist/commonjs/States.js", function(exports, require, module, __filename, __dirname){ 

'use strict';
(function (States) {
    States[States['PENDING_FOR_VARIABLE'] = 0] = 'PENDING_FOR_VARIABLE';
    States[States['READY_FOR_CONSUMING'] = 1] = 'READY_FOR_CONSUMING';
    States[States['CONSUMING_VARIABLE'] = 2] = 'CONSUMING_VARIABLE';
    States[States['CANCEL_NEXT_TOKEN'] = 3] = 'CANCEL_NEXT_TOKEN';
    States[States['CANCEL_PREV_TOKEN'] = 4] = 'CANCEL_PREV_TOKEN';
    States[States['TOKEN_PERSISTED'] = 5] = 'TOKEN_PERSISTED';
    States[States['STRING_CONSUMING'] = 6] = 'STRING_CONSUMING';
    States[States['STRING_CONSUMED'] = 7] = 'STRING_CONSUMED';
    States[States['EXPECT_ASSIGNING'] = 8] = 'EXPECT_ASSIGNING';
    States[States['VARIABLE_DECLARATION_SET'] = 9] = 'VARIABLE_DECLARATION_SET';
}(exports.States || (exports.States = {})));
var States = exports.States;
});
___scope___.file("dist/commonjs/rules/TokenRules.js", function(exports, require, module, __filename, __dirname){ 

'use strict';
var TokenRules = function () {
    function TokenRules(state, rules) {
        this.state = state;
        this.rules = rules;
    }
    TokenRules.prototype.verify = function (token) {
        var _this = this;
        var verified = true;
        this.rules.forEach(function (rule) {
            if (rule.belongs(token)) {
                verified = rule.process(_this.state, token);
            }
        });
        return verified;
    };
    return TokenRules;
}();
exports.TokenRules = TokenRules;
});
___scope___.file("dist/commonjs/rules/ValidCharacter.js", function(exports, require, module, __filename, __dirname){ 

'use strict';
var alphabet = 'abcdefghijklmnopqrstuvwxyz';
var VALID_VARIABLE_CHARS = '' + alphabet + alphabet.toUpperCase() + '$._[]1234567890';
var VALID_VARIABLE_START = '' + alphabet + alphabet.toUpperCase() + '$_';
var QUOTES = '`"\'';
var VariableCharacters = function () {
    function VariableCharacters() {
    }
    VariableCharacters.isValid = function (char) {
        return VALID_VARIABLE_CHARS.indexOf(char) > -1;
    };
    ;
    VariableCharacters.validVariableStart = function (char) {
        return VALID_VARIABLE_START.indexOf(char) > -1;
    };
    VariableCharacters.isValidVariable = function (varname) {
        for (var i = 0; i < varname.length; i++) {
            if (VALID_VARIABLE_CHARS.indexOf(varname[i]) < 0) {
                return false;
            }
        }
        return true;
    };
    VariableCharacters.hasStringQuotes = function (char) {
        var chars = [
            '\'',
            '"'
        ];
        return chars.indexOf(char) > -1;
    };
    return VariableCharacters;
}();
exports.VariableCharacters = VariableCharacters;
});
___scope___.file("dist/commonjs/ParserState.js", function(exports, require, module, __filename, __dirname){ 

'use strict';
var ParserState = function () {
    function ParserState() {
        this.states = new Set();
    }
    ParserState.prototype.set = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        for (var i = 0; i < arguments.length; i++) {
            var name_1 = arguments[i];
            if (!this.states.has(name_1)) {
                this.states.add(name_1);
            }
        }
    };
    ParserState.prototype.clean = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        for (var i = 0; i < arguments.length; i++) {
            var name_2 = arguments[i];
            this.states.delete(name_2);
        }
    };
    ParserState.prototype.has = function (name) {
        return this.states.has(name);
    };
    ParserState.prototype.once = function (name) {
        var valid = this.states.has(name);
        if (valid) {
            this.states.delete(name);
        }
        return valid;
    };
    ParserState.prototype.unset = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        for (var i = 0; i < arguments.length; i++) {
            var name_3 = arguments[i];
            this.states.delete(name_3);
        }
    };
    return ParserState;
}();
exports.ParserState = ParserState;
});
return ___scope___.entry = "dist/commonjs/index.js";
});
FuseBox.pkg("async-watch", {}, function(___scope___){
___scope___.file("src/async-watch.js", function(exports, require, module, __filename, __dirname){ 
var process = require("process");
var isNode = typeof module !== "undefined" && module.exports && typeof process === "object" && typeof window === "undefined";
// Make is compatable with node.js
var nextTick = isNode ? process.nextTick : window.requestAnimationFrame;

var fnIdCounter = 0;
/**
 * Postpones execution until the next frame
 * Overrides keys with the newest callback
 */
var AsyncTransaction = {
   jobs: {},
   _signed: {},
   subscriptions: {},
   scheduled: false,
   __subscribers: function(subCalls) {
      // calling subscribers
      for (var i in subCalls) {
         if (subCalls.hasOwnProperty(i)) {
            var changes = {};

            subCalls[i].fn.apply(null, [subCalls[i].values]);
         }
      }
   },
   __digest: function() {
      var self = this;
      if (self.scheduled === false) {
         self.scheduled = true;
         nextTick(function() {
            self.scheduled = false;
            for (var i in self.jobs) {
               self.jobs[i]();
               delete self.jobs[i];
            }
            var subCalls = {};
            for (var i in self._signed) {
               var task = self._signed[i];
               var arrayValue = task.target();
               task.signed.apply(null, arrayValue);
               // Check for subscriptions
               if (self.subscriptions[i]) {
                  var localId = self.subscriptions[i].$id;
                  //console.log(">>", localId, arrayValue)
                  subCalls[localId] = subCalls[localId] || {
                     values: {},
                     fn: self.subscriptions[i]
                  };
                  subCalls[localId].values[task.signed.$path] = arrayValue[0];
               }
               delete self._signed[i];
            }

            self.__subscribers(subCalls);
         });
      }
   },
   signFunction: function(fn) {
      fn.$id = fn.$id || fnIdCounter++;
   },
   subscribe: function(list, cb) {
      this.signFunction(cb);
      for (var i = 0; i < list.length; i++) {
         var watcher = list[i];
         this.subscriptions[watcher.fn.$id] = cb;
      }
   },
   unsubscribe: function(list) {
      for (var i = 0; i < list.length; i++) {
         var watcher = list[i];
         delete this.subscriptions[watcher.fn.$id];
      }
   },
   sign: function(signed, target) {
      this.signFunction(signed);

      if (signed.$instant) {
         return signed.apply(null, target());
      }
      this._signed[signed.$id] = {
         target: target,
         signed: signed
      }
      return this.__digest();
   },
   cancel: function(signed) {
      delete this._signed[signed.$id];
   },
   add: function(job_id, cb, $scope) {
      cb = $scope ? cb.bind($scope) : cb;
      this.jobs[job_id] = cb;
      return this.__digest();
   }
}
var Subscribe = function(watchers, fn) {
   AsyncTransaction.subscribe(watchers, fn);
   return {
      unsubscribe: function() {
         return AsyncTransaction.unsubscribe(watchers);
      },
      destroy: function() {
         AsyncTransaction.unsubscribe(watchers);
         for (var i in watchers) {
            var watcher = watchers[i];
            watcher.destroy();
         }
      }
   }
}

/**
 * dotNotation - A helper to extract dot notation
 *
 * @param  {type} path string or array
 * @return {type}      Object { path : ['a','b'], str : 'a.b'}
 */
function dotNotation(path) {
   if (path instanceof Array) {
      return {
         path: path,
         str: path.join('.')
      }
   }
   if (typeof path !== 'string') {
      return;
   }
   return {
      path: path.split('\.'),
      str: path
   }
}

/**
 * getPropertyValue - get a value from an object with dot notation
 *
 * @param  {type} obj  Target object
 * @param  {type} path dot notation
 * @return {type}      Target object
 */
function getPropertyValue(obj, path) {

   if (path.length === 0 || obj === undefined) {
      return undefined;
   }
   var notation = dotNotation(path);
   if (!notation) {
      return;
   }
   path = notation.path;
   for (var i = 0; i < path.length; i++) {
      obj = obj[path[i]];
      if (obj === undefined) {
         return undefined;
      }
   }
   return obj;
}

/**
 * setHiddenProperty - description
 *
 * @param  {type} obj   target object
 * @param  {type} key   property name
 * @param  {type} value default value
 * @return {type}       target object
 */
function setHiddenProperty(obj, key, value) {
   Object.defineProperty(obj, key, {
      enumerable: false,
      value: value
   });
   return value;
}

var idCounter = 0;

/**
 *  AsyncWatch
 *  AsyncWatch is a small library for watching javascript/node.js objects.
 *  It uses Object.defineProperty which makes it compatible with most browsers.
 *
 * @param  {type} self           Terget object
 * @param  {type} userPath       dot notation
 * @param  {type} callback       User callback
 * @param  {type} preventInitial System variable to prevent initial callback
 * @return {type}
 */
var AsyncWatch = function(self, userPath, callback, instant) {

   if (typeof self !== 'object' || typeof callback !== 'function') {
      return;
   }

   var notation = dotNotation(userPath);
   if (!notation) {
      return;
   }
   callback.$id = callback.$id || fnIdCounter++;

   if (instant) {
      callback.$instant = true;
   }

   var original = notation.path;
   var originStringUserPath = notation.str;;
   callback.$path = originStringUserPath;
   // root (a.b.c.d -> gives a)
   var root = original[0];

   // Copy of original array
   var keys = [];
   for (var i = 0; i < original.length; i++) {
      keys.push(original[i])
   }

   // Descendants
   var descendantsArray = keys.splice(1, keys.length);
   var descendantsPath = descendantsArray.join('.');
   var $isSingleProperty = root === originStringUserPath
   var $config = self.$$p;
   var $id;

   if (!$config) {
      // Creating configration
      setHiddenProperty(self, '$$p', {});
      // Creating a service callback
      $config = self.$$p;
      setHiddenProperty($config, '$properties', {});
      setHiddenProperty($config, '$id', ++idCounter);
   }
   if ($id === undefined) {
      $id = $config.$id;
   }

   var $prop = $config.$properties[root];

   if (!$prop) {

      // $prop = setHiddenProperty($config.$properties, root, {});
      // $prop.$self = [];
      // $prop.$descendants = {};
      $prop = $config.$properties[root] = {
         $self: [],
         $descendants: {}
      }
      var current = self[root];
      Object.defineProperty(self, root, {
         get: function() {
            return current;
         },
         set: function(newValue) {
            onRootPropertySet(newValue, current);
            current = newValue;
            return current;
         }
      });

      // Triggers when a root has changed
      // Here we need to verify
      // if we have an explicit callback to fire ($self)
      // Notify descendants
      var onRootPropertySet = function(value, oldValue) {
         // Trigger Descendants
         for (var descendantKey in $prop.$descendants) {
            if ($prop.$descendants.hasOwnProperty(descendantKey)) {

               for (var i in $prop.$descendants[descendantKey].callbacks) {
                  // Job id has to have a callback index attached
                  var job_id = $id + descendantKey + i;
                  var descendantCallback = $prop.$descendants[descendantKey].callbacks[i];

                  AsyncTransaction.sign(descendantCallback, function() {
                     return [getPropertyValue(value, descendantKey), oldValue];
                  });
               }

               AsyncTransaction.add($id + descendantKey, function() {
                  $prop.$descendants[this.key].bindWatcher();
               }, {
                  key: descendantKey
               });
            }
         }
         if ($isSingleProperty) {
            // Trigger $self watchers
            for (var i = 0; i < $prop.$self.length; i++) {
               var _cb = $prop.$self[i];
               if (_cb.$path) { // handle old value propertly
                  if (typeof oldValue === "object") {
                     oldValue = getPropertyValue(oldValue, _cb.$path)
                  }
               }
               AsyncTransaction.sign(_cb, function() {
                  return [value, oldValue];
               })
            }
         }
      }
   }

   // If we are watching explicitly for the root variable
   if ($isSingleProperty) {

      // Job id has to have a callback index attached
      AsyncTransaction.sign(callback, function() {
         return [self[root]];
      });
      //CallbackArrayCollection()
      $prop.$self.push(callback);

   } else {
      // We need to watch descendants
      if (!$prop.$descendants[descendantsPath]) {
         $prop.$descendants[descendantsPath] = {
            callbacks: [callback],
            bindWatcher: function() {

               if (self.hasOwnProperty(root) && self[root] !== undefined) {
                  // we want NEW data only here.
                  // Initial callback has been triggered
                  AsyncWatch(self[root], descendantsArray, function(value, oldValue) {
                     for (var i = 0; i < $prop.$descendants[descendantsPath].callbacks.length; i++) {
                        var _cb = $prop.$descendants[descendantsPath].callbacks[i];

                        AsyncTransaction.sign(_cb, function() {
                           return [value, oldValue];
                        });
                     }
                  }, true); // We don't want to call another callback here
               }
            }
         }

         $prop.$descendants[descendantsPath].bindWatcher();
      } else {
         $prop.$descendants[descendantsPath].callbacks.push(callback);
      }

      AsyncTransaction.sign(callback, function() {
         return [getPropertyValue(self[root], descendantsArray)];
      });
   }
   var dArray = $prop.$descendants[descendantsPath];
   return {
      fn: callback,
      destroy: function() {
         if (dArray) {
            var dIndex = dArray.callbacks.indexOf(callback);
            if (dIndex > -1) {
               dArray.callbacks.splice(dIndex, 1);
            }
         }
         if ($prop.$self) {
            var sIndex = $prop.$self.indexOf(callback);
            if (sIndex > -1) {
               $prop.$self.splice(dIndex, 1);
            }
         }
      }
   }
}

var AsyncComputed = function(obj, prop, deps, fn) {
   var watchers = [];
   for (var i = 0; i < deps.length; i++) {
      var _local = deps[i];
      watchers.push(AsyncWatch(obj, _local, function() {}));
   }
   return Subscribe(watchers, function() {
      obj[prop] = fn.bind(obj)(obj);
   });
}

var AsyncWatchArray = function(self, userPath, callback, instant) {
   var events = [];
   return AsyncWatch(self, userPath, function(array, oldvalue) {
      if (!array.$$p) {
         array.$$p = p = setHiddenProperty(array, '$pp', {});
      }
      var $config = array.$$p.array;
      if (!$config) {
         $config = setHiddenProperty(p, 'array', {});
      }
      if (!$config.watchers) {
         $config.watchers = setHiddenProperty($config, 'fn', []);
      }
      $config.watchers.push(callback);

      // Initialize array (prototyping push splice)
      if (!$config.init) {
         $config.init = true;

         $config.changed = function(evt) {
            if (evt.length > 0) {
               for (var i = 0; i < $config.watchers.length; i++) {
                  $config.watchers[i](array, events);
               }
            }
            events = [];
         }

         array.push = function() {
            Array.prototype.push.apply(this, arguments);
            var args = arguments;
            events.push({
               name: "push",
               data: args
            });
            AsyncTransaction.sign($config.changed, function() {
               return [events];
            });
         }
         array.shift = function() {

            var args = arguments;
            Array.prototype.shift.apply(this, arguments);
            events.push({
               name: "shift",
               data: args
            });

            AsyncTransaction.sign($config.changed, function() {
               return [events];
            });
         }
         array.splice = function() {

            var args = arguments;
            Array.prototype.splice.apply(this, arguments);
            events.push({
               name: "splice",
               data: args
            });

            AsyncTransaction.sign($config.changed, function() {
               return [events];
            });
         }
         array.unshift = function() {
            var args = arguments;
            Array.prototype.unshift.apply(this, args);
            events.push({
               name: "unshift",
               data: args
            });
            AsyncTransaction.sign($config.changed, function() {
               return [events];
            });
         }
      }
      // reset events
      events = [];
      // initial run
      return callback(array, [{
         name: 'init'
      }]);
   }, instant);
}

AsyncWatch.subscribe = Subscribe;
AsyncWatch.computed = AsyncComputed;
module.exports.AsyncWatch = AsyncWatch;
module.exports.AsyncSubscribe = Subscribe;
module.exports.AsyncComputed = AsyncComputed;
module.exports.AsyncWatchArray = AsyncWatchArray;
module.exports.AsyncTransaction = AsyncTransaction;

});
return ___scope___.entry = "src/async-watch.js";
});
FuseBox.pkg("process", {}, function(___scope___){
___scope___.file("index.js", function(exports, require, module, __filename, __dirname){ 

// From https://github.com/defunctzombie/node-process/blob/master/browser.js
// shim for using process in browser
if (FuseBox.isServer) {
    if (typeof __process_env__ !== "undefined") {
        Object.assign(global.process.env, __process_env__);
    }
    module.exports = global.process;
} else {
    var productionEnv = false; //require('@system-env').production;

    var process = module.exports = {};
    var queue = [];
    var draining = false;
    var currentQueue;
    var queueIndex = -1;

    function cleanUpNextTick() {
        draining = false;
        if (currentQueue.length) {
            queue = currentQueue.concat(queue);
        } else {
            queueIndex = -1;
        }
        if (queue.length) {
            drainQueue();
        }
    }

    function drainQueue() {
        if (draining) {
            return;
        }
        var timeout = setTimeout(cleanUpNextTick);
        draining = true;

        var len = queue.length;
        while (len) {
            currentQueue = queue;
            queue = [];
            while (++queueIndex < len) {
                if (currentQueue) {
                    currentQueue[queueIndex].run();
                }
            }
            queueIndex = -1;
            len = queue.length;
        }
        currentQueue = null;
        draining = false;
        clearTimeout(timeout);
    }

    process.nextTick = function(fun) {
        var args = new Array(arguments.length - 1);
        if (arguments.length > 1) {
            for (var i = 1; i < arguments.length; i++) {
                args[i - 1] = arguments[i];
            }
        }
        queue.push(new Item(fun, args));
        if (queue.length === 1 && !draining) {
            setTimeout(drainQueue, 0);
        }
    };

    // v8 likes predictible objects
    function Item(fun, array) {
        this.fun = fun;
        this.array = array;
    }
    Item.prototype.run = function() {
        this.fun.apply(null, this.array);
    };
    process.title = 'browser';
    process.browser = true;
    process.env = {
        NODE_ENV: productionEnv ? 'production' : 'development'
    };
    if (typeof __process_env__ !== "undefined") {
        Object.assign(process.env, __process_env__);
    }
    process.argv = [];
    process.version = ''; // empty string to avoid regexp issues
    process.versions = {};

    function noop() {}

    process.on = noop;
    process.addListener = noop;
    process.once = noop;
    process.off = noop;
    process.removeListener = noop;
    process.removeAllListeners = noop;
    process.emit = noop;

    process.binding = function(name) {
        throw new Error('process.binding is not supported');
    };

    process.cwd = function() { return '/' };
    process.chdir = function(dir) {
        throw new Error('process.chdir is not supported');
    };
    process.umask = function() { return 0; };

}
});
return ___scope___.entry = "index.js";
});

FuseBox.import("default/index.js");
FuseBox.main("default/index.js");
})
(function(e){var r="undefined"!=typeof window&&window.navigator;r&&(window.global=window),e=r&&"undefined"==typeof __fbx__dnm__?e:module.exports;var t=r?window.__fsbx__=window.__fsbx__||{}:global.$fsbx=global.$fsbx||{};r||(global.require=require);var n=t.p=t.p||{},i=t.e=t.e||{},a=function(e){if(/^([@a-z].*)$/.test(e)){if("@"===e[0]){var r=e.split("/"),t=r.splice(2,r.length).join("/");return[r[0]+"/"+r[1],t||void 0]}return e.split(/\/(.+)?/)}},o=function(e){return e.substring(0,e.lastIndexOf("/"))||"./"},f=function(){for(var e=[],r=0;r<arguments.length;r++)e[r]=arguments[r];for(var t=[],n=0,i=arguments.length;n<i;n++)t=t.concat(arguments[n].split("/"));for(var a=[],n=0,i=t.length;n<i;n++){var o=t[n];o&&"."!==o&&(".."===o?a.pop():a.push(o))}return""===t[0]&&a.unshift(""),a.join("/")||(a.length?"/":".")},u=function(e){var r=e.match(/\.(\w{1,})$/);if(r){var t=r[1];return t?e:e+".js"}return e+".js"},s=function(e){if(r){var t,n=document,i=n.getElementsByTagName("head")[0];/\.css$/.test(e)?(t=n.createElement("link"),t.rel="stylesheet",t.type="text/css",t.href=e):(t=n.createElement("script"),t.type="text/javascript",t.src=e,t.async=!0),i.insertBefore(t,i.firstChild)}},l=function(e,t){var i=t.path||"./",o=t.pkg||"default",s=a(e);s&&(i="./",o=s[0],t.v&&t.v[o]&&(o=o+"@"+t.v[o]),e=s[1]),/^~/.test(e)&&(e=e.slice(2,e.length),i="./");var l=n[o];if(!l){if(r)throw'Package was not found "'+o+'"';return{serverReference:require(o)}}e||(e="./"+l.s.entry);var c,p=f(i,e),v=u(p),d=l.f[v];return!d&&/\*/.test(v)&&(c=v),d||c||(v=f(p,"/","index.js"),d=l.f[v],d||(v=p+".js",d=l.f[v]),d||(d=l.f[p+".jsx"])),{file:d,wildcard:c,pkgName:o,versions:l.v,filePath:p,validPath:v}},c=function(e,t){if(!r)return t(/\.(js|json)$/.test(e)?global.require(e):"");var n;n=new XMLHttpRequest,n.onreadystatechange=function(){if(4==n.readyState&&200==n.status){var r=n.getResponseHeader("Content-Type"),i=n.responseText;/json/.test(r)?i="module.exports = "+i:/javascript/.test(r)||(i="module.exports = "+JSON.stringify(i));var a=f("./",e);d.dynamic(a,i),t(d.import(e,{}))}},n.open("GET",e,!0),n.send()},p=function(e,r){var t=i[e];if(t)for(var n in t){var a=t[n].apply(null,r);if(a===!1)return!1}},v=function(e,t){if(void 0===t&&(t={}),/^(http(s)?:|\/\/)/.test(e))return s(e);var i=l(e,t);if(i.serverReference)return i.serverReference;var a=i.file;if(i.wildcard){var f=new RegExp(i.wildcard.replace(/\*/g,"@").replace(/[.?*+^$[\]\\(){}|-]/g,"\\$&").replace(/@/g,"[a-z0-9$_-]+")),u=n[i.pkgName];if(u){var d={};for(var g in u.f)f.test(g)&&(d[g]=v(i.pkgName+"/"+g));return d}}if(!a){var m="function"==typeof t,_=p("async",[e,t]);if(_===!1)return;return c(e,function(e){if(m)return t(e)})}var h=i.validPath,x=i.pkgName;if(a.locals&&a.locals.module)return a.locals.module.exports;var w=a.locals={},b=o(h);w.exports={},w.module={exports:w.exports},w.require=function(e,r){return v(e,{pkg:x,path:b,v:i.versions})},w.require.main={filename:r?"./":global.require.main.filename,paths:r?[]:global.require.main.paths};var y=[w.module.exports,w.require,w.module,h,b,x];return p("before-import",y),a.fn.apply(0,y),p("after-import",y),w.module.exports},d=function(){function t(){}return Object.defineProperty(t,"isBrowser",{get:function(){return void 0!==r},enumerable:!0,configurable:!0}),Object.defineProperty(t,"isServer",{get:function(){return!r},enumerable:!0,configurable:!0}),t.global=function(e,t){var n=r?window:global;return void 0===t?n[e]:void(n[e]=t)},t.import=function(e,r){return v(e,r)},t.on=function(e,r){i[e]=i[e]||[],i[e].push(r)},t.exists=function(e){var r=l(e,{});return void 0!==r.file},t.remove=function(e){var r=l(e,{}),t=n[r.pkgName];t&&t.f[r.validPath]&&delete t.f[r.validPath]},t.main=function(e){return t.import(e,{})},t.expose=function(r){for(var t in r){var n=r[t],i=v(n.pkg);e[n.alias]=i}},t.dynamic=function(r,t){this.pkg("default",{},function(n){n.file(r,function(r,n,i,a,o){var f=new Function("__fbx__dnm__","exports","require","module","__filename","__dirname","__root__",t);f(!0,r,n,i,a,o,e)})})},t.pkg=function(e,r,t){if(n[e])return t(n[e].s);var i=n[e]={},a=i.f={};i.v=r;var o=i.s={file:function(e,r){a[e]={fn:r}}};return t(o)},t}();return d.packages=n,e.FuseBox=d}(this))
//# sourceMappingURL=./sourcemaps.js.map