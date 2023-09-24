const fs = require('fs');
const path = require('path');
const {execSync} = require('child_process');

const execSyncWrapper = (command) => {
  let stdout = null;
  try {
    stdout = execSync(command).toString().trim();
  } catch (error) {
    console.error(error);
  }
  return stdout;
};

const main = () => {
  let gitBranch = execSyncWrapper('git rev-parse --abbrev-ref HEAD');
  let gitCommitHash = execSyncWrapper('git rev-parse --short=7 HEAD');
  let gitCommitMessage = execSyncWrapper('git log HEAD -1 --pretty=%B');

  const obj = {
    gitBranch,
    gitCommitHash,
    gitCommitMessage
  };

  const filePath = path.resolve('src', 'generatedGitInfo.json');
  const fileContents = JSON.stringify(obj, null, 2);

  fs.writeFileSync(filePath, fileContents);
  console.log(`Wrote the following contents to ${filePath}\n${fileContents}`);
};

main();
