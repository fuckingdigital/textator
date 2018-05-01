# Textator (!WORK IN PROGRESS)

This repository contains a tool too easily build your own tokenizer.

## Simple usage

```JavaScript.es6
// Preperation BEGIN. Just do the following once.
const myTokens = [
    {   // detecting links
        regExp: /\[(.+?)\]\((.+?)\)/, // two vars: text & url
        process(meta, text, href) {
            return `<a href="${href}">${text}</a>`;
        }
    },
    {   // detecting line breaks
        regExp: /(\n)/,
        process(meta, linebreak) {
            return `<br />`;
        }
    },
];
const customParser = new Textator(myTokens);
// Preperation END. customParser is ready to go.

const input = 'Some super cool text which contains a [link](http://example.com) and... \n also a line break.';

// maybe better serialize your input before processing it.
const output = customParser(input);

console.log(output);
// Some super cool text which contains a <a href="http://example.com">link</a>and... <br /> also a line break.

```