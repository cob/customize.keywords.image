//------------------ $image  ------------------------
const pdfRegex = /([a-z\-_0-9\/\:\.]*\.(pdf))/i
const imageMatcher = /[$]image(\(.+\))?/;
const imgRegex = /([a-z\-_0-9\/\:\.]*\.(jpg|jpeg|png|gif))/i
const fileMatcher = /([$]file|[$]extFile)/;
const drawMatcher = /[$]draw/;
const readOnlyMatcher = /[$]readonly/;

const pdfURLIcon = "localresource/icons/pdf3.png"

let runOnce;
cob.custom.customize.push(function (core, utils, ui) {
  runOnce = true
  core.customizeAllInstances((instance, presenter) => {
    if (instance.isNew() || presenter.isGroupEdit()) return;
    if(runOnce){
      pdfPreviewDocumentOnclickHandler()
      runOnce = false
    }
    const imagesFPs = presenter.findFieldPs((fp) => imageMatcher.exec( fp.field.fieldDefinition.description ));
    imagesFPs.forEach((fp) => {

      const imgFieldPresenter = fp.content()[0];
      // ImgLink differs if the field is a $file or a $link ($image supports both)
      if(fp.field.fieldDefinition.description.match(drawMatcher) && !fp.field.fieldDefinition.description.match(readOnlyMatcher)){
        return;
      }
      const imgLink = fp.field.fieldDefinition.description.match(fileMatcher)
                      ? $(imgFieldPresenter).find(".link-container a")[0] && $(imgFieldPresenter).find(".link-container a")[0].href
                      : fp.field.htmlEncodedValue
      if (imgLink) {
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

        if(imgLink.match(imgRegex)){
          const $image = $(
            '<div class="dollarImgDiv" >' +
              '<img ' + 'src="' + imgLink + '"></img>' +
              "<span>"+showMsg+"</span>" +
            "</div>"
          );
          imgFieldPresenter.append($image[0]);
          applyArgs($image.children("span")[0],imgFieldPresenter,replaceFlag,width, "img")
        }else if(imgLink.match(pdfRegex)){
          pdfPreviewOnInstances(imgFieldPresenter,imgLink,showMsg,replaceFlag, width)
        }
      }
    });
  });
  runOnce = true
  core.customizeAllColumns("*", function (node, esDoc, fieldInfo) {
    if (imageMatcher.exec(fieldInfo.fieldDefDescription)) {
      //PDF PREVIEW FOR COLUMNS
      if(runOnce){
        pdfPreviewDocumentOnclickHandler()
        runOnce = false
      }
      node.classList.add("dollarImgCell");

      let numFiles = 0
      for(let childNode of node.childNodes) {
        let link;
        if (childNode.tagName == "A") {
          link = childNode.href
          childNode.removeAttribute("href")
        } else if(", "!=childNode.textContent){
          link = childNode.textContent
          childNode = document.createElement("a")
          childNode.className="link"
          node.innerHTML=""
          node.textContent=""
          node.appendChild(childNode)
        }else{
          childNode.textContent=""
          continue
        }
        let fileName = ""
        if(esDoc[fieldInfo.field]) {
          fileName = esDoc[fieldInfo.field][numFiles]
        }
        numFiles++
        childNode.classList.add("flex")

        childNode.setAttribute("target", "_blank")
        if (link && link.match(imgRegex)) {
          childNode.innerHTML = `<div class='dollarImageDiv'>
                                  <div class='dollarImageItem'>
                                    <img class='dollarImgThg' src='${link}'  data-hrf='IMG' data-filename='${fileName}'></img>
                                  </div>
                                </div>
                                `
        } else if (link && link.match(pdfRegex)) {
          childNode.innerHTML = `<div class="dollarImgPDFdiv">
                                    <div class='dollarImageItem'>
                                      <img src=${pdfURLIcon} class="pdfPreview dollarImgThg" data-hrf=${link} data-filename='${fileName}'>
                                    </div>
                                  </div>`
        } else {
          //unknownFileIcon
          childNode.innerHTML = `<div class="dollarImgPDFdiv">
                                    <div class='dollarImageItem'>
                                      <a href='${link}' target='_blank'>
                                        <img src='localresource/icons/FileIcon.png' class="pdfPreview dollarImgThg" data-filename='${fileName}'>
                                      </a>
                                    </div>
                                  </div>`
        }
      }
    }
  });
})
function pdfPreviewDocumentOnclickHandler() {
  let aux = document.onclick
  if(aux)
  {
    document.onclick=(e)=>{
      handleShowHidePDFPreview(e)
      aux(e)
    }
  } else if (!aux)
  {
    document.onclick=handleShowHidePDFPreview
  }
}
function handleShowHidePDFPreview(e) {
  if (e.target.classList.contains("dollarImgThg") || e.target.classList.contains("dollarImgCanvas_inst")) {
    showCanvasHandler(e)

  }else if (!e.target.closest(".controlPageBar") && !e.target.closest(".dollarImgCanvas")) { // if the click was inside the page controls area or document, dont hide
    hideAllCanvas(null) 
  }
}
function applyArgs(span,imgFieldPresenter,replaceFlag,width, type) {
  let widthCalc;
  if (width) {
    widthCalc = width+'px'
    span.parentElement.style.setProperty('--defaultWidth', widthCalc);
  }else{
    widthCalc = window.getComputedStyle(document.querySelector(':root')).getPropertyValue('--defaultWidth')
  }
  if (type == "img"){
    let zoom = false
    span.parentElement.firstChild.onclick = () => {
      zoom = !zoom;
      if (zoom) {
        span.parentElement.style.setProperty('--defaultWidth', 600 + 'px');
      } else {
        span.parentElement.style.setProperty('--defaultWidth', widthCalc);
      }
    }
  }
  let show = !replaceFlag
  imgFieldPresenter.children[0].style.display = show ? "" : "none";
  span.onclick = () => {
    show = !show
    imgFieldPresenter.children[0].style.display = show ? "" : "none";
  }
}
function pdfPreviewOnInstances(imgFieldPresenter,fileURL,showMsg,replaceFlag, width) {
  const fileName = decodeURIComponent(fileURL.split("/").pop());  //get filename and decode to utf-8
  const $image = $(
    '<div class="dollarImgDiv" >' +
      '<canvas class="dollarImgCanvas_inst" data-hrf="' + fileURL + '" data-filename="' + fileName +'"></canvas>' +
      "<span>"+showMsg+"</span>" +
    "</div>"
  );
  imgFieldPresenter.append($image[0]);
  let pdfCanvas = $image.children("canvas")[0]
  applyArgs($image.children("span")[0],imgFieldPresenter,replaceFlag, width, "pdf")
  //onInstance preview (before click) is just the first page
  startPDFRendering(pdfCanvas, fileURL, null, 1);
}

