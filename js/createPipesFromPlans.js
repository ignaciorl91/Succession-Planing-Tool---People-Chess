function addSuccessors(incumbentId, parentId, level, readiness) {
    let successors = successionPlans.filter(item => item["Incumbent Global ID"] === incumbentId && item["Readiness Level"] === readiness);

    let added = 0;

    for (let i = 0; i < successors.length; i++) {
        let successorId = successors[i]['Successor Global ID'];
        let positionId = successors[i]['Successor Position'];

        // Si el sucesor ya está en la rama actual, omítelo
        if (level != 0 && (parentId.includes(successorId))) {
            console.log('You cannot drop an element into its own children');
            console.log("parent ID: " + parentId);
            console.log("successorId: " + successorId);
            continue
        }
        if (pipeline.filter(item => item["id"] === parentId + successorId).length === 0) {

            pipeline.push({
                "id": parentId + successorId,
                "global ID": successorId,
                "Position ID": positionId,
                "incumbent": successors[i]['Successor'],
                "parent": parentId,
                "parentGlobalID": incumbentId,
                "level": level,
                "readiness": readiness,
                "checked": false,

            });
            added++;
        }
    }
    // if (added == 0) {
    //     pipeline = pipeline.filter(item => (item['parent']!=parentId   || (item['parent']===parentId && (item['readiness']!=readiness || item['checked']==true))));
    // }
    if (added == 0) {
        removeFromPipeline = pipeline.filter(ent => ent.parent === parentId && ent.checked!=true && ent.readiness === readiness);
        removeFromPipeline.forEach(item => 
            {
             deleteElementAndChildren(item.id);
        });
    }
    composeTree();
}

// function newline() {
//     let maxLevel = Math.max(...pipeline.map(item => item["level"]));
//     nextLevel(maxLevel)
// }
// function nextLevel(currentLevel) {
//     let prevLevelIDS = pipeline.filter(item => item["level"] === currentLevel);
//     for (let i = 0; i < prevLevelIDS.length; i++) {
//         addSuccessors(prevLevelIDS[i]["global ID"], prevLevelIDS[i]["id"], currentLevel + 1)
//     }
//     return prevLevelIDS;
// }
