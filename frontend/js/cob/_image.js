//----------------- $image  ------------------------
cob.custom.customize.push(function (core, utils, ui) {
  core.customizeAllInstances((instance, presenter) => {
    if (instance.isNew() || presenter.isGroupEdit()) return;

    let imagesFPs = presenter.findFieldPs((fp) =>
      /[$]image(.add|.replace)?(\(.+\))?/.exec(
        fp.field.fieldDefinition.description
      )
    );
    imagesFPs.forEach((fp) => {
      let matcher = /[$]image(.add|.replace)?(\(.+\))?/;
      let args = fp.field.fieldDefinition.description.match(matcher);
      let replaceFlag = (args && args[1] && args[1] == ".replace") || false;
      let width = (args && args[2]) || "";
      debugger;
      let $image = $(
        '<div style="width:100%;text-align:center">' +
          "<img " +
          (width ? 'style="width:' + width + 'px" ' : "") +
          'src="' +
          (fp.field.fieldDefinition.description.match(/[$]file/)
            ? $(fp.content()[0]).find(".link-container a")[0].href
            : fp.field.htmlEncodedValue) +
          '">' +
          "</img>" +
          "</div>"
      );
      fp.content()[0].append($image[0]);
      fp.content()[0].children[0].style.display = replaceFlag ? "none" : "";
    });
  });
});
