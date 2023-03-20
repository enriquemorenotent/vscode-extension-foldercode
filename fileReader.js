const fs = require('fs');
const path = require('path');
const vscode = require('vscode');
const minimatch = require('minimatch');
const { isBinaryFile } = require('isbinaryfile');

async function readTextFilesRecursive(
	folderPath,
	textFiles = [],
	ignorePatterns = []
) {
	const files = await fs.promises.readdir(folderPath);

	for (const file of files) {
		// Check if the file/folder matches any of the ignore patterns
		if (ignorePatterns.some((pattern) => minimatch(file, pattern))) {
			continue;
		}

		const filePath = path.join(folderPath, file);
		const fileStat = await fs.promises.stat(filePath);

		if (fileStat.isFile()) {
			// Check if the file is a binary file
			if (await isBinaryFile(filePath)) {
				continue;
			}

			let content = await fs.promises.readFile(filePath, 'utf-8');

			// Crop the content if there are more than 500 lines
			const lines = content.split('\n');
			if (lines.length > 500) {
				content = lines.slice(0, 500).join('\n');
			}

			textFiles.push({ name: file, content });
		} else if (fileStat.isDirectory()) {
			await readTextFilesRecursive(filePath, textFiles, ignorePatterns);
		}
	}

	return textFiles;
}

async function readTextFiles(folderPath) {
	const config = vscode.workspace.getConfiguration('folderCode');
	const ignorePatterns = config.get('ignore') || [];
	return await readTextFilesRecursive(folderPath, [], ignorePatterns);
}

module.exports = {
	readTextFiles,
};
