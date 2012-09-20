(function($) {
$.fn.initDataTables = function($) {
	// handle any dataTables
	var $dataTable = $('table.dataTable'), 
		dataTableInit = {
			aaSorting: []
		},
		customDataTableInit = $dataTable.data('data-table-init');
	if( customDataTableInit != undefined ) {
		$.extend(dataTableInit, customDataTableInit);
	}
	$dataTable
		.not('.noDataTable')
		.dataTablePrepare()
		.dataTable(dataTableInit)
		// handle hidden columns
		.each(function() {
			var $table = $(this), offset = 0;
			$table.css('visibility', 'visible').css('height', 'auto');
			$('thead th.hiddenColumn', $table).each(function() {
				$table.dataTable().fnSetColumnVis(
					$('thead th', $table).index(this) + offset++, false 
				);
			});
		})
		// include column filtering support
		.dataTableColumnFiltering();
	// handle selectable dataTables
	$('table.dataTableSelectable').dataTableSelectable();
	// if there's no edit form on the page
	if( $('form input[name=action][value=edit]').length == 0 ) {
		// focus the first filter on the page
		$('.dataTables_filter input[type=text]').first().focus();
	}
};
$.fn.dataTablePrepare = function(options) {
	return this.each(function() {
		var $table = $(this);
		if( $('thead', $table).length == 0 ) {
			$('tbody', $table).before('<thead></thead>');
			$('thead', $table).append($('tr:first', $table));
		}
		$table.addClass('dataTable');
		$('.orderBySelection', $table.parentNode).hide();
	});
};
$.fn.dataTableColumnFiltering = function(options) {
	return this.each(function() {
		var $table = $(this),
			$row = $('tfoot tr', $table), $cell;
		if( $row.length == 0 ) {
			$table.append('<tfoot><tr></tr></tfoot>');
			$row = $('tfoot tr', $table);
		}
		$('thead td, thead th', $table).each(function() {
			$row.append('<td>'
				+ ($(this).hasClass('noFiltering') ? ''
					: '<input type="text" placeholder="Filter ' + $(this).text() + '" class="placeholder" tabindex="-1" />')
				+ '</td>'
			);
			$('td:last input', $row).keyup(function () {
				$table.dataTable().fnFilter(
					this.value,
					// Filter on the column (the index) of this element
					$('td', $row).index(this.parentNode)
				);
			});
		});
	});
};
$.fn.dataTableSelectable = function() {
	return this.each(function() {
		var $table = $(this).dataTable(), $row, checked, i;
		var handler = function(e, loading) {
			var $checkbox = $('input[type=checkbox]', this); 
			// if the row was clicked then toggle the checkbox
			if( e && !$checkbox.filter(e.target).length ) {
				checked = $checkbox.attr('checked', !$checkbox.attr('checked'));
			}
			else { // it's already been toggled
				checked = $checkbox.attr('checked') || false;
			}
			$(this).toggleClass('row_selected', checked);
			if( !loading ) {
				$table.trigger('dataTableSelection', [$table.dataTableNumSelected()]);
			}
		};
		$($table.fnGetNodes()).each(function() {
			$(this).click(handler);
			handler.call(this, null, true);
		});
		$table.trigger('dataTableSelection', [$table.dataTableNumSelected()]);
		$table.parents().filter('form').submit(function() {
			$(this).append(
				// create a hidden div
				$(document.createElement('DIV')).hide()
				// append all the checkboxes to this so the off-page ones are included
				.append($('input[type=checkbox]', $table.fnGetNodes()))
			); // and add this to the form
		});
		$table.before('<div class="dataTables_selection"><a class="link all">Select all</a> <a class="link none">Deselect all</a></div>');
		$('a.all, a.none', $table.parent()).click(function() {
			$link = $(this);
			var filtered = $table.fnSettings().aiDisplay,
				rows = [], i;
			for( i = 0; i < filtered.length; i++ ) {
				rows.push($table.fnGetNodes(filtered[i]));
			}
			var checked = $link.hasClass('all');
			$(rows).each(function() {
				$('input[type=checkbox]', this).each(function() {
					$(this).attr('checked', checked);
				});
				$(this).toggleClass('row_selected', checked);
			});
			$table.trigger('dataTableSelection', [$table.dataTableNumSelected()]);
		});
	});
};
$.fn.dataTableNumSelected = function() {
	var $table = $(this).dataTable(), $row, checked, i;
	return $(':checked', $table.fnGetNodes()).length;
};
})(jQuery);