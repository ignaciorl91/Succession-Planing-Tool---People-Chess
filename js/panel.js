function clearPipeline() {
    Swal.fire({
        title: "Are you sure you want to delete the curent pipeline??",
        showCancelButton: true,
        confirmButtonText: "Yes, delete",
    }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
            pipeline = [pipeline[0]];
            composeTree()

            //   Swal.fire("Saved!", "", "success");
        } else if (result.isDenied) {
            Swal.fire("Changes are not saved", "", "info");
        }
    });

    composeTree()
}


async function startPositionTrigger() {
    // Esperar a que el usuario seleccione una opción
    await checkSaved();
    // Cargar los datos del pipeline
    startPosition();
}

function startPosition() {
    pipeline = [];
    let level0 = document.getElementById('level0');
    level0.innerHTML = '';
    let articleDefault = document.createElement('article');
    articleDefault.className = 'article';
    articleDefault.style = 'height: 100px;';
    let articleContent = document.createElement('div');
    articleContent.className = 'article-content';
    let h3default = document.createElement('h3');
    h3default.innerHTML = 'Drop a position here to start your pipeline';
    articleContent.appendChild(h3default);
    articleDefault.appendChild(articleContent);
    articleDefault.ondragover = allowDrop;
    articleDefault.ondrop = composeNewDrag;
    level0.appendChild(articleDefault);
    composeTree();

}
function exportPipeline() {
    saveInLocalStorage();
    // Obtener todos los pipelines del Local Storage
    // let pipelines = JSON.parse(localStorage.getItem('pipelines')) || {};
    let pipelines = JSON.parse(getFromLocalStorage("pipelines",secretKey)) || {};

    if (Object.keys(pipelines).length === 0) {
        notyf.error('Save at least 1 draft to export');
    }
    else {
        // Crear una nueva hoja de cálculo
        var wb = XLSX.utils.book_new();

        // Iterar sobre cada pipeline y agregarlo al libro de trabajo
        for (let key in pipelines) {
            if (pipelines.hasOwnProperty(key)) {
                let pipeline = pipelines[key];
                let ws = XLSX.utils.json_to_sheet(pipeline);

                // Truncar el nombre de la hoja si excede los 31 caracteres
                let sheetName = key.length > 31 ? key.substring(0, 31) : key;

                // Asegurarse de que el nombre de la hoja es único
                let uniqueSheetName = sheetName;
                let existingSheetNames = wb.SheetNames;
                let count = 1;
                while (existingSheetNames.includes(uniqueSheetName)) {
                    uniqueSheetName = `${sheetName.substring(0, 28)}(${count})`;
                    count++;
                }

                XLSX.utils.book_append_sheet(wb, ws, uniqueSheetName); // Usar el nombre truncado y único de la hoja
            }
        }

        // Generar un archivo Excel y crear un enlace de descarga
        var wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });

        // Convertir la cadena binaria a array buffer
        function s2ab(s) {
            var buf = new ArrayBuffer(s.length);
            var view = new Uint8Array(buf);
            for (var i = 0; i < s.length; i++) {
                view[i] = s.charCodeAt(i) & 0xFF;
            }
            return buf;
        }

        // Crear un enlace de descarga y hacer clic para descargar el archivo
        var blob = new Blob([s2ab(wbout)], { type: "application/octet-stream" });
        var downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.href = URL.createObjectURL(blob);
        downloadAnchorNode.setAttribute("download", "pipelines.xlsx");
        document.body.appendChild(downloadAnchorNode); // Requerido para Firefox
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    }
}

