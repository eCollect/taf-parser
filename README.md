[![Build Status](https://travis-ci.org/eCollect/taf-parser.svg?branch=master)](https://travis-ci.org/eCollect/taf-parser) [![Coverage Status](https://coveralls.io/repos/github/eCollect/taf-parser/badge.svg?branch=master)](https://coveralls.io/github/eCollect/taf-parser?branch=master) [![Known Vulnerabilities](https://snyk.io/test/github/eCollect/taf-parser/badge.svg)](https://snyk.io/test/github/eCollect/taf-parser) [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](/eCollect/pateka/blob/master/LICENSE)

# TAF parser

'Tagged Format' (TAF) files are files that can be used to export and import data sets used by the accounting system of Sage 50.

The parser goes through a string content or a stream of data and detects one error at a time in the structure.

## Installation

To install the parser, just type in your console:

```shell
$ npm install taf-parser
```

## Usage

This parser can be used to:  

* **Parse a string**  
In this case it will return an array of objects that represents the data in the content upon success, or throw an error that shows what and where is the error happening. This method is recomended for small to midsize content that can be passed a string.  
For larger data use the stream capabilities.

* **Parse a stream of data**  
When dealing with large content it is recomended to use the parser to create a stream that can be combined with other streams. The stream pushes correctly parsed block of data down to the next stream. In case of an error, an `error` event is emited.

First, require the parser:
```javascript
const Parser = require('taf-parser');
```

### Parsing a string

```javascript
const str = `
    {Blg BlgNr=983984 GFNr=994885 Date=25.10.2017 Orig=0 MType=2
    	{Bk AccId=1022 Type=0 CAcc=div  ValNt=342.6  Text="Explain this some text"}
    }`;
const result = Parser.parse(str);
```

Or if you have a file:
```javascript
const fs = require('fs');
const fileName = 'your_taf_file_name.taf';
const result = Parser.parse(fs.readFileSync(fileName, { encoding: 'utf8' }));
```

In both cases, if the parser finds an error it will throw it, showing what is wrong and where it is located.

If there is no error, the result will be an array of objects, representing the data in the file. In the case of the example string given above, the result array will be as follows:
```javascript
[
    {
        type: 'Blg',
        BlgNr: 983984,
        GFNr: 994885,
        Date: '2017-10-25T11:43:59.208Z',
        Orig: 0,
        MType: 2,
        Bk: [
            {
                type: 'Bk',
                AccId: '1022',
                Type: 0,
                CAcc: 'div',
                ValNt: 342.6,
                Text: 'Explain this some text'
            }
        ]
    }
]
```


### Parsing/Using streams

To use streams, just create parser stream like this:
```javascript
const ParseStream = Parser.createStream();
```

The newly created stream is a Transform stream, that expects data flowing to it and as a result pushes to the next stream javascript object representation of each successfully parsed block of data.  
In the case of an error the stream will emit an `error` event.

**Streams example**
```javascript
const fs = require('fs');			// will use fs to create readabele file stream
const { Writable } = require('stream');		// will use writable stream to collect all the data

const Parser = require('taf-parser');	// require the Parser

class W extends Writable {
	constructor() {
		super({ objectMode: true });
		this.data = [];
	}

	_write(block, a, n) {
		this.data.push(block);
		n();
	}
}

const file = 'some_taf_file.taf';
const readStream = fs.createReadStream(file, { encoding: 'utf8' });
const Writer = new W();
const ParseStream = Parser.createStream();	// create stream parser

readStream
	.pipe(ParseStream)
	.pipe(Writer);

// you can listen for an 'error' event from ParseStream
ParseStream.on('error', (error) => {
	console.log(error);
});

// and 'finish' from the Writer where all the data is collected
Writer.on('finish', () => {
	// Writer.data holds all the data
	console.log(Writer.data); // or do something else
});
```

## Knowledge base

## Licensing

Copyright (c) 2018 eCollect AG.
Licensed under the [MIT](LICENSE) license.
