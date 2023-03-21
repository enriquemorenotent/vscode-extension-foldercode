const vscode = require('vscode');
const { readTextFiles } = require('./fileReader');
const { generateMarkdownContent } = require('./markdownGenerator');

async function executeFolderCode(uri) {
	const folder = uri
		? [uri]
		: await vscode.window.showOpenDialog({
				canSelectMany: false,
				canSelectFiles: false,
				canSelectFolders: true,
				openLabel: 'Select Folder',
		  });

	if (folder && folder[0]) {
		try {
			const textFiles = await vscode.window.withProgress(
				{
					location: vscode.ProgressLocation.Notification,
					title: 'Processing files...',
					cancellable: false,
				},
				async (progress) => {
					return await readTextFiles(folder[0].fsPath);
				}
			);

			const config = vscode.workspace.getConfiguration('folderCode');
			const warningThreshold = config.get('warningThreshold');

			// Check if there are more files than the warning threshold
			if (textFiles.length > warningThreshold) {
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

			const markdownContent = generateMarkdownContent(
				textFiles,
				folder[0].fsPath
			);
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