function importPipeline() {
    var input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx'; // Asegurarse de que solo se puedan seleccionar archivos Excel
    input.onchange = e => {
        var file = e.target.files[0];
        var reader = new FileReader();
        reader.readAsBinaryString(file);
        reader.onload = readerEvent => {
            var data = readerEvent.target.result;
            var workbook = XLSX.read(data, { type: 'binary' });

            // Obtener todas las hojas de cálculo
            let savedPipelines = {};

            workbook.SheetNames.forEach(sheetName => {
                let sheet = workbook.Sheets[sheetName];
                let pipelineData = XLSX.utils.sheet_to_json(sheet);

                // Obtener el nombre completo de la posición (usando la primera fila)
                let rootPosition = pipelineData.find(row => row.level === 0);
                let fullPositionName = rootPosition ? rootPosition['Position ID'] : sheetName; // Usar el nombre de la hoja como fallback
                savedPipelines[fullPositionName] = pipelineData;
            });

            // Guardar en Local Storage
            localStorage.setItem('pipelines', JSON.stringify(savedPipelines));
            notyf.success('Pipelines imported successfully');
            fillPipelineSelect();

            // Opcional: Cargar el primer pipeline para visualizarlo (puedes ajustar esto según tu necesidad)
            if (workbook.SheetNames.length > 0) {
                let firstSheetName = workbook.SheetNames[0];
                pipeline = savedPipelines[firstSheetName];
                composeTree();
            }

        };
    };
    input.click();
}

//  para draguear a nueva posicion
function allowDrop(event) {
    event.preventDefault();
}

function composeNewDrag(event) {
    event.preventDefault();
    var data = event.dataTransfer.getData('text/plain');
    var parsedData = JSON.parse(data);
    pipeline = [{
        "id": parsedData['globalID'],
        "global ID": parsedData['globalID'],
        "incumbent": parsedData['IncumbentName'],
        "Position ID": parsedData['posID'],
        "level": 0,
        "parent": "root"
    }]
    composeTree();
}
let headcountDIV = document.getElementById('hccontainer');
let kpisDIV = document.getElementById('kpiContainer');
let kpibtn = document.getElementById('KPIsBTN');
let hcbnt = document.getElementById('hcBtn');



function saveInLocalStorage(updateSelect = true, secret = secretKey ) {
    if (!pipeline) {
        notyf.error('No pipeline to save');
        return;
    }
    if (pipeline.length === 0) {
        notyf.error('No pipeline to save');
        return;
    }
    // Encontrar la posición donde parent = 'root'
    const rootPosition = pipeline.find(item => item.parent === 'root');
    if (!rootPosition) {
        notyf.error('No root position found');
        return;
    }
    const rootPositionID = rootPosition["Position ID"];

    // Obtener los pipelines existentes del Local Storage
    let savedPipelines = JSON.parse(getFromLocalStorage("pipelines",secretKey)) || {};
    // Guardar el pipeline actual con la key basada en rootPositionID
    savedPipelines[rootPositionID] = pipeline;
    savedPipelinesJSON = JSON.stringify(savedPipelines);
    // test enctyptedData
    const encryptedData = encryptData(savedPipelinesJSON, secret);

    // Guardar de nuevo en el Local Storage
    localStorage.setItem('pipelines', encryptedData);
    notyf.success('Pipeline saved');
    if (updateSelect) {
        fillPipelineSelect();
    }
}
function updateLocalStorage(secret = secretKey, pipelinesUpdated) {
    let savedPipelinesJSON = JSON.stringify(pipelinesUpdated)
    const encryptedData = encryptData(savedPipelinesJSON, secret);
    localStorage.setItem('pipelines', encryptedData);
    notyf.success('Pipeline saved');

}

