function affectedPlans() {
    let checks = pipeline.filter(entry => entry['checked'] === true);
    let affected = [];
    for (let i = 0; i < checks.length; i++) {
        temp_aff = successionPlans.filter(entry => entry['Successor Global ID'] === checks[i]['global ID'] && entry['Incumbent Global ID'] != checks[i]['parent'].substr(checks[i]['parent'].length - 8));
        affected.push({ "Successor":checks[i]['global ID'],"plans": temp_aff });
        // affected.push({temp_aff });
    }
    // Count number of unique plans affected
    let unique = new Set();

    affected.forEach(function (entry) {
        entry.plans.forEach(function (plan) {
            unique.add(plan['Incumbent Global ID']);
        });
    });
    let kpiDiv = document.getElementById('kpiContainer');
    let NplansAffected = document.createElement('h4');
    NplansAffected.innerHTML = 'Affected Plans: '+unique.size;
    kpiDiv.innerHTML = '';
    kpiDiv.appendChild(NplansAffected);
    

    return affected;}