


function deleteElement(id) {
    Swal.fire({
        title: 'Remove?',
        text: 'By deleting, you will also delete all its children from this view but not from the succession Plan?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel'
    }).then((result) => {
        if (result.isConfirmed) {
            // Código para guardar
            saveDeletedCandidate(id);
            deleteElementAndChildren(id);
            composeTree();
        } else if (result.dismiss === Swal.DismissReason.cancel) {
            console.log('Cancel');
        }
    });
}


function deleteElementAndChildren(id) {
    // Encuentra todos los hijos del elemento y llámalos recursivamente
    var children = pipeline.filter(entry => entry.parent === id);
    children.forEach(child => {
        deleteElementAndChildren(child.id);
    });

    // Elimina el propio elemento
    var index = pipeline.findIndex(entry => entry.id === id);
    if (index > -1) {
        pipeline.splice(index, 1);
    }

    // Elimina todos los elementos cuyo 'parent' sea el 'id' especificado
    for (var i = pipeline.length - 1; i >= 0; i--) {
        if (pipeline[i].parent === id) {
            pipeline.splice(i, 1);
        }
    }
}
let deletedCandidates = [];

function saveDeletedCandidate(id){
    console.log('id', id);
    let candidate = pipeline.find(entry => entry.id === id);
    candidate_formatted = {
        "Incumbent Global ID": candidate['parentGlobalID'],
        "Incumbent Name": HCData.find(entry => entry["Global ID"] === candidate['parentGlobalID']).Name,
        "Successor Global ID": candidate['global ID'],
        "Successor Name": candidate['incumbent'],
        "Successor Position ID": candidate['Position ID'],
        "Successor Notes": candidate['notes'],
    }
    // Guardar de nuevo en el Local Storage
    let savedPipelines = JSON.parse(getFromLocalStorage("pipelines",secretKey)) || {};

    if (!savedPipelines["Deleted"]) {
        savedPipelines["Deleted"] = [];
    }
    savedPipelines["Deleted"].push(candidate_formatted);
    updateLocalStorage(secretKey,savedPipelines)
    // localStorage.setItem('pipelines', JSON.stringify(savedPipelines));
    
    console.log(deletedCandidates);
}