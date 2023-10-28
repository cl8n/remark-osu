import { Root } from 'mdast';
import { lintRule, Rule } from 'unified-lint-rule';
import { pointEnd, pointStart } from 'unist-util-position';
import { SKIP, visit } from 'unist-util-visit';

const emptyCellReason = 'Empty cell should contain 2 spaces';
const reason = 'Cell should be padded with 1 space';

function formatReason(reason: string, padding: number): string {
	return `${reason}, not ${Math.max(padding, 0)}`;
}

const tableCellPadding: Rule<Root> = (tree, file) => {
	const value = String(file);

	visit(tree, 'tableCell', (cell) => {
		let cellStart = pointStart(cell)?.offset;
		let cellEnd = pointEnd(cell)?.offset;

		if (cellStart == null || cellEnd == null) {
			return SKIP;
		}

		if (value.charAt(cellStart) === '|') {
			++cellStart;
		}

		if (value.charAt(cellEnd - 1) === '|') {
			--cellEnd;
		}

		if (cell.children.length === 0) {
			const padding = cellEnd - cellStart;

			if (padding !== 2) {
				file.message(formatReason(emptyCellReason, padding), cell);
			}

			return SKIP;
		}

		const contentStartPoint = pointStart(cell.children[0]);
		const contentEndPoint = pointEnd(cell.children[cell.children.length - 1]);
		const contentStart = contentStartPoint?.offset;
		const contentEnd = contentEndPoint?.offset;

		if (contentStart == null || contentEnd == null) {
			return SKIP;
		}

		const startPadding = contentStart - cellStart;
		const endPadding = cellEnd - contentEnd;

		if (startPadding !== 1) {
			file.message(formatReason(reason, startPadding), contentStartPoint);
		}

		if (endPadding !== 1) {
			file.message(formatReason(reason, endPadding), contentEndPoint);
		}

		return SKIP;
	});
};

export default lintRule('remark-osu:table-cell-padding', tableCellPadding);
