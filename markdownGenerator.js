const path = require('path');
const template = require('string-template');

function generateMarkdownContent(files, rootPath) {
	const fileTemplate = `## {filePath}{croppedText}

\`\`\`{languageIdentifier}
{fileContent}
\`\`\`

`;

	return files
		.map((file) => {
			const relativePath = path.relative(rootPath, file.path);
			const languageIdentifier = path.extname(file.name).substring(1);
			return template(fileTemplate, {
				filePath: relativePath + (file.isCropped ? ' (CROPPED)' : ''),
				languageIdentifier,
				fileContent: file.content,
			});
		})
		.join('');
}

module.exports = {
	generateMarkdownContent,
};
