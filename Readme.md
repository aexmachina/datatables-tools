# DataTables Tools

A collection of functions that I have found useful with DataTables. Provides the following (largely undocumented) features:

- A simple init function `$.fn.initDataTables` that provides common initialisation, including:
  - A simple data-API to augment the dataTables options using an `data-table-init` attribute
  - Support for jQueryUI and (untested) Bootstrap styling 
  - Automatic creation of a `<thead>` element if required
  - Support for hidden columns using a `th.hiddenColumn` class
  - Support for column filtering using the options or a `table.columnFiltering` class
  - Support for selectable rows using the options or a `table.selectableRows` class
- `$.fn.dataTableColumnFiltering` provides column-based filters
- `$.fn.dataTableSelectable` provides selectable rows