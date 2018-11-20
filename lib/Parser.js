'use strict';

const StreamLexer = require('./Lexer');
const ParserStream = require('./ParserStream');

const OPEN_BLOCK = '{';
const CLOSE_BLOCK = '}';
const SEPARATOR = ' ';
const TAB = '	';
const NEW_LINE = '\n';
const VALUE_ASSIGN = '=';

const LITERAL_STRING_OPEN_C_FLAVOUR = '"';
const LITERAL_STRING_OPEN_JS_FLAVOUR = "'";

const valueOp = v => v;
const noop = () => {};

const ALPHA_REGEX = /[A-Za-z]/;
const BOOLEAN_REGEX = /(0$)|(^1$)/;
const NUMERIC_REGEX = /[0-9]/;
const DECIMAL_REGEX = /[0-9.]/;
const ALPHANUMERIC_REGEX = /[A-Za-z0-9.]/;
const DATE_CHAR_REGEX = /[0-9.]/;
// const CURRENCY_REGEX = /\d+(\.\d{1,2})?/;
const CURRENCY_REGEX = /^(\d)*(\.)*(\d{1,2})*$/;
// const LITERAL_STRING_OPEN = /['"]/;
// const LITERAL_STRING_BODY_REGEX = /[^"}]/;

const isWhiteSpace = c => (c === SEPARATOR || c === TAB || c === NEW_LINE);

const isAlpha = c => ALPHA_REGEX.test(c);
const isNumeric = c => NUMERIC_REGEX.test(c);
const isAlphanumeric = c => ALPHANUMERIC_REGEX.test(c);

const isDecimal = c => DECIMAL_REGEX.test(c);
const isBoolean = c => BOOLEAN_REGEX.test(c);

const isLiteralStringValid = (c, b) => !(c === NEW_LINE || c === b);
const isLiteralStringOpen = c => (c === LITERAL_STRING_OPEN_C_FLAVOUR || c === LITERAL_STRING_OPEN_JS_FLAVOUR);

const types = {
	Boolean: {
		isValidChar: isBoolean,
		value: v => Boolean(Number(v)),
	},
	String: {
		isValidChar: isAlphanumeric,
		value: valueOp,
	},
	Currency: {
		isValidChar: isDecimal,
		value(v) {
			if (!CURRENCY_REGEX.test(v))
				throw new Error('Invalid currency format');
			return parseFloat(v);
		},
	},
	Integer: {
		isValidChar: isNumeric,
		value: parseInt,
	},
	Date: {
		isValidChar: c => DATE_CHAR_REGEX.test(c),
		value(value) {
			const [, dd, mm, yy] = value.match(/^([0-9]{2})\.([0-9]{2})\.([0-9]{4})$/);
			const day = Number(dd);
			const month = Number(mm) - 1;
			if (day > 31 || month > 11)
				throw Error('Invalid date format.');
			const date = new Date();
			date.setDate(day);
			date.setMonth(month);
			date.setFullYear(yy);
			return date;
		},
	},
};

const sage50Rules = {
	blocks: {
		Acc: {
			tags: {
				AccId: types.String,
				Code: types.String,
				CstId: types.String,
				CurId: types.String,
				FCdt: types.Currency,
				FDbt: types.Currency,
				FFwd: types.Currency,
				Flags: types.Integer,
				MBdg: types.Currency,
				MBdg2: types.Currency,
				MCdt: types.Currency,
				MDbt: types.Currency,
				MFwd: types.Currency,
				MPrv: types.Currency,
				NCdt: types.Integer,
				NDbt: types.Integer,
				TaxId: types.String,
				Text: types.String,
				Text2: types.String,
				Text3: types.String,
				Text4: types.String,
				Type: types.Integer,
			},
		},
		Blg: {
			tags: {
				BlgNr: types.Integer,
				Date: types.Date,
				Grp: types.String,
				MType: types.Integer,
				Orig: types.Integer,
				GFNr: types.Integer,
			},
			blocks: {
				Bk: {
					tags: {
						AccId: types.String,
						BType: types.Integer,
						CAcc: types.String,
						CIdx: types.Integer,
						Code: types.String,
						Date: types.Date,
						Flags: types.Integer,
						TaxId: types.String,
						Text: types.String,
						Text2: types.String,
						TIdx: types.Integer,
						Type: types.Boolean,
						ValNt: types.Currency,
						ValTx: types.Currency,
						ValFW: types.Currency,
						OpId: types.String,
						PkKey: types.Integer,
					},
				},
			},
		},
		Sys: {
			tags: {
				Chars: types.String,
				FmtD: types.String,
				MGoto: types.String,
				MName: types.String,
				MType: types.Integer,
			},
		},
	},
};

