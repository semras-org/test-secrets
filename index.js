"use strict";
const core = require("@actions/core");
const github = require("@actions/github");
const exec = require("@actions/exec");

async function findUnused(secrets) {
  const secretNames = secrets.map((secret) => secret.name);

  try {
    const executionOutput = await exec.getExecOutput(
      `egrep -r ${secretNames.join("|")} .github/workflows`,
      [],
      { silent: true, ignoreReturnCode: true }
    );

    return secretNames.filter(
      (secret) => !executionOutput.stdout.includes(secret)
    );
  } catch (err) {
    core.setFailed(`Searching for secrets failed with: ${err}`);
  }
}

async function run() {
  core.info(`
  *** ACTION RUN - START ***
  `);

  const githubToken = core.getInput("github-token", { required: true });
  const octokit = github.getOctokit(githubToken);
  const { owner, repo } = github.context.repo;

  try {
    const { secrets } = await octokit.rest.actions.listRepoSecrets({
      owner,
      repo,
    });

    const unusedSecrets = await findUnused(secrets);

    if (unusedSecrets.length) {
      core.setFailed(`Unused secrets detected: ${unusedSecrets.join(", ")}`);
    }
  } catch (err) {
    core.setFailed(`Action failed with error ${err}`);
  } finally {
    core.info(`
    *** ACTION RUN - END ***
    `);
  }
}

module.exports = {
  run,
};
