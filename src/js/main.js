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
