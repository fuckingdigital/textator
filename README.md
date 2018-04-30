# Textator (!WORK IN PROGRESS)

This repository contains a tool too easily build your own tokenizer.

## Simple usage

```JavaScript.es6
const myTokens = [
    {   // detecting links
        regExp: /\[(.+?)\]\((.+?)\)/, // two vars: text & url
        process(meta, text, href) {
            return `<a href="${href}">${text}</a>`;
        }
    },
    {   // detecting line breaks
        regExp: /(\\n)/,
        process(meta, linebreak) {
            return `<br />`;
        }
    },
];
const customParser = new Textator(myTokens, { noMatchProcess(meta, leftovers) { return leftovers; }});
```