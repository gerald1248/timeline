var App = function() {
	this.counter = 0;
	this.init = function() {
		var self = this;
		this.addRow(false);
		$('#add-task-button').on('click', function() {
			self.addRow(true);
		});
		$('#show-timeline-button').on('click', function() {
			self.post();
		});
		$('#color-picker-border-1,#color-picker-fill-1').colorpicker({"format": "hex"});
		$('#color-picker-border-2,#color-picker-fill-2').colorpicker({"format": "hex"});
		$('#datepicker-end').datepicker({format: "yyyy-mm-dd"});
		$('#source-div').css({"display": "none"});
		$('#modal-action-button').on('click', function() {
			self.import();
		});
		this.addTableButtonHandlers();

		this.clipboard = new Clipboard('#copy-button');
		this.clipboard.on('error', function(e) {
			//TODO: Ctrl+C message fallback
		});

		//keyboard focus on textarea for quick paste action
		//not allowed to read from clipboard
		$('#import-modal').on('shown.bs.modal', function() {
			$('#modal-source').focus();
		});
	};

	this.addTableButtonHandlers = function() {
		var self = this;
		var arr = ['up-button', 'down-button', 'delete-button'];
		for (var i = 0; i < arr.length; i++) {
			$('.' + arr[i]).unbind('click');
		}
		$('.up-button').on('click', function() {
			self.up(this.id);
		});
		$('.down-button').on('click', function() {
			self.down(this.id);
		});
		$('.delete-button').on('click', function() {
			self.delete(this.id);
		});
	};

	this.addRow = function(setFocus) {
		this.counter++;
		$('#task-table-body').append(
			'<tr class="task" id="task-' + this.counter + '">' +
			'<td><div class="input-append date"><input class="form-control" id="datepicker-start-' + this.counter + '" size="16" type="text" readonly><span class="add-on"><i class="icon-th"></i></span></div></td>' +
			'<td><div class="input-append date"><input class="form-control" id="datepicker-end-' + this.counter + '" size="16" type="text" readonly><span class="add-on"><i class="icon-th"></i></span></td>' +
			'<td><div class="checkbox"><label><input id="datepicker-end-' + this.counter + '-ongoing" type="checkbox">&nbsp;Ongoing</label></div></td>' +
			'<td><input class="form-control" id="label-' + this.counter + '" type="text"></td>' +
			'<td><button class="up-button btn btn-default" id="up-button-' + this.counter + '">&uarr;</button></td>' +
			'<td><button class="down-button btn btn-default" id="down-button-' + this.counter + '">&darr;</button></td>' +
			'<td><button class="delete-button btn btn-default" id="delete-button-' + this.counter + '">&cross;</button></td>' +
			'</tr>'
		);
		$('#datepicker-start-' + this.counter + ',#datepicker-end-' + this.counter).datepicker({format: "yyyy-mm-dd"});
		
		if (setFocus) {
			$('#datepicker-start-' + this.counter).focus();
		}

		this.addTableButtonHandlers();

		return this.counter;
	};

	this.serialize = function() {
		var obj = {
			"settings": {

			},
			"tasks": [],
			"theme": {
			    "frameBorderColor": "#ffffff",
			    "frameFillColor": "#888888",
			    "stripeColorDark": "#dddddd",
			    "stripeColorLight": "#eeeeee",
			    "gridColor": "#999999"
			}
		};

		//tasks
		var tasks = $('.task');
		for (var i = 0; i < tasks.length; i++) {
			var task = tasks[i];
			var id = task.id;
			var idNum = id.replace(/^task-/, "");

			var startDate = $('#datepicker-start-' + idNum).datepicker("getFormattedDate");
			var endDate = $('#datepicker-end-' + idNum).datepicker("getFormattedDate");
			var endDateOngoing = $('#datepicker-end-' + idNum + '-ongoing').prop('checked'); 
			if (endDateOngoing) {
				endDate = "-";
			}
			var label = $('#label-' + idNum).val();

			var taskObj = {};
			taskObj.start = startDate;
			taskObj.label = label;

      //end is optional - not supplying end is perfectly valid
      //- signifies 'today' so treating 'blank' as significant is helpful here
      if (endDate.length > 0) {
			  taskObj.end = endDate;
      }

			obj.tasks.push(taskObj);
		}

		//settings - enforce sane values
    //TODO: use schema limits
		obj.settings.end = $('#datepicker-end').datepicker("getFormattedDate");
		var settingEndDateOngoing = $('#datepicker-end-ongoing').prop('checked');
		if (settingEndDateOngoing) {
			obj.settings.end = "-";
		}
    var zoomVal = Number($('#zoom-input').val());
    obj.settings.zoom = (zoomVal >= 50 && zoomVal <= 300) ? zoomVal : 150;
    var hideDaysFromVal = Number($('#hide-days-from-input').val());
    obj.settings.hideDaysFrom = (hideDaysFromVal >= 1 && hideDaysFromVal <= 365) ? hideDaysFroVal : 90;
		var hideWeeksFromVal = Number($('#hide-weeks-from-input').val());
		obj.settings.hideWeeksFrom = (hideWeeksFromVal >= 1 && hideWeeksFromVal <= 1460) ? hideWeeksFromVal : 180;
		
		//theme
		var colorSchemeVal = $('#color-scheme-select').val();
    obj.theme.colorScheme = (colorSchemeVal.length > 0) ? colorSchemeVal : "gradient";
		obj.theme.borderColor1 = $('#color-picker-border-1').colorpicker('getValue', '#ffffff');
		obj.theme.fillColor1 = $('#color-picker-fill-1').colorpicker('getValue', '#ffffff');
		obj.theme.borderColor2 = $('#color-picker-border-2').colorpicker('getValue', '#ffffff');
		obj.theme.fillColor2 = $('#color-picker-fill-2').colorpicker('getValue', '#ffffff');

	  return JSON.stringify(obj);
	}

	this.post = function() {
		var json = this.serialize();
		$.post(
			"/timeline",
			json,
			function(data) {
  				$("#result").html(data);
  				
  				if (json.length === 0) {
  					$('#source-div').css({"display": "none"});
  					return;
  				}
  				$("#source-div").css({"display": "block"});
  				$("#source")[0].value = json;
  			}
  		);
	};

	this.up = function(id) {
		var rowId = id.replace(/^up-button/, '#task');
		$(rowId).prev().before($(rowId));
		this.addTableButtonHandlers();
	};

	this.down = function(id) {
		var rowId = id.replace(/^down-button/, '#task');
		$(rowId).next().after($(rowId));
		this.addTableButtonHandlers();
	};

	this.delete = function(id) {
		var rowId = id.replace(/^delete-button/, '#task');
		$(rowId).remove();
		this.addTableButtonHandlers();
	};

	this.import = function() {
		var s = $('#modal-source')[0].value;
		try {
			var obj = JSON.parse(s);
		} catch(e) {
			$('#result')[0].innerHTML = e.message;
			return;
		}

		if (obj === {} || obj === null || typeof(obj) === 'undefined') {
			$('#result')[0].innerHTML = "No timeline data found";
		}

		this.clearTasks();
		if (obj.tasks) {
			for (var i = 0; i < obj.tasks.length; i++) {
				var task = obj.tasks[i]
				var counter = this.addRow(false);

				$('#datepicker-start-' + counter).datepicker('update', task.start);
				
				var ongoing = (task.end === "-");
				$('#datepicker-end-' + counter).datepicker('update', (ongoing) ? "" : task.end);
				$('#datepicker-end-' + counter + '-ongoing').prop('checked', ongoing);
				$('#label-' + counter).val(task.label);
			}
		}
		if (obj.settings) {
			var settings = obj.settings
			var ongoing = (settings.end === "-");
			$('#datepicker-end').datepicker('update', (ongoing) ? "" : settings.end);
			$('#datepicker-end-ongoing').prop('checked', ongoing);
			$('#zoom-input').val(settings.zoom);
			$('#hide-days-from-input').val(settings.hideDaysFrom);
			$('#hide-weeks-from-input').val(settings.hideWeeksFrom);
		}
		if (obj.theme) {
			var theme = obj.theme;
			$('#color-scheme-select').val(theme.colorScheme);
			$('#color-picker-border-1').colorpicker('setValue', theme.borderColor1);
			$('#color-picker-fill-1').colorpicker('setValue', theme.fillColor1);
			$('#color-picker-border-2').colorpicker('setValue', theme.borderColor2);
			$('#color-picker-fill-2').colorpicker('setValue', theme.fillColor2);
		}
	};

	this.clearTasks = function() {
		$('#task-table-body')[0].innerHTML = '';
	};
};

