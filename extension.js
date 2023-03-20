const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

function generateMarkdownContent(files) {
	let content = '';

	files.forEach((file) => {
		const languageIdentifier = path.extname(file.name).substring(1); // Remove the leading dot from the extension
		content += `## ${file.name}\n\n`;
		content += ` \`\`\`${languageIdentifier}\n`;
		content += file.content;
		content += '\n```\n\n';
	});

	return content;
}

async function readTextFilesRecursive(folderPath, textFiles = []) {
	const files = await fs.promises.readdir(folderPath);

	for (const file of files) {
		const filePath = path.join(folderPath, file);
		const fileStat = await fs.promises.stat(filePath);

		if (fileStat.isFile()) {
			let content = await fs.promises.readFile(filePath, 'utf-8');

			// Crop the content if there are more than 500 lines
			const lines = content.split('\n');
			if (lines.length > 500) {
				content = lines.slice(0, 500).join('\n');
			}

			textFiles.push({ name: file, content });
		} else if (fileStat.isDirectory()) {
			await readTextFilesRecursive(filePath, textFiles);
		}
	}

	return textFiles;
}

async function readTextFiles(folderPath) {
	return await readTextFilesRecursive(folderPath);
}

async function executeFolderCode() {
	const folder = await vscode.window.showOpenDialog({
		canSelectMany: false,
		canSelectFiles: false,
		canSelectFolders: true,
		openLabel: 'Select Folder',
	});

	if (folder && folder[0]) {
		try {
			const textFiles = await readTextFiles(folder[0].fsPath);

			// Check if there are more than 20 files
			if (textFiles.length > 20) {
				const proceed = await vscode.window.showWarningMessage(
					`There are ${textFiles.length} files in the selected folder. Do you want to proceed?`,
					{ modal: true },
					'Yes',
					'No'
				);

				// If the user chooses 'No', stop the operation
				if (proceed !== 'Yes') {
					return;
				}
			}

			const markdownContent = generateMarkdownContent(textFiles);
			const doc = await vscode.workspace.openTextDocument({
				content: markdownContent,
				language: 'markdown',
			});
			await vscode.window.showTextDocument(doc);
		} catch (error) {
			vscode.window.showErrorMessage(
				`An error occurred while processing the files: ${error.message}`
			);
		}
	} else {
		vscode.window.showWarningMessage('No folder was selected.');
	}
}

function activate(context) {
	let disposable = vscode.commands.registerCommand(
		'extension.folderCode',
		executeFolderCode
	);

	context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = {
	activate,
	deactivate,
};
