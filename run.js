const exec = require("@actions/exec");

let myOutput = "";
let myError = "";

const options = {};
options.listeners = {
  stdout: (data) => {
    myOutput += data.toString();
  },
  stderr: (data) => {
    myError += data.toString();
  },
};
options.cwd = "./lib";

await exec.exec("node", ["index.js", "foo=bar"], options);
