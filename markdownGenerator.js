const path = require('path');

function generateMarkdownContent(files) {
	let content = '';

	files.forEach((file) => {
		const languageIdentifier = path.extname(file.name).substring(1); // Remove the leading dot from the extension
		content += `## ${file.name}${file.isCropped ? ' (CROPPED)' : ''}\n\n`;
		content += ` \`\`\`${languageIdentifier}\n`;
		content += file.content;
		content += '\n```\n\n';
	});

	return content;
}

module.exports = {
	generateMarkdownContent,
};
