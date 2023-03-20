const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const { isBinaryFile } = require('isbinaryfile');
const minimatch = require('minimatch');

function matchesIgnorePattern(filePath, ignorePatterns) {
	for (const pattern of ignorePatterns) {
		if (minimatch(filePath, pattern, { matchBase: true })) {
			return true;
		}
	}
	return false;
}

async function readTextFilesRecursive(
	folderPath,
	textFiles = [],
	ignorePatterns = [],
	maxLinesPerFile
) {
	if (matchesIgnorePattern(folderPath, ignorePatterns)) {
		return textFiles;
	}

	const files = await fs.promises.readdir(folderPath);

	for (const file of files) {
		const filePath = path.join(folderPath, file);
		const fileStat = await fs.promises.stat(filePath);

		if (fileStat.isFile()) {
			if (matchesIgnorePattern(filePath, ignorePatterns)) {
				continue;
			}

			const isBinary = await isBinaryFile(filePath);
			if (isBinary) {
				continue;
			}

			let content = await fs.promises.readFile(filePath, 'utf-8');

			// Crop the content if there are more lines than the specified maximum
			const lines = content.split('\n');
			let isCropped = false;
			if (lines.length > maxLinesPerFile) {
				content = lines.slice(0, maxLinesPerFile).join('\n');
				isCropped = true;
			}

			textFiles.push({ name: file, content, isCropped });
		} else if (fileStat.isDirectory()) {
			await readTextFilesRecursive(
				filePath,
				textFiles,
				ignorePatterns,
				maxLinesPerFile
			);
		}
	}

	return textFiles;
}

async function readTextFiles(folderPath) {
	const config = vscode.workspace.getConfiguration('folderCode');
	const ignorePatterns = config.get('ignore') || [];
	const maxLinesPerFile = config.get('maxLinesPerFile') || 500;
	return await readTextFilesRecursive(
		folderPath,
		[],
		ignorePatterns,
		maxLinesPerFile
	);
}

module.exports = {
	readTextFiles,
};
