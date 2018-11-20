'use strict';

const fs = require('fs');
const path = require('path');

const { expect } = require('chai');

const { Parser, folder, files } = require('./defs');

describe('The STRING Parser must', () => {
	it('parse a big file and return a non empty array', () => {
		const file = path.join(__dirname, folder, files.valid.big);

		expect(() => Parser.parse(fs.readFileSync(file, { encoding: 'utf8' }))).to.not.throw();
	});
});

describe('The STRING Parser must', () => {
	it('throw Unexpected EOF error', () => {
		const file = path.join(__dirname, folder, files.invalid.eof);

		expect(() => Parser.parse(fs.readFileSync(file, { encoding: 'utf8' }))).to.throw();
	});

	it('throw Invalid (main) block declaration', () => {
		const file = path.join(__dirname, folder, files.invalid.mainBlock);

		expect(() => Parser.parse(fs.readFileSync(file, { encoding: 'utf8' }))).to.throw();
	});

	it('throw Invalid (inner) block declaration', () => {
		const file = path.join(__dirname, folder, files.invalid.innerBlock);

		expect(() => Parser.parse(fs.readFileSync(file, { encoding: 'utf8' }))).to.throw();
	});

	it('throw Invalid tag declaration', () => {
		const file = path.join(__dirname, folder, files.invalid.tagDeclaration);

		expect(() => Parser.parse(fs.readFileSync(file, { encoding: 'utf8' }))).to.throw();
	});

	it('throw Invalid integer format', () => {
		const file = path.join(__dirname, folder, files.invalid.integer);

		expect(() => Parser.parse(fs.readFileSync(file, { encoding: 'utf8' }))).to.throw();
	});

	it('throw Invalid date format', () => {
		const file = path.join(__dirname, folder, files.invalid.dateFormat);

		expect(() => Parser.parse(fs.readFileSync(file, { encoding: 'utf8' }))).to.throw();
	});

	it('throw Invalid currency format', () => {
		const file = path.join(__dirname, folder, files.invalid.currency);

		expect(() => Parser.parse(fs.readFileSync(file, { encoding: 'utf8' }))).to.throw();
	});

	it('throw Unexpected literal character', () => {
		const file = path.join(__dirname, folder, files.invalid.literalChar);

		expect(() => Parser.parse(fs.readFileSync(file, { encoding: 'utf8' }))).to.throw();
	});

	it('throw Unexpected character (Invalid block name)', () => {
		const file = path.join(__dirname, folder, files.invalid.blockName);

		expect(() => Parser.parse(fs.readFileSync(file, { encoding: 'utf8' }))).to.throw();
	});

	it('throw Unexpected character (Invalid tag name - first char)', () => {
		const file = path.join(__dirname, folder, files.invalid.tagNameFirstChar);

		expect(() => Parser.parse(fs.readFileSync(file, { encoding: 'utf8' }))).to.throw();
	});

	it('throw Unexpected character (Invalid tag name - not first char)', () => {
		const file = path.join(__dirname, folder, files.invalid.tagNameMiddlechar);

		expect(() => Parser.parse(fs.readFileSync(file, { encoding: 'utf8' }))).to.throw();
	});

	it('throw Unexpected character (file begins wrong)', () => {
		const file = path.join(__dirname, folder, files.invalid.blockStart);

		expect(() => Parser.parse(fs.readFileSync(file, { encoding: 'utf8' }))).to.throw();
	});

	it('throw invalid block declaration', () => {
		const file = path.join(__dirname, folder, files.invalid.blockDeclaration);

		expect(() => Parser.parse(fs.readFileSync(file, { encoding: 'utf8' }))).to.throw();
	});

	it('throw invalid block declaration ( name missing )', () => {
		const file = path.join(__dirname, folder, files.invalid.blockMissingName);

		expect(() => Parser.parse(fs.readFileSync(file, { encoding: 'utf8' }))).to.throw();
	});
});