function fillPipelineSelect() {
    let savedPipelines = JSON.parse(getFromLocalStorage("pipelines",secretKey)) || {};

    let select = document.getElementById('pipelineSelect');
    select.innerHTML = '<option value="" disabled selected>Select a draft  </option>';
    for (let key in savedPipelines) {
        if (key != 'Deleted') {
        let option = document.createElement('option');
        option.value = key;
        option.innerHTML = key;
        select.appendChild(option);
    }
    }
    select.onchange = loadPipeline;
    fillAdminModel();
}
async function checkSaved() {
    if (!pipeline) {
            return;
    }
    if (pipeline.length === 0) {
        return;
    }
    else {
        let savedPipelines = JSON.parse(getFromLocalStorage("pipelines",secretKey)) || {};
        try {
            let currentRootPositionId = pipeline.filter(item => item['parent'] === 'root')[0]['Position ID'];
            let currentPipelineStr = JSON.stringify(pipeline);

            // Verificar si el pipeline ya está guardado
            if (!(currentRootPositionId in savedPipelines)) {
                return Swal.fire({
                    title: 'There is no draft saved for this pipeline.',
                    text: 'Would you like to save it?',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonText: 'Save',
                    cancelButtonText: 'Discard'
                }).then((result) => {
                    if (result.isConfirmed) {
                        // Código para guardar
                        saveInLocalStorage();
                    } else if (result.dismiss === Swal.DismissReason.cancel) {
                        // Código para descartar
                        console.log('Draft discarded');
                    }
                });
            } else {
                // Verificar si ha habido cambios en el pipeline
                let savedPipelineStr = JSON.stringify(savedPipelines[currentRootPositionId]);
                if (currentPipelineStr !== savedPipelineStr) {
                    return Swal.fire({
                        title: 'There have been changes to the pipeline',
                        text: 'Would you like to save the changes?',
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonText: 'Save',
                        cancelButtonText: 'Discard'
                    }).then((result) => {
                        if (result.isConfirmed) {
                            // Código para guardar
                            saveInLocalStorage(false);
                        } else if (result.dismiss === Swal.DismissReason.cancel) {
                            // Código para descartar
                            console.log('Draft discarded');
                        }
                    });
                }
            }

        } catch (error) {
            console.error('Error checking saved pipeline:', error);
        }
    }
}
function loadPipelineData() {
    let select = document.getElementById('pipelineSelect');
    let selectedValue = select.value;
    let savedPipelines = JSON.parse(getFromLocalStorage("pipelines",secretKey)) || {};
    pipeline = savedPipelines[selectedValue];

    composeTree();
}

async function loadPipeline() {
    // Esperar a que el usuario seleccione una opción
    await checkSaved();
    // Cargar los datos del pipeline
    loadPipelineData();
}



function fillAdminModel(){
    let modelContainer = document.getElementById('adminDraftsBody');
    let savedPipelines = JSON.parse(getFromLocalStorage("pipelines",secretKey)) || {};
    modelContainer.innerHTML = '';
    let table = document.createElement('table');
    table.className = 'table table-striped';
    let thead = document.createElement('thead');
    thead.innerHTML = '<tr><th>Position ID</th><th>Incumbent</th><th></th></tr>';
    table.appendChild(thead);
    
    for (let key in savedPipelines) {
        if (key != 'Deleted') {
        let pipeline = savedPipelines[key];
        let rootPosition = pipeline.find(item => item['parent'] === 'root');
        let rootPositionID = rootPosition['Position ID'];
        let incumbent = rootPosition['incumbent'];

        let tableRow = document.createElement('tr');
        let positionCell = document.createElement('td');
        let incumbentCell = document.createElement('td');
        let removeCell = document.createElement('td');
        let removeButton = document.createElement('i');
        removeButton.className = 'bi bi-trash-fill';

        positionCell.innerHTML = rootPositionID;
        incumbentCell.innerHTML = incumbent;
        
        removeButton.onclick = function () {
            Swal.fire({
                title: 'Are you sure you want to delete this draft?',
                showCancelButton: true,
                confirmButtonText: 'Delete',
                icon: 'warning'
            }).then((result) => {
                if (result.isConfirmed) {
                    delete savedPipelines[rootPositionID];
                    updateLocalStorage(secretKey,savedPipelines);
                    fillPipelineSelect();
                    // fillAdminModel();
                }
            });
        };

        removeCell.appendChild(removeButton);
        tableRow.appendChild(positionCell);
        tableRow.appendChild(incumbentCell);
        tableRow.appendChild(removeCell);

        table.appendChild(tableRow);
        modelContainer.appendChild(table);
    }
    }
}

document.onload = fillPipelineSelect();

$('#editDraftsModal').on('shown.bs.modal', function () {
    $('#editDraftsBtn').trigger('focus')
  })