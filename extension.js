const vscode = require('vscode');
const { executeFolderCode } = require('./executeFolderCode');

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
