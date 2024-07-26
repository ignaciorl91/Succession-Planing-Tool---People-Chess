var notyf = new Notyf();

// get all articles from document
var articles = document.getElementsByTagName('article');
const tree = document.getElementById('mainTree');
// const levels = document.getElementById('levels');    

function composeTree() {
    function originPosition() {
        var originPosition = pipeline.filter(entry => entry['parent'] === 'root');
        const level0 = document.getElementById('level0');

        originPosition.forEach(entry => {
            let SuccessorHCData = HCData.filter(item => item['Global ID'] === entry['global ID']);

            var div = document.createElement('div');
            div.id = 'div-' + entry['id'];
            div.className = 'col';
            var divchild = document.createElement('div');
            divchild.className = 'row';
            divchild.id = 'divchild-' + entry['id'];

            var element = document.createElement('article');
            element.className = 'article';

            var positionName = document.createElement('h6');
            var incumbent = document.createElement('h5');
            positionName.innerHTML = entry['Position ID'] +"- ["+SuccessorHCData[0]['Position Band']+ '] - '+SuccessorHCData[0]['Zone Fixed'];
            incumbent.innerHTML = entry['incumbent']+ ' - ['+SuccessorHCData[0]['Employee Band']+"]";;

            let div2 = document.createElement('div');
            div2.className = 'article-content';

            let photo = document.createElement('img');
            photo.src = "https://images.rawpixel.com/image_png_800/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIzLTAxL3JtNjA5LXNvbGlkaWNvbi13LTAwMi1wLnBuZw.png";
            photo.onerror = function () {
                photo.src = "https://images.rawpixel.com/image_png_800/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIzLTAxL3JtNjA5LXNvbGlkaWNvbi13LTAwMi1wLnBuZw.png";
            };
            photo.style.width = '50px';
            photo.style.height = '50px';
            photo.style.borderRadius = '50%';
            div2.appendChild(photo);
            div2.appendChild(incumbent);
            div2.appendChild(positionName);
            // element.innerHTML = entry['incumbent'];
            element.id = entry['id'];
            element.draggable = true;
            element.ondrop = function (event) {
                event.preventDefault();
                let data = event.dataTransfer.getData('text/plain');
                let parsedData = JSON.parse(data);
                let parentID = entry.id;
                let parentGlobalID = entry['global ID'];
                let alreadyChild = pipeline.some(item => item.parent === parentID && item['global ID'] === parsedData['globalID']);
                if (alreadyChild) {
                    Swal.fire({
                        icon: "error",
                        title: "Oops...",
                        text: "This element is already a child of the selected parent",
                        timer: 2500

                    });
                    return;
                }
                if (parentID.includes(parsedData['globalID'])) {
                    Swal.fire({
                        icon: "error",
                        // title: "Oops...",
                        text: "You cannot drop an element into its own children",
                        timer: 2500

                    });
                    return;
                }
                    // get readiness level
                    let readiness;
                    let foundItem = successionPlans.find(item => 
                        item["Incumbent Global ID"] === parentGlobalID && 
                        item["Successor Global ID"] === parsedData['globalID']
                    );
    
                    if (foundItem) {
                        readiness = foundItem['Readiness Level'];
                    } else {
                        // Manejar el caso en que no se encuentra el elemento, si es necesario
                        readiness = ''; // o cualquier valor predeterminado
                    }
                    
                pipeline.push({
                    id: parentID + parsedData['globalID'],
                    'global ID': parsedData['globalID'],
                    'Position ID': parsedData['posID'],
                    incumbent: parsedData['IncumbentName'],
                    parent: parentID,
                    parentGlobalID: parentGlobalID,
                    readiness: readiness,
                    level: 1
                });
                composeTree(); // Recompone el árbol después de actualizar el pipeline
            }
            element.ondragstart = function (event) {
                event.dataTransfer.setData('text/plain', entry['id']);
            }
            element.ondragover = function (event) {
                event.preventDefault(); // Necesario para permitir un drop
            }
            element.onclick = function (event) {
                candidateSelection(entry['global ID'], entry['id']);
            };


            // Add Successors buttons
            let candidatesRN = successionPlans.filter(items => items['Incumbent Global ID'] === entry['global ID'] && items['Readiness Level'] === "Now");
            let candidates12 = successionPlans.filter(items => items['Incumbent Global ID'] === entry['global ID'] && items['Readiness Level'] === "1-2 Years");

            let addReadyNowBTN = document.createElement('button');
            addReadyNowBTN.innerHTML = 'View Ready Now';
            addReadyNowBTN.className = 'btn btn-success btn-sm';
            if (candidatesRN.length <= 0) {
                addReadyNowBTN.disabled = true;
            }
            add12yrsBTN = document.createElement('button');
            add12yrsBTN.innerHTML = 'View 1-2 yrs';
            add12yrsBTN.className = 'btn btn-warning btn-sm';
            if (candidates12.length <= 0) {
                add12yrsBTN.disabled = true;
            }

            addReadyNowBTN.onclick = function (event) {
                addSuccessors(entry['global ID'], entry['id'], 1,"Now");
            }
            add12yrsBTN.onclick = function (event) {
                addSuccessors(entry['global ID'], entry['id'], 1, "1-2 Years");
            }
            let addSuccessorsDiv = document.createElement('div');
            addSuccessorsDiv.appendChild(addReadyNowBTN);
            addSuccessorsDiv.appendChild(add12yrsBTN);
            addSuccessorsDiv.style.paddingBottom = '10px';


            div2.appendChild(addSuccessorsDiv);
            element.appendChild(div2);

            div.appendChild(element);
            div.appendChild(divchild);
            level0.innerHTML = ''; // Limpiamos el contenido existente
            level0.appendChild(div);
        });
    }

    function fillSuccessors() {
        var successors = pipeline.filter(entry => entry['parent'] !== 'root');
        // sort successors by parent and readyness 
        successors.sort((a, b) => a['parent'] < b['parent'] ? -1 : 1);

        successors.forEach(entry => {

            // Checkboxes
            check = document.createElement('input');
            check.type = 'checkbox';
            check.id = 'check' + entry['id'];
            check.className = 'check';
            check.checked = entry['checked'] || false; // Establecer el estado inicial del checkbox


            check.onchange = function (event) {
                console.log("checked " + event.target.checked + " id " + entry['id']);
                // remove others check from same parent
                pipeline.forEach(item => {
                    item.checked = false;
                });
                // check true for all parents
                entry.checked = event.target.checked;
                for (let lvl = entry.level; lvl > 0; lvl--) {
                    let parent = pipeline.find(item => item.id === entry.parent);
                    parent.checked = true;
                    entry = parent;
                }

                composeTree();
            };
            let notes = document.createElement('i');
            notes.className = 'bi bi-pencil-square';
            notes.dataset.toggle = 'modal';
            entryNoSpaces = entry['id'].replace(/\s/g, '_');
            notes.dataset.target = '#Modal' + entry['id'];
            let modal = boostrapModal(entry['id']);
            if (entry.notes) {
                notes.style.color = '#d1a33c';
                notes.style.textShadow = 'black 0px 1px .5px';
            }
            let topLeft = document.createElement('div');
            topLeft.className = 'topLeft';
            topLeft.appendChild(check);
            topLeft.appendChild(notes);
            topLeft.style.height = '20px';


            let SuccessorHCData = HCData.filter(item => item['Global ID'] === entry['global ID']);

            // main containers
            var div = document.createElement('div');
            div.className = 'col';
            var divchild = document.createElement('div');
            divchild.className = 'row';
            divchild.id = 'divchild-' + entry['id'];

            var element = document.createElement('article');
            element.className = 'col article';
            if (entry.checked === true) {
                element.className = 'col article article-checked';

            }
            let div2 = document.createElement('div');
            div2.className = 'article-content';

            // main Content
            let photo = document.createElement('img');
            // photo.src = 'Pictures/' + entry['global ID'] + '.png'; FOR REAL APP ONLY
            photo.src = "https://images.rawpixel.com/image_png_800/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIzLTAxL3JtNjA5LXNvbGlkaWNvbi13LTAwMi1wLnBuZw.png";

            photo.onerror = function () {
                photo.src = "https://images.rawpixel.com/image_png_800/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIzLTAxL3JtNjA5LXNvbGlkaWNvbi13LTAwMi1wLnBuZw.png";
            };
            photo.style.width = '40px';
            photo.style.height = '40px';
            photo.style.borderRadius = '50%';

            var incumbent = document.createElement('h5');
            var positionName = document.createElement('h6');

            var removeBtn = document.createElement('button');
            removeBtn.innerHTML = 'X';
            removeBtn.className = 'btn btn-dark removebtn';

            div.id = "div-" + entry['id'];
            let parentDiv = document.getElementById('divchild-' + entry['parent']);
            let tip = document.createElement('h6');
            tip.id = 'tip' + entry['global ID'];
            tip.innerHTML = timeInPosition(entry['global ID']);
            removeBtn.onclick = function () {
                deleteElement(entry['id']);
            };
            incumbent.innerHTML = entry['incumbent'] //+ ' - ['+SuccessorHCData[0]['Employee Band']+"]";
            positionName.innerHTML = entry['Position ID']//+"- ["+SuccessorHCData[0]['Position Band']+ '] - '+SuccessorHCData[0]['Zone Fixed'];
            try{
                incumbent.append(" - [" + SuccessorHCData[0]['Employee Band']+"]");
                positionName.append(" - [" + SuccessorHCData[0]['Position Band']+'] - '+SuccessorHCData[0]['Zone Fixed']);
            } catch(error) {
                console.log("Not able to get Employee Band Data");
                console.log(entry);
                // console.log("SuccessorHCData");
            }


            

            // Status bar
            let statusBar = document.createElement('div');
            switch (entry['readiness']) {
                case 'Now':
                    statusBar.className = 'status-bar';
                    statusBar.style.backgroundColor = '#959b7b';
                    break;
                case '1-2 Years':
                    statusBar.className = 'status-bar';
                    statusBar.style.backgroundColor = '#d1a33c';
                    break;
                case '2+ Years':
                    statusBar.className = 'status-bar';
                    statusBar.style.backgroundColor = '#325a6d';

                    break;
                default:
                    statusBar.className = 'status-bar bg-secondary';
            }

            // Filtrar y ordenar los planes afectados
            const readinessOrder = {
                "Now": 1,
                "1-2 Years": 2,
                "2+ Years": 3
            };
            let plansAffected = successionPlans.filter(items => items['Successor Global ID'] === entry['global ID'] && items['Incumbent Global ID'] != entry["parent"].slice(-8));
            plansAffected.sort((a, b) => {
                const orderA = readinessOrder[a['Readiness Level']] || 4; // Default to 4 if not found
                const orderB = readinessOrder[b['Readiness Level']] || 4; // Default to 4 if not found
                return orderA - orderB;
            });
                        

            // flags  ///////////////////////////////////////
            let crSpan = document.createElement('span');
            crSpan.innerHTML = "CR";
            let ltpSpan = document.createElement('span');
            ltpSpan.innerHTML = "LTP";
            let l1Span = document.createElement('span');
            l1Span.innerHTML = "L1";

            let mobilityFlag = document.createElement('i');
            mobilityFlag.className = "bi bi-flag-fill";
            
            let affectedPlans = document.createElement('span');
            affectedPlans.innerHTML = plansAffected.length;

            if (SuccessorHCData.length > 0) {
                let isCR = SuccessorHCData[0]['CR']
                let isLTP = SuccessorHCData[0]['LTP']
                let isL1 = SuccessorHCData[0]['L1']
                if (isCR == "Y") {
                    crSpan.style.color = 'White';
                    crSpan.style.textShadow = 'black 1px 1px 1px';
                }
                if (isLTP == "Y") {
                    ltpSpan.style.color = 'White';
                    ltpSpan.style.textShadow = 'black 1px 1px 1px';
                }
                if (isL1 == "Y") {
                    l1Span.style.color = 'White';
                    l1Span.style.textShadow = 'black 1px 1px 1px';
                }
                if (plansAffected.length > 0) {
                    affectedPlans.style.color = 'White';
                    affectedPlans.style.textShadow = 'black 1px 1px 1px';
                    affectedPlans.style.padding = ' 0 2px';
                    affectedPlans.style.border = 'solid 2px';
                    affectedPlans.style.borderRadius = '25%';

                   affectedPlans.title = plansAffected.map(item => item['Incumbent'] + " - Ready " + item['Readiness Level']).join('\n');

                }
            }

            let parentHCData = HCData.filter(item => item['Global ID'] === entry['parent'].slice(-8));

            try{

                let parentZone = parentHCData[0]['Zone Fixed'];
                let parentZoneLocation = parentHCData[0]['Zone_Location'];
                let successorZone = SuccessorHCData[0]['Zone Fixed'];
                let succesorMobility = SuccessorHCData[0]['Mobility'];
    
                if (!succesorMobility) {
                    mobilityFlag.style.color = '#f5e003';
                    mobilityFlag.title = "No Mobility Data";
                    mobilityFlag.style.textShadow = 'black 1px 1px 1px';
    
                }
                else {
                    let successorZones = succesorMobility.includes(' - ') ? succesorMobility.split(' - ') : [succesorMobility];
    
                    if (succesorMobility != "ALL" && parentZone != successorZone && (!successorZones.some(zone => parentZone.includes(zone)) && !successorZones.some(zone => parentZoneLocation.includes(zone)))) {
                        mobilityFlag.style.color = '#921a28';
                        mobilityFlag.style.textShadow = 'black 1px 1px 1px';
                        mobilityFlag.title = "Mobility Mismatch. The employee mobility preferences are: " + succesorMobility + " and the position is in zone: " + parentZone;
    
                    }
                }
            }
            catch (error) {
                console.log("Not able to get Mobility Data");
            
            }


            statusBar.appendChild(crSpan);
            statusBar.appendChild(ltpSpan);
            statusBar.appendChild(l1Span);
            statusBar.appendChild(mobilityFlag);
            statusBar.appendChild(affectedPlans);



            // Add Successors buttons
            let candidatesRN = successionPlans.filter(items => items['Incumbent Global ID'] === entry['global ID'] && items['Readiness Level'] === "Now");
            let candidates12 = successionPlans.filter(items => items['Incumbent Global ID'] === entry['global ID'] && items['Readiness Level'] === "1-2 Years");

            let addReadyNowBTN = document.createElement('button');
            addReadyNowBTN.innerHTML = 'View Ready Now';
            addReadyNowBTN.className = 'btn btn-success btn-sm';
            if (candidatesRN.length <= 0) {
                addReadyNowBTN.disabled = true;
            }
            add12yrsBTN = document.createElement('button');
            add12yrsBTN.innerHTML = 'View 1-2 yrs';
            add12yrsBTN.className = 'btn btn-warning btn-sm';
            if (candidates12.length <= 0) {
                add12yrsBTN.disabled = true;
            }
            addReadyNowBTN.onclick = function (event) {
                addSuccessors(entry['global ID'], entry['id'], entry['level'] + 1, "Now");
                // (entry['global ID'], entry['id'], entry['level'] + 1);
            }
            add12yrsBTN.onclick = function (event) {
                addSuccessors(entry['global ID'], entry['id'], entry['level'] + 1, "1-2 Years");
            }
            let addSuccessorsDiv = document.createElement('div');
            addSuccessorsDiv.appendChild(addReadyNowBTN);
            addSuccessorsDiv.appendChild(add12yrsBTN);

            div2.appendChild(photo);
            div2.appendChild(incumbent);
            div2.appendChild(positionName);
            div2.appendChild(tip);
            div2.appendChild(addSuccessorsDiv);
            element.appendChild(topLeft);
            tree.appendChild(modal);
            element.appendChild(div2);
            element.appendChild(statusBar);
            element.appendChild(removeBtn);
            element.id = entry['id'];
            element.draggable = true;
            element.ondrop = function (event) {
                event.preventDefault();
                var data = event.dataTransfer.getData('text/plain');
                var parsedData = JSON.parse(data);
                var parentID = entry.id;
                let parentLevel = entry.level;
                let parentGlobalID = entry['global ID'];
                // Verificar si el elemento ya es hijo del padre seleccionado
                var alreadyChild = pipeline.some(item => item.parent === parentID && item['global ID'] === parsedData['globalID']);
                if (alreadyChild) {
                    Swal.fire({
                        icon: "error",
                        title: "Oops...",
                        text: "This element is already a child of the selected parent",
                        timer: 2500

                    }); return;
                }

                if (parentID.includes(parsedData['globalID'])) {
                    Swal.fire({
                        icon: "error",
                        title: "Oops...",
                        text: "You cannot drop an element into its own children",
                        timer: 2500

                    });
                    return;
                }
                // get readiness level
                let readiness;
                let foundItem = successionPlans.find(item => 
                    item["Incumbent Global ID"] === parentGlobalID && 
                    item["Successor Global ID"] === parsedData['globalID']
                );

                if (foundItem) {
                    readiness = foundItem['Readiness Level'];
                } else {
                    // Manejar el caso en que no se encuentra el elemento, si es necesario
                    readiness = ''; // o cualquier valor predeterminado
                }

                pipeline.push({
                    id: parentID + parsedData['globalID'],
                    'global ID': parsedData['globalID'],
                    'Position ID': parsedData['posID'],
                    incumbent: parsedData['IncumbentName'],
                    parent: parentID,
                    parentGlobalID: parentGlobalID,
                    readiness: readiness,
                    level: parentLevel + 1,

                });
                composeTree(); // Recompone el árbol después de actualizar el pipeline
            }
            element.ondragover = function (event) {
                event.preventDefault(); // Necesario para permitir un drop
            }

            element.ondragstart = function (event) {
                var data = JSON.stringify({
                    globalID: entry["global ID"],
                    posID: entry["Position ID"],
                    IncumbentName: entry["incumbent"],
                });
                event.dataTransfer.setData('text/plain', data);
            }
            element.onclick = function (event) {
                candidateSelection(entry['global ID'], entry['id']);
            };
            div.appendChild(element);
            div.appendChild(divchild);
            parentDiv.appendChild(div);

        }
        );
    }
    function timeInPosition(globalID) {
        let tip = HCData.filter(item => item["Global ID"] === globalID).map(item => item["Time In Position"]);
        let text = "Time in Position: " + tip;
        // let timeInPosition = inc_data[0]["Time In Position"];
        return text;

    }
    
        

    return originPosition(), fillSuccessors();
}



