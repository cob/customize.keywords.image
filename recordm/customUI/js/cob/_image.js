//----------------- $image  ------------------------
cob.custom.customize.push(function (core, utils, ui) {
  const matcher = /[$]image(\(.+\))?/;

  core.customizeAllInstances((instance, presenter) => {
    if (instance.isNew() || presenter.isGroupEdit()) return;

    const imagesFPs = presenter.findFieldPs((fp) => matcher.exec( fp.field.fieldDefinition.description ) );
    imagesFPs.forEach((fp) => {
      const argsMatch = fp.field.fieldDefinition.description.match(matcher);
      const args = argsMatch && argsMatch[1]
      
      const replaceArgMatcher = /\(\[.*replace:true.*\]\)/;
      const widthArgMatcher = /\(\[.*width:(\d+).*\]\)/;
      
      const replaceFlag = args && args.match(replaceArgMatcher) && args.match(replaceArgMatcher).length == 1
      const width = args && args.match(widthArgMatcher) && args.match(widthArgMatcher)[1] || "";
      // ImgLink differs if the field is a $file or a $link 
      const imgLink = fp.field.fieldDefinition.description.match(/[$]file/)
                      ? $(fp.content()[0]).find(".link-container a")[0] && $(fp.content()[0]).find(".link-container a")[0].href
                      : fp.field.htmlEncodedValue
      if(imgLink) {
        const $image = $(
          '<div style="width:100%;">' +
            "<img " +
              (width ? 'style="width:' + width + 'px" ' : "") +
              'src="' + imgLink + '">' +
            "</img>" +
          "</div>"
        );
        fp.content()[0].append($image[0]);
        fp.content()[0].children[0].style.display = replaceFlag ? "none" : "";  
      }
    });
  });


  core.customizeAllColumns("*", function (node, esDoc, fieldInfo) {
    if (matcher.exec(fieldInfo.fieldDefDescription)) {
      node.classList.add("dollarImgCell");
      for(let childNode of node.childNodes) {
        if(childNode.className == "link") {
          const imgRegex = /([a-z\-_0-9\/\:\.]*\.(jpg|jpeg|png|gif))/i
          if( childNode.href.match(imgRegex)) {
            childNode.innerHTML = "<div class='dollarImageDiv' style='display:inline'>"
                                 +" <div class='dollarImageText'>link</div>"
                                 +" <img class='dollarImageImg'loading='lazy' src='"+childNode.href+"'></img>"
                                 +"</div>"
          } else {
            childNode.innerHTML = "Link"
          }
        } else {
          childNode.textContent = " "
        }
      }
    }
  });
})