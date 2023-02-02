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
      const imgFieldPresenter = fp.content()[0];
      // ImgLink differs if the field is a $file or a $link ($image supports both)
      const imgLink = fp.field.fieldDefinition.description.match(/[$]file/)
                      ? $(imgFieldPresenter).find(".link-container a")[0] && $(imgFieldPresenter).find(".link-container a")[0].href
                      : fp.field.htmlEncodedValue
      if(imgLink) {
        let showMsg = "Click <b>here</b> to show/hide image details";

        switch (core.getLanguage()) {
          case "pt" : 
            showMsg = "Clicar <b>aqui</b> para ver/esconder os detalhes"
            break
        }
        const $image = $(
          '<div class="dollarImgDiv" >' +
            '<img ' + 'src="' + imgLink + '"></img>' +
            "<span>"+showMsg+"</span>" +
          "</div>"
        );
        imgFieldPresenter.append($image[0]);
        
        let show = !replaceFlag
        imgFieldPresenter.children[0].style.display = show ? "" : "none";
        $image.children("span")[0].onclick = () => {
          show = !show
          imgFieldPresenter.children[0].style.display = show ? "" : "none";
        }

        let zoom = false
        let widthCalc;
        if(width) {
          widthCalc = width
          document.querySelector(':root').style.setProperty('--defaultWidth', widthCalc + 'px');
        } else {
          widthCalc =  document.querySelector(':root').style.getPropertyValue('--defaultWidth')
        }
        $image.children("img")[0].onclick = () => {
          zoom = !zoom;
          if(zoom) {
            $image[0].style.setProperty('--defaultWidth', 600 + 'px');
          } else {
            $image[0].style.removeProperty('--defaultWidth')
          }
        }

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
            childNode.innerHTML = "<div class='dollarImageDiv'>"
                                 +" <div class='dollarImageItem'><img src='"+childNode.href+"'></img></div>"
                                 +" <img class='dollarImageImg'loading='lazy' src='"+childNode.href+"'></img>"
                                 +"</div>"
            childNode.removeAttribute("href")
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