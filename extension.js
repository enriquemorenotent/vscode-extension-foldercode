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

async function readTextFiles(folderPath) {
	const files = await fs.promises.readdir(folderPath);
	const textFiles = [];

	for (const file of files) {
		const filePath = path.join(folderPath, file);
		const fileStat = await fs.promises.stat(filePath);

		if (fileStat.isFile()) {
			const content = await fs.promises.readFile(filePath, 'utf-8');
			textFiles.push({ name: file, content });
		}
	}

	return textFiles;
}

function activate(context) {
	let disposable = vscode.commands.registerCommand(
		'extension.folderCode',
		async () => {
			const folder = await vscode.window.showOpenDialog({
				canSelectMany: false,
				canSelectFiles: false,
				canSelectFolders: true,
				openLabel: 'Select Folder',
			});

			if (folder && folder[0]) {
				try {
					const textFiles = await readTextFiles(folder[0].fsPath);

					if (textFiles.length === 0) {
						vscode.window.showWarningMessage(
							'No text files were found in the selected folder.'
						);
						return;
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
	);

	context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = {
	activate,
	deactivate,
};
