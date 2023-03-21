const minimatch = require('minimatch');

function matchesIgnorePattern(filePath, ignorePatterns) {
	for (const pattern of ignorePatterns) {
		if (minimatch(filePath, pattern, { matchBase: true })) {
			return true;
		}
	}
	return false;
}

module.exports = {
	matchesIgnorePattern,
};
