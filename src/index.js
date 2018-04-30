// TODO: Inline and Block tokens.....process both?


/**
 * This class is builds a tokenizer and parser for you.
 * On construction it returns a function which you can use for parsing texts.
 * 
 * @version 1.0.0
 * @param {array( type: string || number, regExp: Object, process: function)} tokens - Consists of token schema that will be the base for detection and a function for parsing
 */

const __DEFAULT__ = "NO_MATCH";

const defaultToken = { // TODO....we do not need a default token....matches every char....inperformant...better just skip chars and recognize that chars have been skipped and then process the skipMatch
    type: __DEFAULT__,
    regExp: /.+?/
};

class Textator {
    constructor(tokens = [], options = { dontReturnNoMatch: false, noMatchProcess: (meta, match) => match }) {
        this._tokens = tokens;
        if (!options.dontReturnNoMatch) {
            defaultToken.process = options.noMatchProcess;
            this._tokens.push(defaultToken);
        }
        this._argumentToToken = [];
        let counter = 0;
        // collect all regular expressions in an array
        const regExps = this._tokens.map((t,i) => {
            // prepare the argumentToToken pointer for token detection later on
            const argsCount = t.process.length;
            for (let j = 0; j < argsCount; j++) {
                counter++;
                this._argumentToToken[counter]=i;
            }
            this._tokens[i].argsLength = argsCount - 1; // should be -1 because the first argument in the process function is the ‘match’ and is mandatory and we just need the self-created arguments
            this._tokens[i].type = this._tokens[i].type || i; // let’s make the result readable
            // regExps will be an array of all regular expressions, so return every single one
            return t.regExp;
        });
        // put all regular expressions together
        this._masterRegExp = new RegExp(regExps.map(re => `(${re.source})`).join("|"), "g");
        this._result = [];
        this._buffer = [];

        return this._run.bind(this);
    }
    _reset() {
        this._result.length = 0;
        this._buffer.length = 0;
        this._index = 0;
    }
    _pushBuffer(t) {
        this._buffer.push(t);
    }
    _popBuffer() {
        const syntheticMatch = this._buffer.map(t => t.match).join('');
        this._buffer.length = 0;
        const tokTok = {
            type: __DEFAULT__,
            args: [ syntheticMatch ], // there are no
            match: syntheticMatch,
            processed: defaultToken.process({ match: syntheticMatch }, syntheticMatch)
        };
        return tokTok;
    }
    _run(input = "") {
        if (!input.length) {
            return [];
        }
        this._reset();
        let matches;
        
        while (matches = this._masterRegExp.exec(input)) {
            // detect which token...
            const match = matches[0];
            const matchIndex = matches.indexOf(match,1);
            const matchedToken = this._tokens[this._argumentToToken[matchIndex]];
            const fromIndex = matchIndex + 1;
            const matchedArguments = matches.slice(fromIndex, fromIndex + matchedToken.argsLength);
            const { type } = matchedToken;
            const toktok = { // recognized token
                type,
                match,
                args: matchedArguments,
                processed: matchedToken.process({ match }, ...matchedArguments)
            }
            if (type === __DEFAULT__) {
                this._pushBuffer(toktok);
            } else {
                if (this._buffer.length) {
                    // seems to be a collection of defaults around here
                    this._result.push(this._popBuffer());
                }
                this._result.push(toktok)
            }
        }
        if (this._buffer.length) {
            // seems to be a collection of defaults around here
            this._result.push(this._popBuffer());
        }
        return this._result;
    }
}

export default Textator;