import { Root } from 'mdast';
import { lintRule, Rule } from 'unified-lint-rule';
import { SKIP, visit } from 'unist-util-visit';

const tableNoMissingCells: Rule<Root> = (tree, file) => {
	visit(tree, 'table', (table) => {
		const maxColumns = Math.max(...table.children.map((row) => row.children.length));

		for (const row of table.children) {
			if (row.children.length !== maxColumns) {
				file.message(
					`Row should have ${maxColumns} cells, not ${row.children.length}`,
					row,
				);
			}
		}

		return SKIP;
	});
};

export default lintRule('remark-osu:table-no-missing-cells', tableNoMissingCells);