function optimizedResizeHandlerWrapper(){
  addEventListener("resize", (event) => {
    let canvas = document.getElementsByClassName("dollarImgShowCanvas")
    if(canvas && canvas[0]){
      calcCanvasParentHeight(canvas[0],canvas[0].children[1]);
    }
  });
}
optimizedResizeHandlerWrapper();
function controlCanvasPosition(x,canvasDiv) {
  if (x > (window.innerWidth - canvasDiv.clientWidth)) {
    canvasDiv.classList.add("dollarImgLft")
  } else {
    canvasDiv.classList.remove("dollarImgLft")
  }
}
function calcCanvasParentHeight(canvasParent,canvas){
  let h = window.innerHeight*0.95
  if(h<canvas.clientHeight){
    canvasParent.style.height = `${h}px`
  }else{
    canvasParent.style.height = `unset`
  }
}

function showCanvasHandler(event) {
  let pageNumber = 1;  //to keep the page number of the pdf
  let currentPage;     //store the current page value 
  let clickedElement = event.target
  let canvasDiv = clickedElement.parentElement.nextElementSibling
  if (canvasDiv) {
    hideAllCanvas(canvasDiv);
    canvasDiv.classList.toggle("dollarImgHideCanvas")
    canvasDiv.classList.toggle("dollarImgShowCanvas")

    controlCanvasPosition(event.clientX,canvasDiv)
    if(canvasDiv.classList.contains("dollarImgShowCanvas")){
      calcCanvasParentHeight(canvasDiv,canvasDiv.children[1])
    }
  } else {
    let imgURL = clickedElement.getAttribute("data-hrf")
    if (imgURL) {

      //common between img and pdf
      clickedElement.removeAttribute("data-hrf")
      let canvasParent = document.createElement("div")
      let downloadButton = document.createElement("a")
      downloadButton.textContent = `Download - ${clickedElement.dataset.filename}`
      downloadButton.href = (imgURL !== "IMG") ? imgURL : clickedElement.src;  //get imgURl if pdf or IMG
      downloadButton.target="_blank" 

      //create alements to later edit if it a pdf
      const buttonBar = document.createElement("div");  
      const pageInfo = document.createElement("span");
      const nextButton = document.createElement("button");
      const previousButton = document.createElement("button");

      let tagName = "canvas"
      if (imgURL == "IMG") {
        imgURL = clickedElement.src
        tagName = "img"
      } else { //is a pdf 

        //fetch pdf pages usig pdfjslib
        var totalPag
        var pdfjsLib = window['pdfjs-dist/build/pdf'];
        pdfjsLib.getDocument(imgURL).promise.then(function (pdf) {
            var numPages = pdf.numPages;
            totalPag = numPages;
            pageInfo.textContent = `Page ${pageNumber} / ${numPages}`;

            //page controls unnecessary if there is only one page
            if (numPages === 1) {
              nextButton.classList.add("hidden");
              previousButton.classList.add("hidden");
            }
        })

        //build controls and add text and class
        pageInfo.classList.add("page-info");
        nextButton.classList.add("controlPageButton")
        nextButton.textContent = "Next";
        previousButton.classList.add("controlPageButton")
        previousButton.textContent = "Previous";

        buttonBar.classList.add("controlPageBar");
        buttonBar.appendChild(previousButton);
        buttonBar.appendChild(pageInfo);
        buttonBar.appendChild(nextButton);
      }

      let canvasOrImg = document.createElement(tagName)
      canvasOrImg.classList.add("dollarImgCanvas")
      canvasParent.className = "transition-opacity duration-200 dollarImgCanvasp"
      
      canvasParent.appendChild(downloadButton)
      canvasParent.appendChild(canvasOrImg)
      canvasParent.appendChild(buttonBar);
      let grandParent = clickedElement.parentElement.parentElement

      //when the document is clicked
      canvasOrImg.addEventListener("click", () => {
        //set new class for zoomed elements
        canvasOrImg.classList.toggle("dollarImgShowZoom")
        buttonBar.classList.toggle("dollarImgShowZoom")
        downloadButton.classList.toggle("dollarImgShowZoom")
        calcCanvasParentHeight(canvasOrImg.parentElement,canvasOrImg)
      });

      // When the "nextPage" button is clicked
      nextButton.addEventListener("click", () => {
        if (currentPage) {
          pageNumber = currentPage;
        }
        if (pageNumber < totalPag){
          pageNumber++;  //change page
          currentPage = pageNumber;
          pageInfo.textContent = `Page ${pageNumber} / ${totalPag}`;
          startPDFRendering(canvasOrImg,imgURL, [grandParent, event.clientX], pageNumber)
        }
      });

      // When the "previousPage" button is clicked
      previousButton.addEventListener("click", () => {
        if (currentPage) {
          pageNumber = currentPage;
        }
        if (pageNumber>1){
          pageNumber--;  //change page
          currentPage = pageNumber;
          pageInfo.textContent = `Page ${pageNumber} / ${totalPag}`;
          startPDFRendering(canvasOrImg,imgURL, [grandParent, event.clientX], pageNumber)
        }
      });

      if (tagName == "img") {
        canvasOrImg.src=imgURL
        firstClickToShowPreview(canvasOrImg,grandParent,event.clientX)
      } else {
        //Render pdf page
        startPDFRendering(canvasOrImg,imgURL, [grandParent, event.clientX], pageNumber)
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

//render the the given page of the pdf
function startPDFRendering(canvas, url2,canvasGrandParent, pageNumber) {
  var pdfjsLib = window['pdfjs-dist/build/pdf'];
  pdfjsLib.GlobalWorkerOptions.workerSrc = './localresource/js/cob/pdf.worker.min.js';
  var loadingTask = pdfjsLib.getDocument(url2);
  loadingTask.promise.then(function (pdf) {
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
  calcCanvasParentHeight(canvas.parentElement,canvas)
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
