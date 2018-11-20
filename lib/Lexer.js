'use strict';

const TAB = '	';

class StreamLexer {
	constructor() {
		this.reset('');
	}

	reset(data, { line = 1, col = 0 } = {}) {
		this.buffer = data;
		this.index = 0;
		this.line = line;
		this.lastLineBreak = -col;
	}

	next() {
		if (this.index >= this.buffer.length)
			return undefined;

		const ch = this.buffer[this.index];
		this.index += 1;
		if (ch === '\n') {
			this.line += 1;
			this.lastLineBreak = this.index;
		}
		return { value: ch };
	}

	save() {
		return {
			line: this.line,
			col: this.index - this.lastLineBreak,
		};
	}

	formatError(token, message) {
		const { buffer } = this;

		/*
		if (typeof buffer !== 'string')
			return `${message} at index ${this.index - 1}`;
		*/
		let nextLineBreak = buffer.indexOf('\n', this.index);
		if (nextLineBreak === -1)
			nextLineBreak = buffer.length;
		const line = buffer.substring(this.lastLineBreak, nextLineBreak);
		const col = this.index - this.lastLineBreak;
		let indent = 0;
		message += ` at line ${this.line} col ${col}:\n\n`;
		message += `  ${line.split('').map((a) => {
			if (a === TAB) {
				indent += 1;
				return '  ';
			}
			return a;
		}).join('')}\n`;
		message += `  ${Array(col + indent).join(' ')}^`;
		return message;
	}
}

module.exports = StreamLexer;
