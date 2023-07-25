const { execSync } = require('child_process');

const { setFailed, setOutput, getInput, info } = require('@actions/core');

const run = async () => {
  try {
    const project = getInput('project');
    const projectConfigRaw = execSync(
      `npx nx show project ${project}`
    ).toString('utf-8');
    const projectConfig = JSON.parse(projectConfigRaw);
    info(`NX project config: ${projectConfig}`);

    setOutput('config', projectConfig);
  } catch (error) {
    if (error instanceof Error || typeof error === 'string') {
      setFailed(error);
    } else {
      setFailed('Unknown error occured.');
    }
  }
};

run();