function boostrapModal(id) {
    // console.log('Creating modal for ' + id);
    let modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'Modal' + id;
    modal.tabindex = '-1';
    modal.role = 'dialog';
    modal.ariaLabelledby = 'exampleModalLabel';
    modal.ariaHidden = 'true';
    let modalDialog = document.createElement('div');
    modalDialog.className = 'modal-dialog modal-dialog-centered';
    modalDialog.role = 'document';

    let modalContent = document.createElement('div');
    modalContent.className = 'modal-content';

    let modalHeader = document.createElement('div');
    modalHeader.className = 'modal-header';

    let modalTitle = document.createElement('h5');
    modalTitle.className = 'modal-title';
    modalTitle.id = 'exampleModalLabel';
    modalTitle.innerHTML = 'Successor Notes';

    let modalClose = document.createElement('button');
    modalClose.className = 'close';
    modalClose.type = 'button';
    modalClose.ariaLabel = 'Close';
    modalClose.onclick = function () {
        $('#Modal' + id).modal('hide');
    }
    let modalCloseSpan = document.createElement('span');
    modalCloseSpan.ariaHidden = 'true';
    modalCloseSpan.innerHTML = '&times;';
    modalClose.appendChild(modalCloseSpan);
    modalHeader.appendChild(modalTitle);
    modalHeader.appendChild(modalClose);

    let modalBody = document.createElement('div');
    modalBody.className = 'modal-body';
    let notesInput = document.createElement('textarea');
    notesInput.className = 'form-control';
    let value = pipeline.find(item => item.id === id).notes;
    if (value) {
        notesInput.value = value;
    }
    notesInput.rows = 3;
    let form = document.createElement('form');
    form.onsubmit = function (event) {
        let note = notesInput.value;
        pipeline.find(item => item.id === id).notes = note;
        $('#Modal' + id).modal('hide');
        composeTree();
    }
    form.appendChild(notesInput);
    modalBody.appendChild(form);

    let modalFooter = document.createElement('div');
    modalFooter.className = 'modal-footer';
    let modalFooterButton = document.createElement('button');
    modalFooterButton.type = 'button';
    modalFooterButton.className = 'btn btn-secondary';
    modalFooterButton.innerHTML = 'Close';
    modalFooterButton.onclick = function () {
        $('#Modal' + id).modal('hide');
    }
    let modalFooterSaveButton = document.createElement('button');
    modalFooterSaveButton.type = 'button';
    modalFooterSaveButton.className = 'btn btn-primary';
    modalFooterSaveButton.innerHTML = 'Save';
    modalFooterSaveButton.onclick = function () {
        let note = notesInput.value;
        pipeline.find(item => item.id === id).notes = note;
        $('#Modal' + id).modal('hide');
        composeTree();
    }
    modalFooter.appendChild(modalFooterButton);
    modalFooter.appendChild(modalFooterSaveButton);
    modalContent.appendChild(modalHeader);
    modalContent.appendChild(modalBody);
    modalContent.appendChild(modalFooter);
    modalDialog.appendChild(modalContent);
    modal.appendChild(modalDialog);
    return modal;
    // document.body.appendChild(modal);
}