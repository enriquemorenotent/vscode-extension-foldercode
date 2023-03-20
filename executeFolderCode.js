const vscode = require('vscode');
const { readTextFiles } = require('./fileReader');
const { generateMarkdownContent } = require('./markdownGenerator');

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

module.exports = {
	executeFolderCode,
};
