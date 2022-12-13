//----------------- $image  ------------------------
cob.custom.customize.push(function (core, utils, ui) {
  const matcher = /[$]image(\(.+\))?/;

  core.customizeAllInstances((instance, presenter) => {
    if (instance.isNew() || presenter.isGroupEdit()) return;

    let imagesFPs = presenter.findFieldPs((fp) => matcher.exec( fp.field.fieldDefinition.description ) );
    imagesFPs.forEach((fp) => {
      let args = fp.field.fieldDefinition.description.match(matcher);

      let replaceFlag = args && args[1] && args[1].match(/\(\[.*replace:true.*\]\)/).length == 1 || false
      let width = (args && args[1]) && args[1].match(/\(\[.*width:(\d+).*\]\)/) && args[1].match(/\(\[.*width:(\d+).*\]\)/)[1] || "";
      let $image = $(
        '<div style="width:100%;">' +
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

  core.customizeAllColumns("*", function (node, esDoc, fieldInfo) {
    /*
            const LINE_HEIGHT = 25;
    
            let initialTop = parseInt(node.parentElement.style.top);
            if(initialTop == "0") {
                // In the first line of results set the position for 'more', the size of grid and the scroll position
                
                // Find top value for the last row
                let lastTop = 0;
                node.parentElement.parentElement.childNodes.forEach( e => {
                    if(e.className 
                        && e.className.indexOf("slick-row") >= 0
                        && e.className.indexOf("more-records-row") < 0) {
                            let thisTop = parseInt(e.style.top);
                            if(parseInt(e.style.height) > LINE_HEIGHT) thisTop = thisTop / imageLineRatio;
                            if (thisTop > lastTop) {
                                lastTop = thisTop
                            }
                    }
                })
    
                // Find the node for 'more' (if exists)
                let moreRow = Array.prototype.find.call(node.parentElement.parentElement.childNodes, e => e.className && e.className.indexOf("more-records-row") >= 0 );
                
                // Set height of the containing div
                lastTop = lastTop * imageLineRatio;
                node.parentElement.parentElement.style.height = lastTop + LINE_HEIGHT * imageLineRatio + 25 + "px";
    
                // if there are 'more' results 
                if(moreRow) {
                    // set top position for 'more' row 
                    moreRow.style.top = lastTop + LINE_HEIGHT * imageLineRatio + "px";
    
                    // set handle to reposition the scroll on the previous element of 'more'
                    moreRow.onclick = function(ev){
                        let lastShown =  $(".entry-actions div div a",moreRow.previousSibling)[0].dataset.entityid
                        setTimeout( () => { 
                            $(".entry-actions div div a[data-entityid='" + lastShown + "']")[0].scrollIntoView();   
                        },3000)
                        //^^^^ TODO: idealmente em vez de esperar um tempo que não é certo devia reagir ao evento de lista pronta
                    }
                }
            }
    
            // increase heigth of each result line
            let newTop = initialTop * imageLineRatio + "px"
            node.parentElement.style.top = newTop;
            node.parentElement.style.height = LINE_HEIGHT * imageLineRatio +"px";
            node.parentElement.childNodes.forEach(e => {
                if(e.className && e.className.indexOf("slick-cell") >= 0) {
                    e.style.height = (LINE_HEIGHT * imageLineRatio - 5) +"px";
                    e.classList.add("cellsInImgLine")
                }
            });
    */
    const matchFieldRegex = /[$]image/;
    if (matchFieldRegex.exec(fieldInfo.fieldDefDescription)) {
      // insert image inline
      node.classList.add("imgCell");
      let originalLink = node.innerHTML
      node.innerHTML = node.innerHTML
        .replace(/.*href/, "<span>xpto</span>" + "<div> <img src")
        .replace(/ target.*/, "></img></div>")
        .replace(/xpto/, originalLink);
    }
  });
});    