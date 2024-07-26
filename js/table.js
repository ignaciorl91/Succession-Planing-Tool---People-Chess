function format(d) {
    return (
        '<div>' +
        '<strong>Time in Position: </strong>' + d["Time In Position"] + '</div>' +
        '<div>' +
        '<br>'+
        '<strong>Zone: </strong>' + d["Zone Fixed"] + '<strong style="margin-left: 20px;">Mobility: </strong>' + d["Mobility"] + '</div>' +
        '<div>' +
        '<br>'+
        '<strong>Employee Band: </strong>' + d["Employee Band"] + '<strong style="margin-left: 20px;">Position Band: </strong>' + d["Position Band"] + '</div>' 
    );
}


function initializeTableEvents() {
    $('#headcount tbody').off('click', 'td.dt-control').on('click', 'td.dt-control', function () {
        let tr = $(this).closest('tr');
        let row = $('#headcount').DataTable().row(tr);

        if (row.child.isShown()) {
            row.child.hide();
        } else {
            row.child(format(row.data())).show();
        }
    });
}



// Define el orden personalizado para "Readiness Level"
const readinessOrder = {
    "Now": 1,
    "1-2 Years": 2,
    "2+ Years": 3
};

function readinessLevelComparator(a, b) {
    let readinessA = readinessOrder[a] || 4; // Use 4 for any undefined readiness level
    let readinessB = readinessOrder[b] || 4; // Use 4 for any undefined readiness level
    return readinessA - readinessB;
}

function createTable(data) {
    let table = new DataTable('#headcount', {
        paging: false,
        scrollY: '75vh',
        data: data,
        columns: [
            {
                className: 'dt-control',
                orderable: false,
                data: null,
                defaultContent: '',
                onClick: function () {
                    console.log('clicked');
                }
            },
            // { data: 'Global ID' },
            { data: 'Name' },
            { data: 'Position Name' },
            {
                data: 'Readiness Level',
                className: 'readiness',
                orderable: true
            }
        ],
        order: [[3, 'asc']], // Ordenar por la cuarta columna (Readiness Level) ascendentemente
        createdRow: function (row, data) {
            // Agregar el ID de la fila al elemento <tr>
            row.style.cursor = 'grab';
            row.draggable = true;
            row.ondragstart = function (event) {
                const dataJson = JSON.stringify({
                    globalID: data['Global ID'],
                    posID: data['Position Name'],
                    IncumbentName: data['Name'],
                    TIP: data['Time In Position'].slice(0, -4),
                });
                event.dataTransfer.setData('text/plain', dataJson);
            };
        },
        columnDefs: [
            {
                targets: 3, // Aplica la función de comparación a la cuarta columna (Readiness Level)
                orderDataType: 'custom-readiness-order'
            }
        ]
    });

    // Registra el nuevo tipo de orden personalizado
    $.fn.dataTable.ext.order['custom-readiness-order'] = function(settings, col) {
        return this.api().column(col, {order: 'index'}).nodes().map(function(td, i) {
            return readinessOrder[$(td).text()] || 4; // Utiliza 4 para cualquier nivel de preparación indefinido
        });
    };

    initializeTableEvents();
    return table;
}


document.addEventListener('DOMContentLoaded', function () {
    createTable(HCData);
});