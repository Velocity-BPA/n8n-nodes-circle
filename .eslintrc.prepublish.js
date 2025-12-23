/**
 * @type {import('@types/eslint').ESLint.ConfigData}
 */
module.exports = {
	extends: './.eslintrc.json',
	rules: {
		'n8n-nodes-base/community-package-json-name-still-default': 'error',
	},
};
