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
			taskObj.end = endDate;
			taskObj.label = label;

			obj.tasks.push(taskObj);
		}

		//settings
		obj.settings.end = $('#datepicker-end').datepicker("getFormattedDate");
		var settingEndDateOngoing = $('#datepicker-end-ongoing').prop('checked');
		if (settingEndDateOngoing) {
			obj.settings.end = "-";
		}
		obj.settings.zoom = Number($('#zoom-input').val());
		obj.settings.hideDaysFrom = Number($('#hide-days-from-input').val());
		obj.settings.hideWeeksFrom = Number($('#hide-weeks-from-input').val());
		
		//theme
		obj.theme.colorScheme = $('#color-scheme-select').val();
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiXSwibmFtZXMiOlsibWFpbkZ1bmMiLCJhcHAiLCJBcHAiLCJpbml0IiwidGhpcyIsImNvdW50ZXIiLCJzZWxmIiwiYWRkUm93IiwiJCIsIm9uIiwicG9zdCIsImNvbG9ycGlja2VyIiwiZm9ybWF0IiwiZGF0ZXBpY2tlciIsImNzcyIsImRpc3BsYXkiLCJpbXBvcnQiLCJhZGRUYWJsZUJ1dHRvbkhhbmRsZXJzIiwiY2xpcGJvYXJkIiwiQ2xpcGJvYXJkIiwiZSIsImZvY3VzIiwiYXJyIiwiaSIsImxlbmd0aCIsInVuYmluZCIsInVwIiwiaWQiLCJkb3duIiwiZGVsZXRlIiwic2V0Rm9jdXMiLCJhcHBlbmQiLCJzZXJpYWxpemUiLCJvYmoiLCJzZXR0aW5ncyIsInRhc2tzIiwidGhlbWUiLCJmcmFtZUJvcmRlckNvbG9yIiwiZnJhbWVGaWxsQ29sb3IiLCJzdHJpcGVDb2xvckRhcmsiLCJzdHJpcGVDb2xvckxpZ2h0IiwiZ3JpZENvbG9yIiwidGFzayIsImlkTnVtIiwicmVwbGFjZSIsInN0YXJ0RGF0ZSIsImVuZERhdGUiLCJlbmREYXRlT25nb2luZyIsInByb3AiLCJsYWJlbCIsInZhbCIsInRhc2tPYmoiLCJzdGFydCIsImVuZCIsInB1c2giLCJzZXR0aW5nRW5kRGF0ZU9uZ29pbmciLCJ6b29tIiwiTnVtYmVyIiwiaGlkZURheXNGcm9tIiwiaGlkZVdlZWtzRnJvbSIsImNvbG9yU2NoZW1lIiwiYm9yZGVyQ29sb3IxIiwiZmlsbENvbG9yMSIsImJvcmRlckNvbG9yMiIsImZpbGxDb2xvcjIiLCJKU09OIiwic3RyaW5naWZ5IiwianNvbiIsImRhdGEiLCJodG1sIiwidmFsdWUiLCJyb3dJZCIsInByZXYiLCJiZWZvcmUiLCJuZXh0IiwiYWZ0ZXIiLCJyZW1vdmUiLCJzIiwicGFyc2UiLCJpbm5lckhUTUwiLCJtZXNzYWdlIiwiY2xlYXJUYXNrcyIsIm9uZ29pbmciLCJ3aW5kb3ciLCJvbmxvYWQiXSwibWFwcGluZ3MiOiJBQTBOQSxRQUFB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ckQsRUFBQSx3QkFBQUcsWUFBQSxXQUFBeUIsRUFBQTBCLFlBQ0F0RCxFQUFBLDBCQUFBRyxZQUFBLFdBQUF5QixFQUFBMkIsY0FDQXZELEVBQUEsd0JBQUFHLFlBQUEsV0FBQXlCLEVBQUE0QixjQUlBNUQsS0FBQTZFLFdBQUEsV0FDQXpFLEVBQUEsb0JBQUEsR0FBQXVFLFVBQUEsSUFTQUksUUFBQUMsT0FBQXBGIiwiZmlsZSI6ImJ1bmRsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbInZhciBBcHAgPSBmdW5jdGlvbigpIHtcblx0dGhpcy5jb3VudGVyID0gMDtcblx0dGhpcy5pbml0ID0gZnVuY3Rpb24oKSB7XG5cdFx0dmFyIHNlbGYgPSB0aGlzO1xuXHRcdHRoaXMuYWRkUm93KGZhbHNlKTtcblx0XHQkKCcjYWRkLXRhc2stYnV0dG9uJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKSB7XG5cdFx0XHRzZWxmLmFkZFJvdyh0cnVlKTtcblx0XHR9KTtcblx0XHQkKCcjc2hvdy10aW1lbGluZS1idXR0b24nKS5vbignY2xpY2snLCBmdW5jdGlvbigpIHtcblx0XHRcdHNlbGYucG9zdCgpO1xuXHRcdH0pO1xuXHRcdCQoJyNjb2xvci1waWNrZXItYm9yZGVyLTEsI2NvbG9yLXBpY2tlci1maWxsLTEnKS5jb2xvcnBpY2tlcih7XCJmb3JtYXRcIjogXCJoZXhcIn0pO1xuXHRcdCQoJyNjb2xvci1waWNrZXItYm9yZGVyLTIsI2NvbG9yLXBpY2tlci1maWxsLTInKS5jb2xvcnBpY2tlcih7XCJmb3JtYXRcIjogXCJoZXhcIn0pO1xuXHRcdCQoJyNkYXRlcGlja2VyLWVuZCcpLmRhdGVwaWNrZXIoe2Zvcm1hdDogXCJ5eXl5LW1tLWRkXCJ9KTtcblx0XHQkKCcjc291cmNlLWRpdicpLmNzcyh7XCJkaXNwbGF5XCI6IFwibm9uZVwifSk7XG5cdFx0JCgnI21vZGFsLWFjdGlvbi1idXR0b24nKS5vbignY2xpY2snLCBmdW5jdGlvbigpIHtcblx0XHRcdHNlbGYuaW1wb3J0KCk7XG5cdFx0fSk7XG5cdFx0dGhpcy5hZGRUYWJsZUJ1dHRvbkhhbmRsZXJzKCk7XG5cblx0XHR0aGlzLmNsaXBib2FyZCA9IG5ldyBDbGlwYm9hcmQoJyNjb3B5LWJ1dHRvbicpO1xuXHRcdHRoaXMuY2xpcGJvYXJkLm9uKCdlcnJvcicsIGZ1bmN0aW9uKGUpIHtcblx0XHRcdC8vVE9ETzogQ3RybCtDIG1lc3NhZ2UgZmFsbGJhY2tcblx0XHR9KTtcblxuXHRcdC8va2V5Ym9hcmQgZm9jdXMgb24gdGV4dGFyZWEgZm9yIHF1aWNrIHBhc3RlIGFjdGlvblxuXHRcdC8vbm90IGFsbG93ZWQgdG8gcmVhZCBmcm9tIGNsaXBib2FyZFxuXHRcdCQoJyNpbXBvcnQtbW9kYWwnKS5vbignc2hvd24uYnMubW9kYWwnLCBmdW5jdGlvbigpIHtcblx0XHRcdCQoJyNtb2RhbC1zb3VyY2UnKS5mb2N1cygpO1xuXHRcdH0pO1xuXHR9O1xuXG5cdHRoaXMuYWRkVGFibGVCdXR0b25IYW5kbGVycyA9IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBzZWxmID0gdGhpcztcblx0XHR2YXIgYXJyID0gWyd1cC1idXR0b24nLCAnZG93bi1idXR0b24nLCAnZGVsZXRlLWJ1dHRvbiddO1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgYXJyLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHQkKCcuJyArIGFycltpXSkudW5iaW5kKCdjbGljaycpO1xuXHRcdH1cblx0XHQkKCcudXAtYnV0dG9uJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKSB7XG5cdFx0XHRzZWxmLnVwKHRoaXMuaWQpO1xuXHRcdH0pO1xuXHRcdCQoJy5kb3duLWJ1dHRvbicpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCkge1xuXHRcdFx0c2VsZi5kb3duKHRoaXMuaWQpO1xuXHRcdH0pO1xuXHRcdCQoJy5kZWxldGUtYnV0dG9uJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKSB7XG5cdFx0XHRzZWxmLmRlbGV0ZSh0aGlzLmlkKTtcblx0XHR9KTtcblx0fTtcblxuXHR0aGlzLmFkZFJvdyA9IGZ1bmN0aW9uKHNldEZvY3VzKSB7XG5cdFx0dGhpcy5jb3VudGVyKys7XG5cdFx0JCgnI3Rhc2stdGFibGUtYm9keScpLmFwcGVuZChcblx0XHRcdCc8dHIgY2xhc3M9XCJ0YXNrXCIgaWQ9XCJ0YXNrLScgKyB0aGlzLmNvdW50ZXIgKyAnXCI+JyArXG5cdFx0XHQnPHRkPjxkaXYgY2xhc3M9XCJpbnB1dC1hcHBlbmQgZGF0ZVwiPjxpbnB1dCBjbGFzcz1cImZvcm0tY29udHJvbFwiIGlkPVwiZGF0ZXBpY2tlci1zdGFydC0nICsgdGhpcy5jb3VudGVyICsgJ1wiIHNpemU9XCIxNlwiIHR5cGU9XCJ0ZXh0XCIgcmVhZG9ubHk+PHNwYW4gY2xhc3M9XCJhZGQtb25cIj48aSBjbGFzcz1cImljb24tdGhcIj48L2k+PC9zcGFuPjwvZGl2PjwvdGQ+JyArXG5cdFx0XHQnPHRkPjxkaXYgY2xhc3M9XCJpbnB1dC1hcHBlbmQgZGF0ZVwiPjxpbnB1dCBjbGFzcz1cImZvcm0tY29udHJvbFwiIGlkPVwiZGF0ZXBpY2tlci1lbmQtJyArIHRoaXMuY291bnRlciArICdcIiBzaXplPVwiMTZcIiB0eXBlPVwidGV4dFwiIHJlYWRvbmx5PjxzcGFuIGNsYXNzPVwiYWRkLW9uXCI+PGkgY2xhc3M9XCJpY29uLXRoXCI+PC9pPjwvc3Bhbj48L3RkPicgK1xuXHRcdFx0Jzx0ZD48ZGl2IGNsYXNzPVwiY2hlY2tib3hcIj48bGFiZWw+PGlucHV0IGlkPVwiZGF0ZXBpY2tlci1lbmQtJyArIHRoaXMuY291bnRlciArICctb25nb2luZ1wiIHR5cGU9XCJjaGVja2JveFwiPiZuYnNwO09uZ29pbmc8L2xhYmVsPjwvZGl2PjwvdGQ+JyArXG5cdFx0XHQnPHRkPjxpbnB1dCBjbGFzcz1cImZvcm0tY29udHJvbFwiIGlkPVwibGFiZWwtJyArIHRoaXMuY291bnRlciArICdcIiB0eXBlPVwidGV4dFwiPjwvdGQ+JyArXG5cdFx0XHQnPHRkPjxidXR0b24gY2xhc3M9XCJ1cC1idXR0b24gYnRuIGJ0bi1kZWZhdWx0XCIgaWQ9XCJ1cC1idXR0b24tJyArIHRoaXMuY291bnRlciArICdcIj4mdWFycjs8L2J1dHRvbj48L3RkPicgK1xuXHRcdFx0Jzx0ZD48YnV0dG9uIGNsYXNzPVwiZG93bi1idXR0b24gYnRuIGJ0bi1kZWZhdWx0XCIgaWQ9XCJkb3duLWJ1dHRvbi0nICsgdGhpcy5jb3VudGVyICsgJ1wiPiZkYXJyOzwvYnV0dG9uPjwvdGQ+JyArXG5cdFx0XHQnPHRkPjxidXR0b24gY2xhc3M9XCJkZWxldGUtYnV0dG9uIGJ0biBidG4tZGVmYXVsdFwiIGlkPVwiZGVsZXRlLWJ1dHRvbi0nICsgdGhpcy5jb3VudGVyICsgJ1wiPiZjcm9zczs8L2J1dHRvbj48L3RkPicgK1xuXHRcdFx0JzwvdHI+J1xuXHRcdCk7XG5cdFx0JCgnI2RhdGVwaWNrZXItc3RhcnQtJyArIHRoaXMuY291bnRlciArICcsI2RhdGVwaWNrZXItZW5kLScgKyB0aGlzLmNvdW50ZXIpLmRhdGVwaWNrZXIoe2Zvcm1hdDogXCJ5eXl5LW1tLWRkXCJ9KTtcblx0XHRcblx0XHRpZiAoc2V0Rm9jdXMpIHtcblx0XHRcdCQoJyNkYXRlcGlja2VyLXN0YXJ0LScgKyB0aGlzLmNvdW50ZXIpLmZvY3VzKCk7XG5cdFx0fVxuXG5cdFx0dGhpcy5hZGRUYWJsZUJ1dHRvbkhhbmRsZXJzKCk7XG5cblx0XHRyZXR1cm4gdGhpcy5jb3VudGVyO1xuXHR9O1xuXG5cdHRoaXMuc2VyaWFsaXplID0gZnVuY3Rpb24oKSB7XG5cdFx0dmFyIG9iaiA9IHtcblx0XHRcdFwic2V0dGluZ3NcIjoge1xuXG5cdFx0XHR9LFxuXHRcdFx0XCJ0YXNrc1wiOiBbXSxcblx0XHRcdFwidGhlbWVcIjoge1xuXHRcdFx0ICAgIFwiZnJhbWVCb3JkZXJDb2xvclwiOiBcIiNmZmZmZmZcIixcblx0XHRcdCAgICBcImZyYW1lRmlsbENvbG9yXCI6IFwiIzg4ODg4OFwiLFxuXHRcdFx0ICAgIFwic3RyaXBlQ29sb3JEYXJrXCI6IFwiI2RkZGRkZFwiLFxuXHRcdFx0ICAgIFwic3RyaXBlQ29sb3JMaWdodFwiOiBcIiNlZWVlZWVcIixcblx0XHRcdCAgICBcImdyaWRDb2xvclwiOiBcIiM5OTk5OTlcIlxuXHRcdFx0fVxuXHRcdH07XG5cblx0XHQvL3Rhc2tzXG5cdFx0dmFyIHRhc2tzID0gJCgnLnRhc2snKTtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHRhc2tzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHR2YXIgdGFzayA9IHRhc2tzW2ldO1xuXHRcdFx0dmFyIGlkID0gdGFzay5pZDtcblx0XHRcdHZhciBpZE51bSA9IGlkLnJlcGxhY2UoL150YXNrLS8sIFwiXCIpO1xuXG5cdFx0XHR2YXIgc3RhcnREYXRlID0gJCgnI2RhdGVwaWNrZXItc3RhcnQtJyArIGlkTnVtKS5kYXRlcGlja2VyKFwiZ2V0Rm9ybWF0dGVkRGF0ZVwiKTtcblx0XHRcdHZhciBlbmREYXRlID0gJCgnI2RhdGVwaWNrZXItZW5kLScgKyBpZE51bSkuZGF0ZXBpY2tlcihcImdldEZvcm1hdHRlZERhdGVcIik7XG5cdFx0XHR2YXIgZW5kRGF0ZU9uZ29pbmcgPSAkKCcjZGF0ZXBpY2tlci1lbmQtJyArIGlkTnVtICsgJy1vbmdvaW5nJykucHJvcCgnY2hlY2tlZCcpOyBcblx0XHRcdGlmIChlbmREYXRlT25nb2luZykge1xuXHRcdFx0XHRlbmREYXRlID0gXCItXCI7XG5cdFx0XHR9XG5cdFx0XHR2YXIgbGFiZWwgPSAkKCcjbGFiZWwtJyArIGlkTnVtKS52YWwoKTtcblxuXHRcdFx0dmFyIHRhc2tPYmogPSB7fTtcblx0XHRcdHRhc2tPYmouc3RhcnQgPSBzdGFydERhdGU7XG5cdFx0XHR0YXNrT2JqLmVuZCA9IGVuZERhdGU7XG5cdFx0XHR0YXNrT2JqLmxhYmVsID0gbGFiZWw7XG5cblx0XHRcdG9iai50YXNrcy5wdXNoKHRhc2tPYmopO1xuXHRcdH1cblxuXHRcdC8vc2V0dGluZ3Ncblx0XHRvYmouc2V0dGluZ3MuZW5kID0gJCgnI2RhdGVwaWNrZXItZW5kJykuZGF0ZXBpY2tlcihcImdldEZvcm1hdHRlZERhdGVcIik7XG5cdFx0dmFyIHNldHRpbmdFbmREYXRlT25nb2luZyA9ICQoJyNkYXRlcGlja2VyLWVuZC1vbmdvaW5nJykucHJvcCgnY2hlY2tlZCcpO1xuXHRcdGlmIChzZXR0aW5nRW5kRGF0ZU9uZ29pbmcpIHtcblx0XHRcdG9iai5zZXR0aW5ncy5lbmQgPSBcIi1cIjtcblx0XHR9XG5cdFx0b2JqLnNldHRpbmdzLnpvb20gPSBOdW1iZXIoJCgnI3pvb20taW5wdXQnKS52YWwoKSk7XG5cdFx0b2JqLnNldHRpbmdzLmhpZGVEYXlzRnJvbSA9IE51bWJlcigkKCcjaGlkZS1kYXlzLWZyb20taW5wdXQnKS52YWwoKSk7XG5cdFx0b2JqLnNldHRpbmdzLmhpZGVXZWVrc0Zyb20gPSBOdW1iZXIoJCgnI2hpZGUtd2Vla3MtZnJvbS1pbnB1dCcpLnZhbCgpKTtcblx0XHRcblx0XHQvL3RoZW1lXG5cdFx0b2JqLnRoZW1lLmNvbG9yU2NoZW1lID0gJCgnI2NvbG9yLXNjaGVtZS1zZWxlY3QnKS52YWwoKTtcblx0XHRvYmoudGhlbWUuYm9yZGVyQ29sb3IxID0gJCgnI2NvbG9yLXBpY2tlci1ib3JkZXItMScpLmNvbG9ycGlja2VyKCdnZXRWYWx1ZScsICcjZmZmZmZmJyk7XG5cdFx0b2JqLnRoZW1lLmZpbGxDb2xvcjEgPSAkKCcjY29sb3ItcGlja2VyLWZpbGwtMScpLmNvbG9ycGlja2VyKCdnZXRWYWx1ZScsICcjZmZmZmZmJyk7XG5cdFx0b2JqLnRoZW1lLmJvcmRlckNvbG9yMiA9ICQoJyNjb2xvci1waWNrZXItYm9yZGVyLTInKS5jb2xvcnBpY2tlcignZ2V0VmFsdWUnLCAnI2ZmZmZmZicpO1xuXHRcdG9iai50aGVtZS5maWxsQ29sb3IyID0gJCgnI2NvbG9yLXBpY2tlci1maWxsLTInKS5jb2xvcnBpY2tlcignZ2V0VmFsdWUnLCAnI2ZmZmZmZicpO1xuXG5cdCAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkob2JqKTtcblx0fVxuXG5cdHRoaXMucG9zdCA9IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBqc29uID0gdGhpcy5zZXJpYWxpemUoKTtcblx0XHQkLnBvc3QoXG5cdFx0XHRcIi90aW1lbGluZVwiLFxuXHRcdFx0anNvbixcblx0XHRcdGZ1bmN0aW9uKGRhdGEpIHtcbiAgXHRcdFx0XHQkKFwiI3Jlc3VsdFwiKS5odG1sKGRhdGEpO1xuICBcdFx0XHRcdFxuICBcdFx0XHRcdGlmIChqc29uLmxlbmd0aCA9PT0gMCkge1xuICBcdFx0XHRcdFx0JCgnI3NvdXJjZS1kaXYnKS5jc3Moe1wiZGlzcGxheVwiOiBcIm5vbmVcIn0pO1xuICBcdFx0XHRcdFx0cmV0dXJuO1xuICBcdFx0XHRcdH1cbiAgXHRcdFx0XHQkKFwiI3NvdXJjZS1kaXZcIikuY3NzKHtcImRpc3BsYXlcIjogXCJibG9ja1wifSk7XG4gIFx0XHRcdFx0JChcIiNzb3VyY2VcIilbMF0udmFsdWUgPSBqc29uO1xuICBcdFx0XHR9XG4gIFx0XHQpO1xuXHR9O1xuXG5cdHRoaXMudXAgPSBmdW5jdGlvbihpZCkge1xuXHRcdHZhciByb3dJZCA9IGlkLnJlcGxhY2UoL151cC1idXR0b24vLCAnI3Rhc2snKTtcblx0XHQkKHJvd0lkKS5wcmV2KCkuYmVmb3JlKCQocm93SWQpKTtcblx0XHR0aGlzLmFkZFRhYmxlQnV0dG9uSGFuZGxlcnMoKTtcblx0fTtcblxuXHR0aGlzLmRvd24gPSBmdW5jdGlvbihpZCkge1xuXHRcdHZhciByb3dJZCA9IGlkLnJlcGxhY2UoL15kb3duLWJ1dHRvbi8sICcjdGFzaycpO1xuXHRcdCQocm93SWQpLm5leHQoKS5hZnRlcigkKHJvd0lkKSk7XG5cdFx0dGhpcy5hZGRUYWJsZUJ1dHRvbkhhbmRsZXJzKCk7XG5cdH07XG5cblx0dGhpcy5kZWxldGUgPSBmdW5jdGlvbihpZCkge1xuXHRcdHZhciByb3dJZCA9IGlkLnJlcGxhY2UoL15kZWxldGUtYnV0dG9uLywgJyN0YXNrJyk7XG5cdFx0JChyb3dJZCkucmVtb3ZlKCk7XG5cdFx0dGhpcy5hZGRUYWJsZUJ1dHRvbkhhbmRsZXJzKCk7XG5cdH07XG5cblx0dGhpcy5pbXBvcnQgPSBmdW5jdGlvbigpIHtcblx0XHR2YXIgcyA9ICQoJyNtb2RhbC1zb3VyY2UnKVswXS52YWx1ZTtcblx0XHR0cnkge1xuXHRcdFx0dmFyIG9iaiA9IEpTT04ucGFyc2Uocyk7XG5cdFx0fSBjYXRjaChlKSB7XG5cdFx0XHQkKCcjcmVzdWx0JylbMF0uaW5uZXJIVE1MID0gZS5tZXNzYWdlO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGlmIChvYmogPT09IHt9IHx8IG9iaiA9PT0gbnVsbCB8fCB0eXBlb2Yob2JqKSA9PT0gJ3VuZGVmaW5lZCcpIHtcblx0XHRcdCQoJyNyZXN1bHQnKVswXS5pbm5lckhUTUwgPSBcIk5vIHRpbWVsaW5lIGRhdGEgZm91bmRcIjtcblx0XHR9XG5cblx0XHR0aGlzLmNsZWFyVGFza3MoKTtcblx0XHRpZiAob2JqLnRhc2tzKSB7XG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IG9iai50YXNrcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHR2YXIgdGFzayA9IG9iai50YXNrc1tpXVxuXHRcdFx0XHR2YXIgY291bnRlciA9IHRoaXMuYWRkUm93KGZhbHNlKTtcblxuXHRcdFx0XHQkKCcjZGF0ZXBpY2tlci1zdGFydC0nICsgY291bnRlcikuZGF0ZXBpY2tlcigndXBkYXRlJywgdGFzay5zdGFydCk7XG5cdFx0XHRcdFxuXHRcdFx0XHR2YXIgb25nb2luZyA9ICh0YXNrLmVuZCA9PT0gXCItXCIpO1xuXHRcdFx0XHQkKCcjZGF0ZXBpY2tlci1lbmQtJyArIGNvdW50ZXIpLmRhdGVwaWNrZXIoJ3VwZGF0ZScsIChvbmdvaW5nKSA/IFwiXCIgOiB0YXNrLmVuZCk7XG5cdFx0XHRcdCQoJyNkYXRlcGlja2VyLWVuZC0nICsgY291bnRlciArICctb25nb2luZycpLnByb3AoJ2NoZWNrZWQnLCBvbmdvaW5nKTtcblx0XHRcdFx0JCgnI2xhYmVsLScgKyBjb3VudGVyKS52YWwodGFzay5sYWJlbCk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmIChvYmouc2V0dGluZ3MpIHtcblx0XHRcdHZhciBzZXR0aW5ncyA9IG9iai5zZXR0aW5nc1xuXHRcdFx0dmFyIG9uZ29pbmcgPSAoc2V0dGluZ3MuZW5kID09PSBcIi1cIik7XG5cdFx0XHQkKCcjZGF0ZXBpY2tlci1lbmQnKS5kYXRlcGlja2VyKCd1cGRhdGUnLCAob25nb2luZykgPyBcIlwiIDogc2V0dGluZ3MuZW5kKTtcblx0XHRcdCQoJyNkYXRlcGlja2VyLWVuZC1vbmdvaW5nJykucHJvcCgnY2hlY2tlZCcsIG9uZ29pbmcpO1xuXHRcdFx0JCgnI3pvb20taW5wdXQnKS52YWwoc2V0dGluZ3Muem9vbSk7XG5cdFx0XHQkKCcjaGlkZS1kYXlzLWZyb20taW5wdXQnKS52YWwoc2V0dGluZ3MuaGlkZURheXNGcm9tKTtcblx0XHRcdCQoJyNoaWRlLXdlZWtzLWZyb20taW5wdXQnKS52YWwoc2V0dGluZ3MuaGlkZVdlZWtzRnJvbSk7XG5cdFx0fVxuXHRcdGlmIChvYmoudGhlbWUpIHtcblx0XHRcdHZhciB0aGVtZSA9IG9iai50aGVtZTtcblx0XHRcdCQoJyNjb2xvci1zY2hlbWUtc2VsZWN0JykudmFsKHRoZW1lLmNvbG9yU2NoZW1lKTtcblx0XHRcdCQoJyNjb2xvci1waWNrZXItYm9yZGVyLTEnKS5jb2xvcnBpY2tlcignc2V0VmFsdWUnLCB0aGVtZS5ib3JkZXJDb2xvcjEpO1xuXHRcdFx0JCgnI2NvbG9yLXBpY2tlci1maWxsLTEnKS5jb2xvcnBpY2tlcignc2V0VmFsdWUnLCB0aGVtZS5maWxsQ29sb3IxKTtcblx0XHRcdCQoJyNjb2xvci1waWNrZXItYm9yZGVyLTInKS5jb2xvcnBpY2tlcignc2V0VmFsdWUnLCB0aGVtZS5ib3JkZXJDb2xvcjIpO1xuXHRcdFx0JCgnI2NvbG9yLXBpY2tlci1maWxsLTInKS5jb2xvcnBpY2tlcignc2V0VmFsdWUnLCB0aGVtZS5maWxsQ29sb3IyKTtcblx0XHR9XG5cdH07XG5cblx0dGhpcy5jbGVhclRhc2tzID0gZnVuY3Rpb24oKSB7XG5cdFx0JCgnI3Rhc2stdGFibGUtYm9keScpWzBdLmlubmVySFRNTCA9ICcnO1xuXHR9O1xufTtcblxuZnVuY3Rpb24gbWFpbkZ1bmMoKSB7XG4gIHZhciBhcHAgPSBuZXcgQXBwKCk7XG4gIGFwcC5pbml0KCk7XG59XG5cbndpbmRvdy5vbmxvYWQgPSBtYWluRnVuYztcbiJdfQ==
