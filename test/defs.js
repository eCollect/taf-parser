'use strict';

const Parser = require('../lib/Parser');

const folder = 'fixtures';
const files = {
	valid: {
		big: 'valid_big.taf',
	},
	invalid: {
		eof: 'invalid_eof.taf',
		mainBlock: 'invalid_main_block.taf',
		innerBlock: 'invalid_inner_block.taf',
		tagDeclaration: 'invalid_tag.taf',
		dateFormat: 'invalid_date.taf',
		currency: 'invalid_currency.taf',
		integer: 'invalid_integer.taf',
		literalChar: 'invalid_literal_char.taf',
		blockName: 'invalid_block_name.taf',
		tagNameFirstChar: 'invalid_tag_name_first_char.taf',
		tagNameMiddlechar: 'invalid_tag_name_middle_char.taf',
		blockDeclaration: 'invalid_block_declaration.taf',
		blockMissingName: 'invalid_block_missing_name.taf',
		blockStart: 'invalid_block_start.taf',
	},
};

module.exports = {
	files,
	folder,
	Parser,
};
