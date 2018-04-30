"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// TODO: Inline and Block tokens.....process both?


/**
 * This class is builds a tokenizer and parser for you.
 * On construction it returns a function which you can use for parsing texts.
 * 
 * @version 1.0.0
 * @param {array( type: string || number, regExp: Object, process: function)} tokens - Consists of token schema that will be the base for detection and a function for parsing
 */

var __DEFAULT__ = "NO_MATCH";

var defaultToken = { // TODO....we do not need a default token....matches every char....inperformant...better just skip chars and recognize that chars have been skipped and then process the skipMatch
    type: __DEFAULT__,
    regExp: /.+?/
};

var Textator = function () {
    function Textator() {
        var _this = this;

        var tokens = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : { dontReturnNoMatch: false, noMatchProcess: function noMatchProcess(meta, match) {
                return match;
            } };

        _classCallCheck(this, Textator);

        this._tokens = tokens;
        if (!options.dontReturnNoMatch) {
            defaultToken.process = options.noMatchProcess;
            this._tokens.push(defaultToken);
        }
        this._argumentToToken = [];
        var counter = 0;
        // collect all regular expressions in an array
        var regExps = this._tokens.map(function (t, i) {
            // prepare the argumentToToken pointer for token detection later on
            var argsCount = t.process.length;
            for (var j = 0; j < argsCount; j++) {
                counter++;
                _this._argumentToToken[counter] = i;
            }
            _this._tokens[i].argsLength = argsCount - 1; // should be -1 because the first argument in the process function is the ‘match’ and is mandatory and we just need the self-created arguments
            _this._tokens[i].type = _this._tokens[i].type || i; // let’s make the result readable
            // regExps will be an array of all regular expressions, so return every single one
            return t.regExp;
        });
        // put all regular expressions together
        this._masterRegExp = new RegExp(regExps.map(function (re) {
            return "(" + re.source + ")";
        }).join("|"), "g");
        this._result = [];
        this._buffer = [];

        return this._run.bind(this);
    }

    _createClass(Textator, [{
        key: "_reset",
        value: function _reset() {
            this._result.length = 0;
            this._buffer.length = 0;
            this._index = 0;
        }
    }, {
        key: "_pushBuffer",
        value: function _pushBuffer(t) {
            this._buffer.push(t);
        }
    }, {
        key: "_popBuffer",
        value: function _popBuffer() {
            var syntheticMatch = this._buffer.map(function (t) {
                return t.match;
            }).join('');
            this._buffer.length = 0;
            var tokTok = {
                type: __DEFAULT__,
                args: [syntheticMatch], // there are no
                match: syntheticMatch,
                processed: defaultToken.process({ match: syntheticMatch }, syntheticMatch)
            };
            return tokTok;
        }
    }, {
        key: "_run",
        value: function _run() {
            var input = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";

            if (!input.length) {
                return [];
            }
            this._reset();
            var matches = void 0;

            while (matches = this._masterRegExp.exec(input)) {
                // detect which token...
                var match = matches[0];
                var matchIndex = matches.indexOf(match, 1);
                var matchedToken = this._tokens[this._argumentToToken[matchIndex]];
                var fromIndex = matchIndex + 1;
                var matchedArguments = matches.slice(fromIndex, fromIndex + matchedToken.argsLength);
                var type = matchedToken.type;

                var toktok = { // recognized token
                    type: type,
                    match: match,
                    args: matchedArguments,
                    processed: matchedToken.process.apply(matchedToken, [{ match: match }].concat(_toConsumableArray(matchedArguments)))
                };
                if (type === __DEFAULT__) {
                    this._pushBuffer(toktok);
                } else {
                    if (this._buffer.length) {
                        // seems to be a collection of defaults around here
                        this._result.push(this._popBuffer());
                    }
                    this._result.push(toktok);
                }
            }
            if (this._buffer.length) {
                // seems to be a collection of defaults around here
                this._result.push(this._popBuffer());
            }
            return this._result;
        }
    }]);

    return Textator;
}();

exports.default = Textator;
