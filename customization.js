module.exports = {
  version: "1.0.0",

  questions: [
    {
      type: "input",
      name: "name",
      message: "What's the name of the definition?",
      description: "the name of the definition listing to customize",
    },
  ],

  actions: async function (repoName, answers, copy, mergeFiles) {
    const path = require("path");
    await copy(path.resolve(repoName), "./");
    await mergeFiles(repoName);
  },
};
