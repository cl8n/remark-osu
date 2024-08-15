import { Root } from 'mdast';
import { lintRule, Rule } from 'unified-lint-rule';
import { pointStart } from 'unist-util-position';
import { CONTINUE, visit } from 'unist-util-visit';

const countryFlags: Rule<Root> = (tree, file) => {
	visit(tree, 'text', (node) => {
		const startPoint = pointStart(node);

		if (startPoint == null) {
			return CONTINUE;
		}

		// The strategy here is to attempt to catch common mistakes, and not actually parse the "custom
		// container inlines" like osu-web does. This may be able to be replaced later when built on
		// top of a parser that is aware of CCIs
		const lenientFlagMatches = node.value.matchAll(/(::\s*{\s*flag\s*=\s*["']?)([a-z_-]+)["']?\s*}\s*::/gi);

		for (const match of lenientFlagMatches) {
			if (!/^[A-Z]{2}$/.test(match[2])) {
				const codeStartPoint = {
					column: startPoint.column + match.index! + match[1].length,
					line: startPoint.line,
				};
				const codePosition = {
					start: codeStartPoint,
					end: { ...codeStartPoint, column: codeStartPoint.column + match[2].length },
				};

				file.message(
					match[2] === '__'
						? 'Use "XX" for unknown country codes in flags'
						: 'Country code should be exactly two characters and uppercase',
					codePosition,
				);
			}

			const expectedFlag = `::{ flag=${match[2]} }::`;

			if (match[0] !== expectedFlag) {
				const flagStartPoint = {
					column: startPoint.column + match.index!,
					line: startPoint.line,
				};
				const flagPosition = {
					start: flagStartPoint,
					end: { ...flagStartPoint, column: flagStartPoint.column + match[0].length },
				};

				file.message(
					`Invalid country flag formatting (expected: ${expectedFlag})`,
					flagPosition,
				);
			}
		}

		return CONTINUE;
	});
};

export default lintRule('remark-osu:country-flags', countryFlags);
