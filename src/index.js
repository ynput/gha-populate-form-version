import { getInput, info, setFailed, setOutput } from '@actions/core';
import semver from 'semver';
import { listTags } from './util';

async function run() {
	try {
		const packageName = getInput('package', {
			trimWhitespace: true,
		});
		const registry = getInput('registry', {
			trimWhitespace: true,
			required: true,
		});
		const order = getInput('order', { trimWhitespace: true });
		const limitTo =
			Math.max(Number(getInput('limit_to', { trimWhitespace: true })), 0) ||
			undefined;
		const semverRange = getInput('semver', {
			trimWhitespace: true,
		});
		info(`Fetching tags from ${registry}`);
		const list = await listTags(registry, packageName);

		// regex pattern witch would exclude all semver version with are having prefix with 'v'
		const pattern = /^\d+\.\d+\.\d+.*/;

		const semverSortedList = [];

		// iterate all versions and use pattern to exclude those which do not match in Python 3.6
		list.forEach(version => {
		if (version.match(pattern)) {
			semverSortedList.push(version);
		}
		});

		// sort all versions in newVersions with semver and reverse the order
		semverSortedList.sort((a, b) => semver.rcompare(a, b));

		const latest = semverSortedList[0];
		if (order === 'asc') {
			semverSortedList.reverse();
		}
		const tags = semverSortedList
			.slice(0, limitTo)
			.filter(
				(tag) =>
					!semverRange || semver.satisfies(semver.clean(tag), semverRange),
			);
		setOutput('latest', latest);
		setOutput('tags', tags);
	} catch (error) {
		console.error(error);
		setFailed(error);
	}
}

run();
