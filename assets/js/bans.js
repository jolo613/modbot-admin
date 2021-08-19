const columnDefs = [
    { field: "make", sortable: true, filter: true, checkboxSelection: true },
    { field: "model", sortable: true, filter: true  },
    { field: "price", sortable: true, filter: true  }
];

// let the grid know which columns and what data to use
const gridOptions = {
    columnDefs: columnDefs,
    rowSelection: 'multiple',
    animateRows: true
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector('#ban-table');
    new agGrid.Grid(gridDiv, gridOptions);

    agGrid.simpleHttpRequest({url: 'https://www.ag-grid.com/example-assets/row-data.json'})
        .then(data => {
            gridOptions.api.setRowData(data);
        });
});