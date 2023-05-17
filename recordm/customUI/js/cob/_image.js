//------------------ $image  ------------------------
const pdfRegex = /([a-z\-_0-9\/\:\.]*\.(pdf))/
const imageMatcher = /[$]image(\(.+\))?/;
const imgRegex = /([a-z\-_0-9\/\:\.]*\.(jpg|jpeg|png|gif))/
const fileMatcher = /[$]file/;
const pdfURLIcon = "localresource/icons/pdf3.png"
//commit and push with gitkraken 5466
cob.custom.customize.push(function (core, utils, ui) {

  core.customizeAllInstances((instance, presenter) => {
    if (instance.isNew() || presenter.isGroupEdit()) return;
    const imagesFPs = presenter.findFieldPs((fp) => imageMatcher.exec( fp.field.fieldDefinition.description ));
    imagesFPs.forEach((fp) => {

      const imgFieldPresenter = fp.content()[0];
      // ImgLink differs if the field is a $file or a $link ($image supports both)
      const imgLink = fp.field.fieldDefinition.description.match(fileMatcher)
                      ? $(imgFieldPresenter).find(".link-container a")[0] && $(imgFieldPresenter).find(".link-container a")[0].href
                      : fp.field.htmlEncodedValue

      if (imgLink && imgLink.match(imgRegex)) {
        const argsMatch = fp.field.fieldDefinition.description.match(imageMatcher);
        const args = argsMatch && argsMatch[1]
        
        const replaceArgMatcher = /\(\[.*replace:true.*\]\)/;
        const widthArgMatcher = /\(\[.*width:(\d+).*\]\)/;
        
        const replaceFlag = args && args.match(replaceArgMatcher) && args.match(replaceArgMatcher).length == 1
        const width = args && args.match(widthArgMatcher) && args.match(widthArgMatcher)[1] || "";
        
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
        if (width) {
          widthCalc = width
          document.querySelector(':root').style.setProperty('--defaultWidth', widthCalc + 'px');
        } else {
          widthCalc =  document.querySelector(':root').style.getPropertyValue('--defaultWidth')
        }
        $image.children("img")[0].onclick = () => {
          zoom = !zoom;
          if (zoom) {
            $image[0].style.setProperty('--defaultWidth', 600 + 'px');
          } else {
            $image[0].style.removeProperty('--defaultWidth')
          }
        }
      } else if (imgLink && imgLink.match(pdfRegex)) {
        pdfPreviewOnInstances(imgFieldPresenter,imgLink)
      }
    });
  });

  core.customizeAllColumns("*", function (node, esDoc, fieldInfo) {
    if (imageMatcher.exec(fieldInfo.fieldDefDescription)) {
      node.classList.add("dollarImgCell");
      for(let childNode of node.childNodes) {
        let link;
        if (childNode.tagName == "A") {
          link = childNode.href
          childNode.removeAttribute("href")
        } else {
          link = childNode.textContent
          childNode = document.createElement("a")
          childNode.className="link"
          node.innerHTML=""
          node.appendChild(childNode)
        }
        childNode.setAttribute("target", "_blank")
        if (link && link.match(imgRegex)) {
          childNode.innerHTML = `<div class='dollarImageDiv'>
                                  <div class='dollarImageItem'><img class='dollarImgThg' src='${link}'  data-hrf='IMG'></img></div>
                                </div>
                                `
        } else if (link && link.match(pdfRegex)) {
          childNode.innerHTML = `<div class="dollarImgPDFdiv">
                                    <div class='dollarImageItem'><img src=${pdfURLIcon} class="pdfPreview dollarImgThg" data-hrf=${link}></div>
                                  </div>`
        } else {
          //unknownFileIcon
          childNode.innerHTML = `<div class="dollarImgPDFdiv">
                                    <div class='dollarImageItem'>
                                      <a href='${link}' target='_blank'>
                                        <img src='localresource/icons/FileIcon.png' class="pdfPreview dollarImgThg">
                                      </a>
                                    </div>
                                  </div>`
        }
      }
    }
  });
})
function pdfPreviewOnInstances(imgFieldPresenter,fileURL) {
  let divParent = document.createElement("div");
  divParent.className = "dollarImgDiv"
  let pdfCanvas = document.createElement("canvas");
  pdfCanvas.className = "dollarImgCanvas_inst"
  divParent.appendChild(pdfCanvas)
  imgFieldPresenter.append(divParent);

  let zoom = false
  pdfCanvas.onclick = () => {
    zoom = !zoom;
    if (zoom) {
      divParent.style.setProperty('--defaultWidth', 600 + 'px');
    } else {
      divParent.style.removeProperty('--defaultWidth')
    }
  }
  startPDFRendering(pdfCanvas, fileURL, null);
}
//PDF PREVIEW FOR COLUMNS
document.onclick=(e)=>{
  if (e.target.classList.contains("dollarImgThg")) {
    showCanvasHandler(e)
  }else{
    hideAllCanvas(null) 
  }
}
function controlCanvasPosition(x,canvasDiv) {
  if (x > (window.innerWidth - canvasDiv.clientWidth)) {
    canvasDiv.classList.add("dollarImgLft")
  } else {
    canvasDiv.classList.remove("dollarImgLft")
  }
}
function showCanvasHandler(event) {
  let clickedElement = event.target
  let grandParent = clickedElement.parentElement.parentElement
  let canvasDiv = clickedElement.parentElement.nextElementSibling
  if (canvasDiv) {
    hideAllCanvas(canvasDiv);
    canvasDiv.classList.toggle("dollarImgHideCanvas")
    canvasDiv.classList.toggle("dollarImgShowCanvas")
    controlCanvasPosition(event.clientX,canvasDiv)
  } else {
    let imgURL = clickedElement.getAttribute("data-hrf")
    if (imgURL) {
      let tagName = "canvas"
      if (imgURL == "IMG") {
        imgURL = clickedElement.src
        tagName = "img"
      }
      clickedElement.removeAttribute("data-hrf")
      let canvasParent = document.createElement("div")
      let downloadButton = document.createElement("a")
      downloadButton.textContent = "Download"
      downloadButton.href = imgURL
      downloadButton.target="_blank"
      let canvasOrImg = document.createElement(tagName)
      canvasOrImg.classList.add("dollarImgCanvas")
      canvasParent.className = "dollarImgCanvasp"
      canvasParent.appendChild(canvasOrImg)
      canvasParent.appendChild(downloadButton)
      if (tagName == "img") {
        canvasOrImg.src=imgURL
        firstClickToShowPreview(canvasOrImg,grandParent,event.clientX)
      } else {
        startPDFRendering(canvasOrImg,imgURL, [grandParent, event.clientX])
      }
    }
  }
}
function hideAllCanvas(currentCanvas) {
  let canvas = document.getElementsByClassName("dollarImgShowCanvas")
  for (let child of canvas) {
    if (currentCanvas != child) {
      child.classList.replace("dollarImgShowCanvas","dollarImgHideCanvas")
    }
  }
}
function startPDFRendering(canvas, url2,canvasGrandParent) {
  var pdfjsLib = window['pdfjs-dist/build/pdf'];
  pdfjsLib.GlobalWorkerOptions.workerSrc = './localresource/js/cob/pdf.worker.min.js';
  var loadingTask = pdfjsLib.getDocument(url2);
  loadingTask.promise.then(function (pdf) {
    var pageNumber = 1;
    pdf.getPage(pageNumber).then(function (page) {
      var viewport = page.getViewport({ scale: 2 });
      var renderTask = page.render(getCanvasContex(canvas, viewport));
      renderTask.promise.then(function () {
        if (canvasGrandParent) {
          firstClickToShowPreview(canvas,canvasGrandParent[0],canvasGrandParent[1])
        }
      });
    });
  }, function (reason) {
    console.error(reason);
  });
}
function firstClickToShowPreview(canvas,grandParent,clientX) {
  hideAllCanvas(canvas)
  canvas.parentElement.classList.remove("dollarImgHideCanvas")
  canvas.parentElement.classList.add("dollarImgShowCanvas")
  grandParent.appendChild(canvas.parentElement)
  controlCanvasPosition(clientX,canvas.parentElement)
}

function getCanvasContex(canvas, viewport) {
  var context = canvas.getContext('2d');
  canvas.height = viewport.height;
  canvas.width = viewport.width;
  var renderContext = {
    canvasContext: context,
    viewport: viewport
  };
  return renderContext
}