const states = {
	root: {
		process({ blockRules }, char) {
			if (isWhiteSpace(char))
				return undefined;

			if (char === OPEN_BLOCK)
				return this.nextState('blockDeclaration', {
					blockRules,
					parent: { name: 'root' },
					name: '',
				});

			return 'Unexpected char';
		},
		transition: {
			to(_, { block }) {
				this.emit(block);
			},
			from: noop,
		},
	},
	blockDeclaration: {
		process(state, char) {
			if (isAlpha(char)) {
				state.name += char;
				return null;
			}

			if (isWhiteSpace(char))
				return this.nextState('blockDefinition', {});

			return 'Unexpected char';
		},
		transition: {
			to(current, { blockRules }) {
				if (!blockRules.blocks)
					return 'Invalid block declaration';
				return '';
			},
			from({ name, blockRules, parent }, next) {
				if (!name)
					return 'Invalid block declaration';

				const subBlockRules = blockRules.blocks[name];

				if (!subBlockRules)
					return `Unknown block ${name}`;

				next.blockRules = subBlockRules;
				next.block = {
					type: name,
				};
				next.parent = parent;
				next.parent.blockRules = blockRules;

				return null;
			},
		},
	},
	blockDefinition: {
		process(state, char) {
			if (isAlphanumeric(char))
				return this.nextState('tagDeclaration', {
					name: char,
					block: state.block,
					blockRules: state.blockRules,
					parent: state.parent,
				});

			if (isWhiteSpace(char))
				return undefined;

			if (char === OPEN_BLOCK)
				return this.nextState('blockDeclaration', {
					parent: {
						name: 'blockDefinition',
						block: state.block,
						parent: state.parent,
					},
					blockRules: state.blockRules,
					name: '',
				});

			if (char === CLOSE_BLOCK) {
				const { parent, block } = state;

				if (parent.block) {
					parent.block[block.type] = parent.block[block.type] || [];
					parent.block[block.type].push(block);
				} else {
					parent.block = block;
				}
				return this.nextState(state.parent.name, parent);
			}

			return 'Unexpected charatcher';
		},
		transition: {
			to: noop,
			from: noop,
		},
	},
	tagDeclaration: {
		process(state, char) {
			if (isAlphanumeric(char)) {
				state.name += char;
				return null;
			}

			if (char === VALUE_ASSIGN)
				return this.nextState('tagValueAssignment', {
					stringValue: '',
					tagName: state.name,
				});

			return 'Unexpected charachter';
		},
		transition: {
			to: noop,
			from({
				name, blockRules, block, parent,
			}, next) {
				const tagRules = blockRules.tags[name];

				if (!tagRules)
					return `Unknown tag ${name}`;

				next.tagRules = tagRules;
				next.block = block;
				next.parent = parent;
				next.blockRules = blockRules;

				return null;
			},
		},
	},
	tagValueAssignment: {
		process(state, char) {
			if (!state.stringValue && isLiteralStringOpen(char)) {
				state.char = char;
				return this.nextState('literalStringValue', state);
			}

			if (state.tagRules.isValidChar(char)) {
				state.stringValue += char;
				return null;
			}

			if (isWhiteSpace(char))
				return this.nextState('blockDefinition', {
					blockRules: state.blockRules,
				});

			if (char === CLOSE_BLOCK) {
				const { parent, block } = state;

				if (parent.block) {
					parent.block[block.type] = parent.block[block.type] || [];
					parent.block[block.type].push(block);
				} else {
					parent.block = block;
				}
				state.isClose = true;
				return this.nextState(state.parent.name, parent);
			}


			return 'Unexpected charachter';
		},
		transition: {
			to: noop,
			from({
				stringValue,
				tagName,
				tagRules,

				parent,
				block,
				blockRules,
				isClose,
			}, next) {
				try {
					block[tagName] = tagRules.value(stringValue);
				} catch (e) {
					return e.message;
				}

				if (isClose)
					return null;

				// pass values
				next.parent = parent;
				next.block = block;
				next.blockRules = blockRules;
				return null;
			},
		},
	},
	literalStringValue: {
		process(state, char) {
			if (char === state.char)
				return this.nextState('blockDefinition', {
					blockRules: state.blockRules,
				});

			if (isLiteralStringValid(char, state.char)) {
				state.stringValue += char;
				return null;
			}

			return 'Unexpected charachter';
		},
		transition: {
			to: noop,
			from({
				stringValue,
				tagName,
				tagRules,

				parent,
				block,
				blockRules,
			}, next) {
				block[tagName] = tagRules.value(stringValue);

				// pass values
				next.parent = parent;
				next.block = block;
				next.blockRules = blockRules;
				return null;
			},
		},
	},
};

class Parser {
	constructor({
		rules = sage50Rules,
		onRootBlock = noop,
		onError = noop,
	} = {}) {
		this.lexer = new StreamLexer();
		this.lexerState = undefined;
		this.token = undefined;
		this.onRootBlock = onRootBlock;
		this.onError = onError;

		this.nextState('root', {
			blockRules: rules,
		});

		this.context = {
			nextState: this.nextState.bind(this),
			emit: this._emit.bind(this),
		};
	}

	nextState(name, data = {}) {
		const newState = {
			name,
			processor: states[name],
			data,
		};

		// transition
		if (this.state) {
			const fromErrror = this.state.processor.transition.from.call(this.context, this.state.data, newState.data);
			if (fromErrror)
				return fromErrror;
			const toError = newState.processor.transition.to.call(this.context, this.state.data, newState.data);
			if (toError)
				return toError;
		}

		this.state = newState;

		return null;
	}

	feed(chunk) {
		this.lexer.reset(chunk, this.lexerState);

		// eslint-disable-next-line no-cond-assign
		while (this.token = this.lexer.next()) {
			const error = this.state.processor.process.call(this.context, this.state.data, this.token.value);
			if (error)
				this.onError(new Error(this.lexer.formatError(this.token, error)));
				// throw new Error(this.lexer.formatError(this.token, error));
		}

		this.lexerState = this.lexer.save();
		return this;
	}

	end() {
		if (this.state.processor !== states.root)
			this.onError(new Error(this.lexer.formatError(this.token, 'Unexpected end of file')));
			// throw new Error(this.lexer.formatError(this.token, 'Unexpected end of file'));
	}

	_emit(block) {
		this.onRootBlock(block);
	}

	static parse(content, { rules = sage50Rules } = {}) {
		const results = [];
		new Parser({
			rules,
			onRootBlock: block => results.push(block),
			onError: (error) => { throw error; },
		}).feed(content).end();
		return results;
	}

	static createStream() {
		return new ParserStream(Parser);
	}
}

module.exports = Parser;
