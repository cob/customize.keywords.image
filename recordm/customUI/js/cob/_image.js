//------------------ $image  ------------------------
const pdfRegex = /([a-z\-_0-9\/\:\.]*\.(pdf))/
const imageMatcher = /[$]image(\(.+\))?/;
const imgRegex = /([a-z\-_0-9\/\:\.]*\.(jpg|jpeg|png|gif))/
const fileMatcher = /[$]file/;
const pdfURLIcon = "localresource/icons/pdf.png"
//commit and push with gitkraken 5466
cob.custom.customize.push(function (core, utils, ui) {

  core.customizeAllInstances((instance, presenter) => {
    if (instance.isNew() || presenter.isGroupEdit()) return;

    const imagesFPs = presenter.findFieldPs((fp) => fileMatcher.exec( fp.field.fieldDefinition.description ) );
    imagesFPs.forEach((fp) => {

      const imgFieldPresenter = fp.content()[0];
      // ImgLink differs if the field is a $file or a $link ($image supports both)
      const imgLink = fp.field.fieldDefinition.description.match(/[$]file/)
                      ? $(imgFieldPresenter).find(".link-container a")[0] && $(imgFieldPresenter).find(".link-container a")[0].href
                      : fp.field.htmlEncodedValue



      if(imgLink && imgLink.match(imgRegex)) {
        const argsMatch = fp.field.fieldDefinition.description.match(fileMatcher);
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
      }else if(imgLink && imgLink.match(pdfRegex)){
        pdfPreviewOnInstances(imgFieldPresenter,imgLink)
      }
    });
  });


  core.customizeAllColumns("*", function (node, esDoc, fieldInfo) {
    if (imageMatcher.exec(fieldInfo.fieldDefDescription)||fileMatcher.exec(fieldInfo.fieldDefDescription)) {
      node.classList.add("dollarImgCell");
      for(let childNode of node.childNodes) {
        if(childNode.className == "link") {
          if( childNode.href.match(imgRegex)) {
            childNode.innerHTML = "<div class='dollarImageDiv'>"
                                 +" <div class='dollarImageItem'><img class='thg' src='"+childNode.href+"'></img></div>"
                                 +" <img class='hdCanvas'loading='lazy' src='"+childNode.href+"'></img>"
                                 +"</div>"
            childNode.removeAttribute("href")
          }else if (childNode.href.match(pdfRegex)) {
            childNode.innerHTML = `<div class="dollarPDFdiv">
                                      <div class='dollarImageItem'><img src=${pdfURLIcon} class="pdfPreview thg" data-hrf=${childNode.href}></div>
                                    </div>`
            childNode.removeAttribute("href")
          }else{
            childNode.innerHTML = "Link"
          }
        } else {
          childNode.textContent = " "
        }
      }
    }
  });
})
function pdfPreviewOnInstances(imgFieldPresenter,fileURL) {
  let divParent = document.createElement("div");
  divParent.className = "dollarImgDiv"
  let pdfCanvas = document.createElement("canvas");
  pdfCanvas.className = "canvas_inst"
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
  if(e.target.classList.contains("thg")){
    showCanvasHandler(e)
  }else{
    hideAllCanvas(null) 
  }
}
function controlCanvasPosition(x,canvasDiv) {
  if( x > (window.innerWidth - canvasDiv.clientWidth)){
    canvasDiv.classList.add("g_lft")
  }else{
    canvasDiv.classList.remove("g_lft")
  }
}
function showCanvasHandler(event) {
  let element = event.target
  let grandParent = element.parentElement.parentElement
  let canvasDiv = element.parentElement.nextElementSibling
  if(canvasDiv){
    hideAllCanvas(canvasDiv);
    canvasDiv.classList.toggle("hdCanvas")
    canvasDiv.classList.toggle("shCanvas")
    controlCanvasPosition(event.clientX,canvasDiv)
  }else{
    let imgURL = element.getAttribute("data-hrf")
    if(!imgURL){
      return
    }
    element.removeAttribute("data-hrf")

    let canvasParent = document.createElement("div")
    let downloadButton = document.createElement("a")
    downloadButton.textContent="Download"
    let canvas = document.createElement("canvas")
    
    canvas.classList.add("dollarCanvasImg")
    downloadButton.href=imgURL

    canvasParent.className="canvasp"
    canvasParent.appendChild(canvas)
    canvasParent.appendChild(downloadButton)

    startPDFRendering(canvas, imgURL,[grandParent,event.clientX])
  }
}
function hideAllCanvas(currentCanvas) {
  let canvas = document.getElementsByClassName("shCanvas")
  for(let child of canvas){
    if(currentCanvas!=child){
      child.classList.replace("shCanvas","hdCanvas")
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
      var scale = 2;
      var viewport = page.getViewport({ scale: scale });

      var renderTask = page.render(getCanvasContex(canvas, viewport));
      renderTask.promise.then(function () {
        if(canvasGrandParent){
          hideAllCanvas(canvas)
          canvas.parentElement.classList.remove("hdCanvas")
          canvas.parentElement.classList.add("shCanvas")
          canvasGrandParent[0].appendChild(canvas.parentElement)
          controlCanvasPosition(canvasGrandParent[1],canvas.parentElement)
        }
      });
    });
  }, function (reason) {
    console.error(reason);
  });
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