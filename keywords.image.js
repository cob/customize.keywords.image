exports.option = {
  name: 'Image - Allows for $image[.replace|.add][(width)]', 
  short: "Image",
  questions: [
  ],
  customization: async function (answers) {
      console.log("\nApplying Image keyword customizations ...")

      const { copy } = require("../lib/task_lists/customize_copy");
      const { mergeFiles } = require("../lib/task_lists/customize_mergeFiles");
      const fe_target = "./recordm/customUI/"
      await copy("../../templates/keywords/image/frontend",fe_target)
      await mergeFiles("Keyword.Image")
      return require("../templates/keywords/image/package.json").version //TODO: fix temporary workaround to find the version (based on the final path withing cob-cli repo)
  }
}