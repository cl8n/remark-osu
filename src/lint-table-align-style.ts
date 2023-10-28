import { Root } from 'mdast';
import { lintRule, Rule } from 'unified-lint-rule';
import { pointStart } from 'unist-util-position';
import { SKIP, visit } from 'unist-util-visit';

const tableAlignStyle: Rule<Root> = (tree, file) => {
	const value = String(file);

	visit(tree, 'table', (table) => {
		const startPoint = pointStart(table);

		if (startPoint == null || table.align == null) {
			return SKIP;
		}

		const alignRow = value.split(/\r\n|\n|\r/)[startPoint.line];
		const alignRowPosition = {
			start: { column: startPoint.column, line: startPoint.line + 1 },
			end: { column: alignRow.length + 1, line: startPoint.line + 1 },
		};

		const maxColumns = Math.max(...table.children.map((row) => row.children.length));

		if (table.align.length !== maxColumns) {
			file.message(
				`Align row should have ${maxColumns} cells, not ${table.align.length}`,
				alignRowPosition,
			);
		}

		const expectedAlignRow =
			'| ' +
			table.align.map((alignType) => {
				switch (alignType) {
					case 'center': return ':-:';
					case 'right':  return '--:';
					default:       return ':--';
				}
			}).join(' | ') +
			' |';

		if (alignRow.trim() !== expectedAlignRow) {
			file.message(
				`Align row cells should have standard format and padding (expected: ${expectedAlignRow})`,
				alignRowPosition,
			);
		}

		return SKIP;
	});
};

export default lintRule('remark-osu:table-align-style', tableAlignStyle);
