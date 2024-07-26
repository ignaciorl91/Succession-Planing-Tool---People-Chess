let selectedID = null;

function candidateSelection(globalID, ID) {
    console.log('Candidate selected: ' + globalID);
    // Restaurar la clase del elemento previamente seleccionado, si existe
    if (selectedID) {
        try {
            let previousArticle = document.getElementById(selectedID);
            let prev_checked = previousArticle.querySelector('input[type="checkbox"]');
            if (prev_checked) {
                if (prev_checked.checked) {
                    previousArticle.className = 'article article-checked';
                }
                else {
                    previousArticle.className = 'article';
                }
            }

        } catch (error) {
            selectedID = null;
            candidateSelection(globalID, ID)
        }
    }
    selectedID = ID;
    // Cambiar la clase del nuevo elemento seleccionado

    let articleSelect = document.getElementById(selectedID);
    if (articleSelect) {
        articleSelect.className = 'selectedArticle';
        try {

            articleChecked = articleSelect.querySelector('input[type="checkbox"]');
            if (articleChecked.checked === true) {
                articleSelect.className = 'article article-checked selectedArticle';
            }
            else {
                console.log('Elemento con ID ' + selectedID + ' no encontrado.');
            }
        }
        catch (error) {
            // continue;
        }
    }

    // obtener todos los registros de successionPlans donde "Incumbent Global ID" es igual a globalID
    let candidates = successionPlans.filter(plan => plan['Incumbent Global ID'] === globalID);
    // console.log(candidates);
    fillReadinessColumn(candidates);
}
// function to fill readiness in table from candidates

function fillReadinessColumn(candidates) {
    // left join HCdata json with candidates on 'Global ID'
    HCData.forEach(function (hc) {
        let readiness = candidates.find(candidate => candidate['Successor Global ID'] == hc['Global ID']);
        hc['Readiness Level'] = readiness ? readiness['Readiness Level'] : '';
    });

    // Get the DataTable instance
    let table = $('#headcount').DataTable();
    // Clear and destroy the existing table
    table.clear().destroy();

    // Create a new table with the new data
    table = createTable(HCData);

}
