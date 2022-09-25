import { getInput, setOutput, setFailed } from '@actions/core';
import github from '@actions/github';
import { listTags, writeYAML } from './util';
import cp from 'node:child_process';

try {
	const form =
		getInput('yaml-form', { trimWhitespace: true }) ||
		'.github/ISSUE_TEMPLATE/bug_report.yml';
	const packageName =
		getInput('package', { trimWhitespace: true, required: true }) ||
		github.context.payload.repository.name;
	const registry = getInput('registry', { trimWhitespace: true }) || 'npm';
	const order = getInput('order', { trimWhitespace: true }) || 'desc';
	const limitTo = getInput('limit-to');
	const dropdownId =
		getInput('dropdown-id', { trimWhitespace: true }) || 'version';
	const commitMessage = getInput('commit-message');
	console.log({ form, packageName, registry, order, limitTo, dropdownId });
	const tags =
		getInput('tags') || listTags(registry, packageName, order, limitTo);
	setOutput('tags', tags);
	writeYAML(form, dropdownId, tags);
	cp.execSync(`git config user.name github-actions[bot]`);
	cp.execSync(
		`git config user.email github-actions[bot]@users.noreply.github.com`,
	);
	cp.execSync(`git add ${form}`);
	cp.execSync(`git commit -m "${commitMessage}"`);
	cp.execSync(`git push`);
} catch (error) {
	setFailed(error);
}
