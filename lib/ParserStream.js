'use strict';

const { Transform } = require('stream');

class ParserStream extends Transform {
	constructor(Parser) {
		super({ objectMode: true });
		this.parser = new Parser({
			onRootBlock: block => this.push(block),
			onError: error => this.emit('error', error),
		});
	}

	// eslint-disable-next-line class-methods-use-this
	_transform(chunk, enc, next) {
		this.parser.feed(chunk);
		next();
	}

	_final(next) {
		this.parser.end();
		next();
	}
}

module.exports = ParserStream;
