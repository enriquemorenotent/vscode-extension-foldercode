const path = require('path');

function generateMarkdownContent(files) {
	return files
		.map((file) => {
			const languageIdentifier = path.extname(file.name).substring(1);
			return `## ${file.name}${file.isCropped ? ' (CROPPED)' : ''}

  \`\`\`${languageIdentifier}
  ${file.content}
  \`\`\`

  `;
		})
		.join('');
}

module.exports = {
	generateMarkdownContent,
};
