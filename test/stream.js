'use strict';

const fs = require('fs');
const path = require('path');
const { Writable } = require('stream');

const { expect } = require('chai');

const { Parser, folder, files } = require('./defs');

class W extends Writable {
	constructor() {
		super({ objectMode: true });
		this.data = [];
	}

	// eslint-disable-next-line class-methods-use-this
	_write(_, a, n) {
		this.data.push(_);
		n();
	}
}

describe('The STREAM Parser must', () => {
	it('parse a big file and return a non empty array', () => {
		const file = path.join(__dirname, folder, files.valid.big);
		const readStream = fs.createReadStream(file, { encoding: 'utf8' });
		const ParserStream = Parser.createStream();
		const WR = new W();

		readStream.pipe(ParserStream).pipe(WR);

		WR.on('finish', () => {
			const dataLength = WR.data.length;
			const expectedLength = 1471;
			readStream.destroy();
			ParserStream.destroy();
			WR.destroy();

			expect(dataLength).to.be.equal(expectedLength);
		});
	});
});

describe('The STREAM Parser must', () => {
	it('throw Unexpected EOF error', () => {
		const file = path.join(__dirname, folder, files.invalid.eof);
		const readStream = fs.createReadStream(file, { encoding: 'utf8' });
		const ParserStream = Parser.createStream();

		readStream
			.pipe(ParserStream)
			.on('error', (error) => {
				expect(error).to.be.a('Error');
			});
	});

	it('throw Invalid (main) block declaration', () => {
		const file = path.join(__dirname, folder, files.invalid.mainBlock);
		const readStream = fs.createReadStream(file, { encoding: 'utf8' });
		const ParserStream = Parser.createStream();

		readStream
			.pipe(ParserStream)
			.on('error', (error) => {
				expect(error).to.be.a('Error');
			});
	});

	it('throw Invalid (inner) block declaration', () => {
		const file = path.join(__dirname, folder, files.invalid.innerBlock);
		const readStream = fs.createReadStream(file, { encoding: 'utf8' });
		const ParserStream = Parser.createStream();

		readStream
			.pipe(ParserStream)
			.on('error', (error) => {
				expect(error).to.be.a('Error');
			});
	});

	it('throw Invalid tag declaration', () => {
		const file = path.join(__dirname, folder, files.invalid.tagDeclaration);
		const readStream = fs.createReadStream(file, { encoding: 'utf8' });
		const ParserStream = Parser.createStream();

		readStream
			.pipe(ParserStream)
			.on('error', (error) => {
				expect(error).to.be.a('Error');
			});
	});

	it('throw Invalid integer format', () => {
		const file = path.join(__dirname, folder, files.invalid.integer);
		const readStream = fs.createReadStream(file, { encoding: 'utf8' });
		const ParserStream = Parser.createStream();

		readStream
			.pipe(ParserStream)
			.on('error', (error) => {
				expect(error).to.be.a('Error');
			});
	});

	it('throw Invalid date format', () => {
		const file = path.join(__dirname, folder, files.invalid.dateFormat);
		const readStream = fs.createReadStream(file, { encoding: 'utf8' });
		const ParserStream = Parser.createStream();

		readStream
			.pipe(ParserStream)
			.on('error', (error) => {
				expect(error).to.be.a('Error');
			});
	});

	it('throw Invalid currency format', () => {
		const file = path.join(__dirname, folder, files.invalid.currency);
		const readStream = fs.createReadStream(file, { encoding: 'utf8' });
		const ParserStream = Parser.createStream();

		readStream
			.pipe(ParserStream)
			.on('error', (error) => {
				expect(error).to.be.a('Error');
			});
	});

	it('throw Unexpected literal character', () => {
		const file = path.join(__dirname, folder, files.invalid.literalChar);
		const readStream = fs.createReadStream(file, { encoding: 'utf8' });
		const ParserStream = Parser.createStream();

		readStream
			.pipe(ParserStream)
			.on('error', (error) => {
				expect(error).to.be.a('Error');
			});
	});

	it('throw Unexpected character (Invalid block name)', () => {
		const file = path.join(__dirname, folder, files.invalid.blockName);
		const readStream = fs.createReadStream(file, { encoding: 'utf8' });
		const ParserStream = Parser.createStream();

		readStream
			.pipe(ParserStream)
			.on('error', (error) => {
				expect(error).to.be.a('Error');
			});
	});

	it('throw Unexpected character (Invalid tag name - first char)', () => {
		const file = path.join(__dirname, folder, files.invalid.tagNameFirstChar);
		const readStream = fs.createReadStream(file, { encoding: 'utf8' });
		const ParserStream = Parser.createStream();

		readStream
			.pipe(ParserStream)
			.on('error', (error) => {
				expect(error).to.be.a('Error');
			});
	});

	it('throw Unexpected character (Invalid tag name - not first char)', () => {
		const file = path.join(__dirname, folder, files.invalid.tagNameMiddlechar);
		const readStream = fs.createReadStream(file, { encoding: 'utf8' });
		const ParserStream = Parser.createStream();

		readStream
			.pipe(ParserStream)
			.on('error', (error) => {
				expect(error).to.be.a('Error');
			});
	});

	it('throw Unexpected character (file begins wrong)', () => {
		const file = path.join(__dirname, folder, files.invalid.blockStart);
		const readStream = fs.createReadStream(file, { encoding: 'utf8' });
		const ParserStream = Parser.createStream();

		readStream
			.pipe(ParserStream)
			.on('error', (error) => {
				expect(error).to.be.a('Error');
			});
	});

	it('throw invalid block declaration', () => {
		const file = path.join(__dirname, folder, files.invalid.blockDeclaration);
		const readStream = fs.createReadStream(file, { encoding: 'utf8' });
		const ParserStream = Parser.createStream();

		readStream
			.pipe(ParserStream)
			.on('error', (error) => {
				expect(error).to.be.a('Error');
			});
	});

	it('throw invalid block declaration ( name missing )', () => {
		const file = path.join(__dirname, folder, files.invalid.blockMissingName);
		const readStream = fs.createReadStream(file, { encoding: 'utf8' });
		const ParserStream = Parser.createStream();

		readStream
			.pipe(ParserStream)
			.on('error', (error) => {
				expect(error).to.be.a('Error');
			});
	});
});
