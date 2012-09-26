(function($) {
$.fn.dataTablesTools = {
	defaults: {
		bootstrap: false,
		jQueryUI: false,
		columnFiltering: false,
		selectableRows: false,
		selectAll: true,
		onDraw: null
	}
};
$.fn.initDataTables = function( opts ) {
	var options = $.extend($.fn.dataTablesTools.defaults, opts),
		$elements = this;
	// handle any dataTables
	var dataTableInit = $.extend({
			bJQueryUI: options.jQueryUI,
			aaSorting: [],
			fnDrawCallback: function() {
				$(this).trigger({type: 'draw'});
			}
		}, opts),
		customDataTableInit = $elements.data('data-table-init');
	if( customDataTableInit != undefined ) {
		$.extend(dataTableInit, customDataTableInit);
	}
	if( options.bootstrap ) {
		$elements
			.addClass('table-striped table-bordered');
		$.extend($.fn.dataTableExt.oStdClasses, {
		    'sWrapper': 'dataTables_wrapper form-inline'
		});
	}
	if( options.onDraw ) {
		$elements.bind('draw', options.onDraw);
	}
	$elements
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
		});
	// column filtering support
	$elements.filter(options.columnFiltering ? '*' : '.dataTableColumnFiltering')
		.dataTableColumnFiltering(options);
	// selectable rows support
	$elements.filter(options.selectableRows ? '*' : '.dataTableSelectable')
		.each(function() {
			// if we're loading from an AJAX source then we need to listen for the init event
			$(this).bind('init', function() {
				$(this).dataTableSelectable(options);
			});
		});
	// if we're not loading from an AJAX source the 'init' event never gets fired 
	// by dataTables, so trigger it to normalise the interface
	$elements.each(function() {
			if( !dataTableInit.sAjaxSource ) {
				$(this).trigger({type: 'init'});
			}
		});
	
	return $elements;
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
$.fn.dataTableSelectable = function( options ) {
	return this.each(function() {
		var $table = $(this).dataTable(), $row, checked, i;
		var handler = function(e, loading) {
			var $checkbox = $('input[type=checkbox]', this);
			// clicking in an input or a link doesn't select the row
			if( e && $(e.target).is('input, textarea, a') && e.target != $checkbox.get(0) ) {
				return;
			}
			// if the row was clicked then toggle the checkbox
			if( e && !$checkbox.filter(e.target).length ) {
				checked = $checkbox.prop('checked', !$checkbox.prop('checked'));
				$checkbox.trigger('change');
			}
			else { // it's already been toggled
				checked = $checkbox.prop('checked') || false;
			}
			$(this).toggleClass('row_selected', checked);
			if( !loading ) {
				$table.trigger('dataTableSelection', [$table.dataTableNumSelected()]);
			}
		};
		$($table.fnGetNodes()).each(function() {
			$(this).bind('click', handler)
				.find('input[type=checkbox]').bind('change', function() {
					handler.call($(this).closest('tr'));
				});
			handler.call(this, null, true);
		});
		$table.trigger('dataTableSelection', [$table.dataTableNumSelected()]);
		$table.parents().filter('form').submit(function() {
			$(this).append(
				// create a hidden div
				$(document.createElement('DIV')).hide()
				// append all the checkboxes to this so the off-page ones are included
				.append($($table.fnGetNodes()).find('input'))
			); // and add this to the form
		});
		if( options.selectAll ) {
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
						$(this).prop('checked', checked);
						$(this).trigger('change');
					});
					$(this).toggleClass('row_selected', checked);
				});
				$table.trigger('dataTableSelection', [$table.dataTableNumSelected()]);
			});
		}
	});
};
$.fn.dataTableNumSelected = function() {
	var $table = $(this).dataTable(), $row, checked, i;
	return $(':checked', $table.fnGetNodes()).length;
};
})(jQuery);