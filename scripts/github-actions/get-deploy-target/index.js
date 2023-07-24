const { execSync } = require('child_process');

const { setFailed, setOutput, getInput, info } = require('@actions/core');

const run = async () => {
  try {
    const baseBranch = getInput('baseBranch');
    const releaseStrategy = getInput('releaseStrategy');

    const isReleaseBranch = baseBranch.includes('release-');

    const affectedProjects = execSync(
      `npx nx show projects --affected --json --withTarget=${target} --base=${base} --head=${head} --projects ${projects} --exclude ${exclude}`
    ).toString('utf-8');

    const parsedOutput = JSON.parse(affectedProjects);
    const stringOutput = parsedOutput.join(', ');
    info(`Output from NX: ${affectedProjects}`);

    setOutput('projects', parsedOutput);
    setOutput('projectsString', stringOutput);

    parsedOutput.forEach((project) => {
      setOutput(project, true);
    });
  } catch (error) {
    if (error instanceof Error || typeof error === 'string') {
      setFailed(error);
    } else {
      setFailed('Unknown error occured.');
    }
  }
};

run();
