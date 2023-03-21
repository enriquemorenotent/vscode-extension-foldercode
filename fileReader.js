// fileReader.js

const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const { isBinaryFile } = require('isbinaryfile');
const { matchesIgnorePattern } = require('./utils');

async function processFile(filePath, ignorePatterns, maxLinesPerFile) {
	if (matchesIgnorePattern(filePath, ignorePatterns)) {
		return null;
	}

	const isBinary = await isBinaryFile(filePath);
	if (isBinary) {
		return null;
	}

	let content = await fs.promises.readFile(filePath, 'utf-8');

	// Crop the content if there are more lines than the specified maximum
	const lines = content.split('\n');
	let isCropped = false;
	if (lines.length > maxLinesPerFile) {
		content = lines.slice(0, maxLinesPerFile).join('\n');
		isCropped = true;
	}

	return {
		path: filePath,
		name: path.basename(filePath),
		content,
		isCropped,
	};
}

async function processDirectory(
	folderPath,
	textFiles,
	ignorePatterns,
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
			const processedFile = await processFile(
				filePath,
				ignorePatterns,
				maxLinesPerFile
			);
			if (processedFile) {
				textFiles.push(processedFile);
			}
		} else if (fileStat.isDirectory()) {
			await processDirectory(
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
	return await processDirectory(
		folderPath,
		[],
		ignorePatterns,
		maxLinesPerFile
	);
}

module.exports = {
	readTextFiles,
};