function mainFunc() {
  var app = new App();
  app.init();
}

window.onload = mainFunc;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiXSwibmFtZXMiOlsibWFpbkZ1bmMiLCJhcHAiLCJBcHAiLCJpbml0IiwidGhpcyIsImNvdW50ZXIiLCJzZWxmIiwiYWRkUm93IiwiJCIsIm9uIiwicG9zdCIsImNvbG9ycGlja2VyIiwiZm9ybWF0IiwiZGF0ZXBpY2tlciIsImNzcyIsImRpc3BsYXkiLCJpbXBvcnQiLCJhZGRUYWJsZUJ1dHRvbkhhbmRsZXJzIiwiY2xpcGJvYXJkIiwiQ2xpcGJvYXJkIiwiZSIsImZvY3VzIiwiYXJyIiwiaSIsImxlbmd0aCIsInVuYmluZCIsInVwIiwiaWQiLCJkb3duIiwiZGVsZXRlIiwic2V0Rm9jdXMiLCJhcHBlbmQiLCJzZXJpYWxpemUiLCJvYmoiLCJzZXR0aW5ncyIsInRhc2tzIiwidGhlbWUiLCJmcmFtZUJvcmRlckNvbG9yIiwiZnJhbWVGaWxsQ29sb3IiLCJzdHJpcGVDb2xvckRhcmsiLCJzdHJpcGVDb2xvckxpZ2h0IiwiZ3JpZENvbG9yIiwidGFzayIsImlkTnVtIiwicmVwbGFjZSIsInN0YXJ0RGF0ZSIsImVuZERhdGUiLCJlbmREYXRlT25nb2luZyIsInByb3AiLCJsYWJlbCIsInZhbCIsInRhc2tPYmoiLCJzdGFydCIsImVuZCIsInB1c2giLCJzZXR0aW5nRW5kRGF0ZU9uZ29pbmciLCJ6b29tVmFsIiwiTnVtYmVyIiwiem9vbSIsImhpZGVEYXlzRnJvbVZhbCIsImhpZGVEYXlzRnJvbSIsImhpZGVEYXlzRnJvVmFsIiwiaGlkZVdlZWtzRnJvbVZhbCIsImhpZGVXZWVrc0Zyb20iLCJjb2xvclNjaGVtZVZhbCIsImNvbG9yU2NoZW1lIiwiYm9yZGVyQ29sb3IxIiwiZmlsbENvbG9yMSIsImJvcmRlckNvbG9yMiIsImZpbGxDb2xvcjIiLCJKU09OIiwic3RyaW5naWZ5IiwianNvbiIsImRhdGEiLCJodG1sIiwidmFsdWUiLCJyb3dJZCIsInByZXYiLCJiZWZvcmUiLCJuZXh0IiwiYWZ0ZXIiLCJyZW1vdmUiLCJzIiwicGFyc2UiLCJpbm5l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QUFBLEdBQUFxQixFQUFBbUIsS0FDQTdDLEVBQUEsMkJBQUF3QyxLQUFBLFVBQUF1QyxHQUNBL0UsRUFBQSxlQUFBMEMsSUFBQWhCLEVBQUF3QixNQUNBbEQsRUFBQSx5QkFBQTBDLElBQUFoQixFQUFBMEIsY0FDQXBELEVBQUEsMEJBQUEwQyxJQUFBaEIsRUFBQTZCLGVBRUEsR0FBQTlCLEVBQUFHLE1BQUEsQ0FDQSxHQUFBQSxHQUFBSCxFQUFBRyxLQUNBNUIsR0FBQSx3QkFBQTBDLElBQUFkLEVBQUE2QixhQUNBekQsRUFBQSwwQkFBQUcsWUFBQSxXQUFBeUIsRUFBQThCLGNBQ0ExRCxFQUFBLHdCQUFBRyxZQUFBLFdBQUF5QixFQUFBK0IsWUFDQTNELEVBQUEsMEJBQUFHLFlBQUEsV0FBQXlCLEVBQUFnQyxjQUNBNUQsRUFBQSx3QkFBQUcsWUFBQSxXQUFBeUIsRUFBQWlDLGNBSUFqRSxLQUFBa0YsV0FBQSxXQUNBOUUsRUFBQSxvQkFBQSxHQUFBNEUsVUFBQSxJQVNBSSxRQUFBQyxPQUFBekYiLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsidmFyIEFwcCA9IGZ1bmN0aW9uKCkge1xuXHR0aGlzLmNvdW50ZXIgPSAwO1xuXHR0aGlzLmluaXQgPSBmdW5jdGlvbigpIHtcblx0XHR2YXIgc2VsZiA9IHRoaXM7XG5cdFx0dGhpcy5hZGRSb3coZmFsc2UpO1xuXHRcdCQoJyNhZGQtdGFzay1idXR0b24nKS5vbignY2xpY2snLCBmdW5jdGlvbigpIHtcblx0XHRcdHNlbGYuYWRkUm93KHRydWUpO1xuXHRcdH0pO1xuXHRcdCQoJyNzaG93LXRpbWVsaW5lLWJ1dHRvbicpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCkge1xuXHRcdFx0c2VsZi5wb3N0KCk7XG5cdFx0fSk7XG5cdFx0JCgnI2NvbG9yLXBpY2tlci1ib3JkZXItMSwjY29sb3ItcGlja2VyLWZpbGwtMScpLmNvbG9ycGlja2VyKHtcImZvcm1hdFwiOiBcImhleFwifSk7XG5cdFx0JCgnI2NvbG9yLXBpY2tlci1ib3JkZXItMiwjY29sb3ItcGlja2VyLWZpbGwtMicpLmNvbG9ycGlja2VyKHtcImZvcm1hdFwiOiBcImhleFwifSk7XG5cdFx0JCgnI2RhdGVwaWNrZXItZW5kJykuZGF0ZXBpY2tlcih7Zm9ybWF0OiBcInl5eXktbW0tZGRcIn0pO1xuXHRcdCQoJyNzb3VyY2UtZGl2JykuY3NzKHtcImRpc3BsYXlcIjogXCJub25lXCJ9KTtcblx0XHQkKCcjbW9kYWwtYWN0aW9uLWJ1dHRvbicpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCkge1xuXHRcdFx0c2VsZi5pbXBvcnQoKTtcblx0XHR9KTtcblx0XHR0aGlzLmFkZFRhYmxlQnV0dG9uSGFuZGxlcnMoKTtcblxuXHRcdHRoaXMuY2xpcGJvYXJkID0gbmV3IENsaXBib2FyZCgnI2NvcHktYnV0dG9uJyk7XG5cdFx0dGhpcy5jbGlwYm9hcmQub24oJ2Vycm9yJywgZnVuY3Rpb24oZSkge1xuXHRcdFx0Ly9UT0RPOiBDdHJsK0MgbWVzc2FnZSBmYWxsYmFja1xuXHRcdH0pO1xuXG5cdFx0Ly9rZXlib2FyZCBmb2N1cyBvbiB0ZXh0YXJlYSBmb3IgcXVpY2sgcGFzdGUgYWN0aW9uXG5cdFx0Ly9ub3QgYWxsb3dlZCB0byByZWFkIGZyb20gY2xpcGJvYXJkXG5cdFx0JCgnI2ltcG9ydC1tb2RhbCcpLm9uKCdzaG93bi5icy5tb2RhbCcsIGZ1bmN0aW9uKCkge1xuXHRcdFx0JCgnI21vZGFsLXNvdXJjZScpLmZvY3VzKCk7XG5cdFx0fSk7XG5cdH07XG5cblx0dGhpcy5hZGRUYWJsZUJ1dHRvbkhhbmRsZXJzID0gZnVuY3Rpb24oKSB7XG5cdFx0dmFyIHNlbGYgPSB0aGlzO1xuXHRcdHZhciBhcnIgPSBbJ3VwLWJ1dHRvbicsICdkb3duLWJ1dHRvbicsICdkZWxldGUtYnV0dG9uJ107XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBhcnIubGVuZ3RoOyBpKyspIHtcblx0XHRcdCQoJy4nICsgYXJyW2ldKS51bmJpbmQoJ2NsaWNrJyk7XG5cdFx0fVxuXHRcdCQoJy51cC1idXR0b24nKS5vbignY2xpY2snLCBmdW5jdGlvbigpIHtcblx0XHRcdHNlbGYudXAodGhpcy5pZCk7XG5cdFx0fSk7XG5cdFx0JCgnLmRvd24tYnV0dG9uJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKSB7XG5cdFx0XHRzZWxmLmRvd24odGhpcy5pZCk7XG5cdFx0fSk7XG5cdFx0JCgnLmRlbGV0ZS1idXR0b24nKS5vbignY2xpY2snLCBmdW5jdGlvbigpIHtcblx0XHRcdHNlbGYuZGVsZXRlKHRoaXMuaWQpO1xuXHRcdH0pO1xuXHR9O1xuXG5cdHRoaXMuYWRkUm93ID0gZnVuY3Rpb24oc2V0Rm9jdXMpIHtcblx0XHR0aGlzLmNvdW50ZXIrKztcblx0XHQkKCcjdGFzay10YWJsZS1ib2R5JykuYXBwZW5kKFxuXHRcdFx0Jzx0ciBjbGFzcz1cInRhc2tcIiBpZD1cInRhc2stJyArIHRoaXMuY291bnRlciArICdcIj4nICtcblx0XHRcdCc8dGQ+PGRpdiBjbGFzcz1cImlucHV0LWFwcGVuZCBkYXRlXCI+PGlucHV0IGNsYXNzPVwiZm9ybS1jb250cm9sXCIgaWQ9XCJkYXRlcGlja2VyLXN0YXJ0LScgKyB0aGlzLmNvdW50ZXIgKyAnXCIgc2l6ZT1cIjE2XCIgdHlwZT1cInRleHRcIiByZWFkb25seT48c3BhbiBjbGFzcz1cImFkZC1vblwiPjxpIGNsYXNzPVwiaWNvbi10aFwiPjwvaT48L3NwYW4+PC9kaXY+PC90ZD4nICtcblx0XHRcdCc8dGQ+PGRpdiBjbGFzcz1cImlucHV0LWFwcGVuZCBkYXRlXCI+PGlucHV0IGNsYXNzPVwiZm9ybS1jb250cm9sXCIgaWQ9XCJkYXRlcGlja2VyLWVuZC0nICsgdGhpcy5jb3VudGVyICsgJ1wiIHNpemU9XCIxNlwiIHR5cGU9XCJ0ZXh0XCIgcmVhZG9ubHk+PHNwYW4gY2xhc3M9XCJhZGQtb25cIj48aSBjbGFzcz1cImljb24tdGhcIj48L2k+PC9zcGFuPjwvdGQ+JyArXG5cdFx0XHQnPHRkPjxkaXYgY2xhc3M9XCJjaGVja2JveFwiPjxsYWJlbD48aW5wdXQgaWQ9XCJkYXRlcGlja2VyLWVuZC0nICsgdGhpcy5jb3VudGVyICsgJy1vbmdvaW5nXCIgdHlwZT1cImNoZWNrYm94XCI+Jm5ic3A7T25nb2luZzwvbGFiZWw+PC9kaXY+PC90ZD4nICtcblx0XHRcdCc8dGQ+PGlucHV0IGNsYXNzPVwiZm9ybS1jb250cm9sXCIgaWQ9XCJsYWJlbC0nICsgdGhpcy5jb3VudGVyICsgJ1wiIHR5cGU9XCJ0ZXh0XCI+PC90ZD4nICtcblx0XHRcdCc8dGQ+PGJ1dHRvbiBjbGFzcz1cInVwLWJ1dHRvbiBidG4gYnRuLWRlZmF1bHRcIiBpZD1cInVwLWJ1dHRvbi0nICsgdGhpcy5jb3VudGVyICsgJ1wiPiZ1YXJyOzwvYnV0dG9uPjwvdGQ+JyArXG5cdFx0XHQnPHRkPjxidXR0b24gY2xhc3M9XCJkb3duLWJ1dHRvbiBidG4gYnRuLWRlZmF1bHRcIiBpZD1cImRvd24tYnV0dG9uLScgKyB0aGlzLmNvdW50ZXIgKyAnXCI+JmRhcnI7PC9idXR0b24+PC90ZD4nICtcblx0XHRcdCc8dGQ+PGJ1dHRvbiBjbGFzcz1cImRlbGV0ZS1idXR0b24gYnRuIGJ0bi1kZWZhdWx0XCIgaWQ9XCJkZWxldGUtYnV0dG9uLScgKyB0aGlzLmNvdW50ZXIgKyAnXCI+JmNyb3NzOzwvYnV0dG9uPjwvdGQ+JyArXG5cdFx0XHQnPC90cj4nXG5cdFx0KTtcblx0XHQkKCcjZGF0ZXBpY2tlci1zdGFydC0nICsgdGhpcy5jb3VudGVyICsgJywjZGF0ZXBpY2tlci1lbmQtJyArIHRoaXMuY291bnRlcikuZGF0ZXBpY2tlcih7Zm9ybWF0OiBcInl5eXktbW0tZGRcIn0pO1xuXHRcdFxuXHRcdGlmIChzZXRGb2N1cykge1xuXHRcdFx0JCgnI2RhdGVwaWNrZXItc3RhcnQtJyArIHRoaXMuY291bnRlcikuZm9jdXMoKTtcblx0XHR9XG5cblx0XHR0aGlzLmFkZFRhYmxlQnV0dG9uSGFuZGxlcnMoKTtcblxuXHRcdHJldHVybiB0aGlzLmNvdW50ZXI7XG5cdH07XG5cblx0dGhpcy5zZXJpYWxpemUgPSBmdW5jdGlvbigpIHtcblx0XHR2YXIgb2JqID0ge1xuXHRcdFx0XCJzZXR0aW5nc1wiOiB7XG5cblx0XHRcdH0sXG5cdFx0XHRcInRhc2tzXCI6IFtdLFxuXHRcdFx0XCJ0aGVtZVwiOiB7XG5cdFx0XHQgICAgXCJmcmFtZUJvcmRlckNvbG9yXCI6IFwiI2ZmZmZmZlwiLFxuXHRcdFx0ICAgIFwiZnJhbWVGaWxsQ29sb3JcIjogXCIjODg4ODg4XCIsXG5cdFx0XHQgICAgXCJzdHJpcGVDb2xvckRhcmtcIjogXCIjZGRkZGRkXCIsXG5cdFx0XHQgICAgXCJzdHJpcGVDb2xvckxpZ2h0XCI6IFwiI2VlZWVlZVwiLFxuXHRcdFx0ICAgIFwiZ3JpZENvbG9yXCI6IFwiIzk5OTk5OVwiXG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdC8vdGFza3Ncblx0XHR2YXIgdGFza3MgPSAkKCcudGFzaycpO1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdGFza3MubGVuZ3RoOyBpKyspIHtcblx0XHRcdHZhciB0YXNrID0gdGFza3NbaV07XG5cdFx0XHR2YXIgaWQgPSB0YXNrLmlkO1xuXHRcdFx0dmFyIGlkTnVtID0gaWQucmVwbGFjZSgvXnRhc2stLywgXCJcIik7XG5cblx0XHRcdHZhciBzdGFydERhdGUgPSAkKCcjZGF0ZXBpY2tlci1zdGFydC0nICsgaWROdW0pLmRhdGVwaWNrZXIoXCJnZXRGb3JtYXR0ZWREYXRlXCIpO1xuXHRcdFx0dmFyIGVuZERhdGUgPSAkKCcjZGF0ZXBpY2tlci1lbmQtJyArIGlkTnVtKS5kYXRlcGlja2VyKFwiZ2V0Rm9ybWF0dGVkRGF0ZVwiKTtcblx0XHRcdHZhciBlbmREYXRlT25nb2luZyA9ICQoJyNkYXRlcGlja2VyLWVuZC0nICsgaWROdW0gKyAnLW9uZ29pbmcnKS5wcm9wKCdjaGVja2VkJyk7IFxuXHRcdFx0aWYgKGVuZERhdGVPbmdvaW5nKSB7XG5cdFx0XHRcdGVuZERhdGUgPSBcIi1cIjtcblx0XHRcdH1cblx0XHRcdHZhciBsYWJlbCA9ICQoJyNsYWJlbC0nICsgaWROdW0pLnZhbCgpO1xuXG5cdFx0XHR2YXIgdGFza09iaiA9IHt9O1xuXHRcdFx0dGFza09iai5zdGFydCA9IHN0YXJ0RGF0ZTtcblx0XHRcdHRhc2tPYmoubGFiZWwgPSBsYWJlbDtcblxuICAgICAgLy9lbmQgaXMgb3B0aW9uYWwgLSBub3Qgc3VwcGx5aW5nIGVuZCBpcyBwZXJmZWN0bHkgdmFsaWRcbiAgICAgIC8vLSBzaWduaWZpZXMgJ3RvZGF5JyBzbyB0cmVhdGluZyAnYmxhbmsnIGFzIHNpZ25pZmljYW50IGlzIGhlbHBmdWwgaGVyZVxuICAgICAgaWYgKGVuZERhdGUubGVuZ3RoID4gMCkge1xuXHRcdFx0ICB0YXNrT2JqLmVuZCA9IGVuZERhdGU7XG4gICAgICB9XG5cblx0XHRcdG9iai50YXNrcy5wdXNoKHRhc2tPYmopO1xuXHRcdH1cblxuXHRcdC8vc2V0dGluZ3MgLSBlbmZvcmNlIHNhbmUgdmFsdWVzXG4gICAgLy9UT0RPOiB1c2Ugc2NoZW1hIGxpbWl0c1xuXHRcdG9iai5zZXR0aW5ncy5lbmQgPSAkKCcjZGF0ZXBpY2tlci1lbmQnKS5kYXRlcGlja2VyKFwiZ2V0Rm9ybWF0dGVkRGF0ZVwiKTtcblx0XHR2YXIgc2V0dGluZ0VuZERhdGVPbmdvaW5nID0gJCgnI2RhdGVwaWNrZXItZW5kLW9uZ29pbmcnKS5wcm9wKCdjaGVja2VkJyk7XG5cdFx0aWYgKHNldHRpbmdFbmREYXRlT25nb2luZykge1xuXHRcdFx0b2JqLnNldHRpbmdzLmVuZCA9IFwiLVwiO1xuXHRcdH1cbiAgICB2YXIgem9vbVZhbCA9IE51bWJlcigkKCcjem9vbS1pbnB1dCcpLnZhbCgpKTtcbiAgICBvYmouc2V0dGluZ3Muem9vbSA9ICh6b29tVmFsID49IDUwICYmIHpvb21WYWwgPD0gMzAwKSA/IHpvb21WYWwgOiAxNTA7XG4gICAgdmFyIGhpZGVEYXlzRnJvbVZhbCA9IE51bWJlcigkKCcjaGlkZS1kYXlzLWZyb20taW5wdXQnKS52YWwoKSk7XG4gICAgb2JqLnNldHRpbmdzLmhpZGVEYXlzRnJvbSA9IChoaWRlRGF5c0Zyb21WYWwgPj0gMSAmJiBoaWRlRGF5c0Zyb21WYWwgPD0gMzY1KSA/IGhpZGVEYXlzRnJvVmFsIDogOTA7XG5cdFx0dmFyIGhpZGVXZWVrc0Zyb21WYWwgPSBOdW1iZXIoJCgnI2hpZGUtd2Vla3MtZnJvbS1pbnB1dCcpLnZhbCgpKTtcblx0XHRvYmouc2V0dGluZ3MuaGlkZVdlZWtzRnJvbSA9IChoaWRlV2Vla3NGcm9tVmFsID49IDEgJiYgaGlkZVdlZWtzRnJvbVZhbCA8PSAxNDYwKSA/IGhpZGVXZWVrc0Zyb21WYWwgOiAxODA7XG5cdFx0XG5cdFx0Ly90aGVtZVxuXHRcdHZhciBjb2xvclNjaGVtZVZhbCA9ICQoJyNjb2xvci1zY2hlbWUtc2VsZWN0JykudmFsKCk7XG4gICAgb2JqLnRoZW1lLmNvbG9yU2NoZW1lID0gKGNvbG9yU2NoZW1lVmFsLmxlbmd0aCA+IDApID8gY29sb3JTY2hlbWVWYWwgOiBcImdyYWRpZW50XCI7XG5cdFx0b2JqLnRoZW1lLmJvcmRlckNvbG9yMSA9ICQoJyNjb2xvci1waWNrZXItYm9yZGVyLTEnKS5jb2xvcnBpY2tlcignZ2V0VmFsdWUnLCAnI2ZmZmZmZicpO1xuXHRcdG9iai50aGVtZS5maWxsQ29sb3IxID0gJCgnI2NvbG9yLXBpY2tlci1maWxsLTEnKS5jb2xvcnBpY2tlcignZ2V0VmFsdWUnLCAnI2ZmZmZmZicpO1xuXHRcdG9iai50aGVtZS5ib3JkZXJDb2xvcjIgPSAkKCcjY29sb3ItcGlja2VyLWJvcmRlci0yJykuY29sb3JwaWNrZXIoJ2dldFZhbHVlJywgJyNmZmZmZmYnKTtcblx0XHRvYmoudGhlbWUuZmlsbENvbG9yMiA9ICQoJyNjb2xvci1waWNrZXItZmlsbC0yJykuY29sb3JwaWNrZXIoJ2dldFZhbHVlJywgJyNmZmZmZmYnKTtcblxuXHQgIHJldHVybiBKU09OLnN0cmluZ2lmeShvYmopO1xuXHR9XG5cblx0dGhpcy5wb3N0ID0gZnVuY3Rpb24oKSB7XG5cdFx0dmFyIGpzb24gPSB0aGlzLnNlcmlhbGl6ZSgpO1xuXHRcdCQucG9zdChcblx0XHRcdFwiL3RpbWVsaW5lXCIsXG5cdFx0XHRqc29uLFxuXHRcdFx0ZnVuY3Rpb24oZGF0YSkge1xuICBcdFx0XHRcdCQoXCIjcmVzdWx0XCIpLmh0bWwoZGF0YSk7XG4gIFx0XHRcdFx0XG4gIFx0XHRcdFx0aWYgKGpzb24ubGVuZ3RoID09PSAwKSB7XG4gIFx0XHRcdFx0XHQkKCcjc291cmNlLWRpdicpLmNzcyh7XCJkaXNwbGF5XCI6IFwibm9uZVwifSk7XG4gIFx0XHRcdFx0XHRyZXR1cm47XG4gIFx0XHRcdFx0fVxuICBcdFx0XHRcdCQoXCIjc291cmNlLWRpdlwiKS5jc3Moe1wiZGlzcGxheVwiOiBcImJsb2NrXCJ9KTtcbiAgXHRcdFx0XHQkKFwiI3NvdXJjZVwiKVswXS52YWx1ZSA9IGpzb247XG4gIFx0XHRcdH1cbiAgXHRcdCk7XG5cdH07XG5cblx0dGhpcy51cCA9IGZ1bmN0aW9uKGlkKSB7XG5cdFx0dmFyIHJvd0lkID0gaWQucmVwbGFjZSgvXnVwLWJ1dHRvbi8sICcjdGFzaycpO1xuXHRcdCQocm93SWQpLnByZXYoKS5iZWZvcmUoJChyb3dJZCkpO1xuXHRcdHRoaXMuYWRkVGFibGVCdXR0b25IYW5kbGVycygpO1xuXHR9O1xuXG5cdHRoaXMuZG93biA9IGZ1bmN0aW9uKGlkKSB7XG5cdFx0dmFyIHJvd0lkID0gaWQucmVwbGFjZSgvXmRvd24tYnV0dG9uLywgJyN0YXNrJyk7XG5cdFx0JChyb3dJZCkubmV4dCgpLmFmdGVyKCQocm93SWQpKTtcblx0XHR0aGlzLmFkZFRhYmxlQnV0dG9uSGFuZGxlcnMoKTtcblx0fTtcblxuXHR0aGlzLmRlbGV0ZSA9IGZ1bmN0aW9uKGlkKSB7XG5cdFx0dmFyIHJvd0lkID0gaWQucmVwbGFjZSgvXmRlbGV0ZS1idXR0b24vLCAnI3Rhc2snKTtcblx0XHQkKHJvd0lkKS5yZW1vdmUoKTtcblx0XHR0aGlzLmFkZFRhYmxlQnV0dG9uSGFuZGxlcnMoKTtcblx0fTtcblxuXHR0aGlzLmltcG9ydCA9IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBzID0gJCgnI21vZGFsLXNvdXJjZScpWzBdLnZhbHVlO1xuXHRcdHRyeSB7XG5cdFx0XHR2YXIgb2JqID0gSlNPTi5wYXJzZShzKTtcblx0XHR9IGNhdGNoKGUpIHtcblx0XHRcdCQoJyNyZXN1bHQnKVswXS5pbm5lckhUTUwgPSBlLm1lc3NhZ2U7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0aWYgKG9iaiA9PT0ge30gfHwgb2JqID09PSBudWxsIHx8IHR5cGVvZihvYmopID09PSAndW5kZWZpbmVkJykge1xuXHRcdFx0JCgnI3Jlc3VsdCcpWzBdLmlubmVySFRNTCA9IFwiTm8gdGltZWxpbmUgZGF0YSBmb3VuZFwiO1xuXHRcdH1cblxuXHRcdHRoaXMuY2xlYXJUYXNrcygpO1xuXHRcdGlmIChvYmoudGFza3MpIHtcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgb2JqLnRhc2tzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdHZhciB0YXNrID0gb2JqLnRhc2tzW2ldXG5cdFx0XHRcdHZhciBjb3VudGVyID0gdGhpcy5hZGRSb3coZmFsc2UpO1xuXG5cdFx0XHRcdCQoJyNkYXRlcGlja2VyLXN0YXJ0LScgKyBjb3VudGVyKS5kYXRlcGlja2VyKCd1cGRhdGUnLCB0YXNrLnN0YXJ0KTtcblx0XHRcdFx0XG5cdFx0XHRcdHZhciBvbmdvaW5nID0gKHRhc2suZW5kID09PSBcIi1cIik7XG5cdFx0XHRcdCQoJyNkYXRlcGlja2VyLWVuZC0nICsgY291bnRlcikuZGF0ZXBpY2tlcigndXBkYXRlJywgKG9uZ29pbmcpID8gXCJcIiA6IHRhc2suZW5kKTtcblx0XHRcdFx0JCgnI2RhdGVwaWNrZXItZW5kLScgKyBjb3VudGVyICsgJy1vbmdvaW5nJykucHJvcCgnY2hlY2tlZCcsIG9uZ29pbmcpO1xuXHRcdFx0XHQkKCcjbGFiZWwtJyArIGNvdW50ZXIpLnZhbCh0YXNrLmxhYmVsKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0aWYgKG9iai5zZXR0aW5ncykge1xuXHRcdFx0dmFyIHNldHRpbmdzID0gb2JqLnNldHRpbmdzXG5cdFx0XHR2YXIgb25nb2luZyA9IChzZXR0aW5ncy5lbmQgPT09IFwiLVwiKTtcblx0XHRcdCQoJyNkYXRlcGlja2VyLWVuZCcpLmRhdGVwaWNrZXIoJ3VwZGF0ZScsIChvbmdvaW5nKSA/IFwiXCIgOiBzZXR0aW5ncy5lbmQpO1xuXHRcdFx0JCgnI2RhdGVwaWNrZXItZW5kLW9uZ29pbmcnKS5wcm9wKCdjaGVja2VkJywgb25nb2luZyk7XG5cdFx0XHQkKCcjem9vbS1pbnB1dCcpLnZhbChzZXR0aW5ncy56b29tKTtcblx0XHRcdCQoJyNoaWRlLWRheXMtZnJvbS1pbnB1dCcpLnZhbChzZXR0aW5ncy5oaWRlRGF5c0Zyb20pO1xuXHRcdFx0JCgnI2hpZGUtd2Vla3MtZnJvbS1pbnB1dCcpLnZhbChzZXR0aW5ncy5oaWRlV2Vla3NGcm9tKTtcblx0XHR9XG5cdFx0aWYgKG9iai50aGVtZSkge1xuXHRcdFx0dmFyIHRoZW1lID0gb2JqLnRoZW1lO1xuXHRcdFx0JCgnI2NvbG9yLXNjaGVtZS1zZWxlY3QnKS52YWwodGhlbWUuY29sb3JTY2hlbWUpO1xuXHRcdFx0JCgnI2NvbG9yLXBpY2tlci1ib3JkZXItMScpLmNvbG9ycGlja2VyKCdzZXRWYWx1ZScsIHRoZW1lLmJvcmRlckNvbG9yMSk7XG5cdFx0XHQkKCcjY29sb3ItcGlja2VyLWZpbGwtMScpLmNvbG9ycGlja2VyKCdzZXRWYWx1ZScsIHRoZW1lLmZpbGxDb2xvcjEpO1xuXHRcdFx0JCgnI2NvbG9yLXBpY2tlci1ib3JkZXItMicpLmNvbG9ycGlja2VyKCdzZXRWYWx1ZScsIHRoZW1lLmJvcmRlckNvbG9yMik7XG5cdFx0XHQkKCcjY29sb3ItcGlja2VyLWZpbGwtMicpLmNvbG9ycGlja2VyKCdzZXRWYWx1ZScsIHRoZW1lLmZpbGxDb2xvcjIpO1xuXHRcdH1cblx0fTtcblxuXHR0aGlzLmNsZWFyVGFza3MgPSBmdW5jdGlvbigpIHtcblx0XHQkKCcjdGFzay10YWJsZS1ib2R5JylbMF0uaW5uZXJIVE1MID0gJyc7XG5cdH07XG59O1xuXG5mdW5jdGlvbiBtYWluRnVuYygpIHtcbiAgdmFyIGFwcCA9IG5ldyBBcHAoKTtcbiAgYXBwLmluaXQoKTtcbn1cblxud2luZG93Lm9ubG9hZCA9IG1haW5GdW5jO1xuIl19
