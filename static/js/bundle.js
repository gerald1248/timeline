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
		obj.settings.zoom = parseInt($('#zoom-input').val());
		obj.settings.hideDaysFrom = parseInt($('#hide-days-from-input').val());
		obj.settings.hideWeeksFrom = parseInt($('#hide-weeks-from-input').val());
		
		//theme
		obj.theme.colorScheme = $('#color-scheme-select').val();
		obj.theme.borderColor1 = $('#color-picker-border-1').colorpicker('getValue', '-');
		obj.theme.fillColor1 = $('#color-picker-fill-1').colorpicker('getValue', '-');
		obj.theme.borderColor2 = $('#color-picker-border-2').colorpicker('getValue', '-');
		obj.theme.fillColor2 = $('#color-picker-fill-2').colorpicker('getValue', '-');

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
		var obj = JSON.parse(s);
		if (obj === {} || obj === null || typeof(obj) == 'undefined') {
			$('#result')[0].innerHTML = "Can't import timeline";
		}

		this.clearTasks();
		if (obj.tasks) {
			for (var i = 0; i < obj.tasks.length; i++) {
				var task = obj.tasks[i]
				var counter = this.addRow(false);

				$('#datepicker-start-' + counter).datepicker('update', task.start);
				$('#datepicker-end-' + counter).datepicker('update', (task.end === "-") ? "" : task.end);
				$('#label-' + counter).val(task.label);
			}
		}
	};

	this.clearTasks = function() {
		$('#task-table-body')[0].innerHTML = ''
	};
};

function mainFunc() {
  var app = new App();
  app.init();
}

window.onload = mainFunc;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiXSwibmFtZXMiOlsibWFpbkZ1bmMiLCJhcHAiLCJBcHAiLCJpbml0IiwidGhpcyIsImNvdW50ZXIiLCJzZWxmIiwiYWRkUm93IiwiJCIsIm9uIiwicG9zdCIsImNvbG9ycGlja2VyIiwiZm9ybWF0IiwiZGF0ZXBpY2tlciIsImNzcyIsImRpc3BsYXkiLCJpbXBvcnQiLCJhZGRUYWJsZUJ1dHRvbkhhbmRsZXJzIiwiYXJyIiwiaSIsImxlbmd0aCIsInVuYmluZCIsInVwIiwiaWQiLCJkb3duIiwiZGVsZXRlIiwic2V0Rm9jdXMiLCJhcHBlbmQiLCJmb2N1cyIsInNlcmlhbGl6ZSIsIm9iaiIsInNldHRpbmdzIiwidGFza3MiLCJ0aGVtZSIsImZyYW1lQm9yZGVyQ29sb3IiLCJmcmFtZUZpbGxDb2xvciIsInN0cmlwZUNvbG9yRGFyayIsInN0cmlwZUNvbG9yTGlnaHQiLCJncmlkQ29sb3IiLCJ0YXNrIiwiaWROdW0iLCJyZXBsYWNlIiwic3RhcnREYXRlIiwiZW5kRGF0ZSIsImVuZERhdGVPbmdvaW5nIiwicHJvcCIsImxhYmVsIiwidmFsIiwidGFza09iaiIsInN0YXJ0IiwiZW5kIiwicHVzaCIsInNldHRpbmdFbmREYXRlT25nb2luZyIsInpvb20iLCJwYXJzZUludCIsImhpZGVEYXlzRnJvbSIsImhpZGVXZWVrc0Zyb20iLCJjb2xvclNjaGVtZSIsImJvcmRlckNvbG9yMSIsImZpbGxDb2xvcjEiLCJib3JkZXJDb2xvcjIiLCJmaWxsQ29sb3IyIiwiSlNPTiIsInN0cmluZ2lmeSIsImpzb24iLCJkYXRhIiwiaHRtbCIsInZhbHVlIiwicm93SWQiLCJwcmV2IiwiYmVmb3JlIiwibmV4dCIsImFmdGVyIiwicmVtb3ZlIiwicyIsInBhcnNlIiwiaW5uZXJIVE1MIiwiY2xlYXJUYXNrcyIsIndpbmRvdyIsIm9ubG9hZCJdLCJtYXBwaW5ncyI6IkFBcUxBLFFBQUFBLFlBQ0EsR0FBQUMsR0FBQSxHQUFBQyxJQUNBRCxHQUFBRSxPQXZMQSxHQUFB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YixHQUFBLEVBQUFBLEVBQUFXLEVBQUFFLE1BQUFaLE9BQUFELElBQUEsQ0FDQSxHQUFBb0IsR0FBQVQsRUFBQUUsTUFBQWIsR0FDQWQsRUFBQUQsS0FBQUcsUUFBQSxFQUVBQyxHQUFBLHFCQUFBSCxHQUFBUSxXQUFBLFNBQUEwQixFQUFBVSxPQUNBekMsRUFBQSxtQkFBQUgsR0FBQVEsV0FBQSxTQUFBLE1BQUEwQixFQUFBVyxJQUFBLEdBQUFYLEVBQUFXLEtBQ0ExQyxFQUFBLFVBQUFILEdBQUEwQyxJQUFBUixFQUFBTyxTQUtBMUMsS0FBQXlFLFdBQUEsV0FDQXJFLEVBQUEsb0JBQUEsR0FBQW9FLFVBQUEsSUFTQUUsUUFBQUMsT0FBQS9FIiwiZmlsZSI6ImJ1bmRsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbInZhciBBcHAgPSBmdW5jdGlvbigpIHtcblx0dGhpcy5jb3VudGVyID0gMDtcblx0dGhpcy5pbml0ID0gZnVuY3Rpb24oKSB7XG5cdFx0dmFyIHNlbGYgPSB0aGlzO1xuXHRcdHRoaXMuYWRkUm93KGZhbHNlKTtcblx0XHQkKCcjYWRkLXRhc2stYnV0dG9uJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKSB7XG5cdFx0XHRzZWxmLmFkZFJvdyh0cnVlKTtcblx0XHR9KTtcblx0XHQkKCcjc2hvdy10aW1lbGluZS1idXR0b24nKS5vbignY2xpY2snLCBmdW5jdGlvbigpIHtcblx0XHRcdHNlbGYucG9zdCgpO1xuXHRcdH0pO1xuXHRcdCQoJyNjb2xvci1waWNrZXItYm9yZGVyLTEsI2NvbG9yLXBpY2tlci1maWxsLTEnKS5jb2xvcnBpY2tlcih7XCJmb3JtYXRcIjogXCJoZXhcIn0pO1xuXHRcdCQoJyNjb2xvci1waWNrZXItYm9yZGVyLTIsI2NvbG9yLXBpY2tlci1maWxsLTInKS5jb2xvcnBpY2tlcih7XCJmb3JtYXRcIjogXCJoZXhcIn0pO1xuXHRcdCQoJyNkYXRlcGlja2VyLWVuZCcpLmRhdGVwaWNrZXIoe2Zvcm1hdDogXCJ5eXl5LW1tLWRkXCJ9KTtcblx0XHQkKCcjc291cmNlLWRpdicpLmNzcyh7XCJkaXNwbGF5XCI6IFwibm9uZVwifSk7XG5cdFx0JCgnI21vZGFsLWFjdGlvbi1idXR0b24nKS5vbignY2xpY2snLCBmdW5jdGlvbigpIHtcblx0XHRcdHNlbGYuaW1wb3J0KCk7XG5cdFx0fSk7XG5cdFx0dGhpcy5hZGRUYWJsZUJ1dHRvbkhhbmRsZXJzKCk7XG5cdH07XG5cblx0dGhpcy5hZGRUYWJsZUJ1dHRvbkhhbmRsZXJzID0gZnVuY3Rpb24oKSB7XG5cdFx0dmFyIHNlbGYgPSB0aGlzO1xuXHRcdHZhciBhcnIgPSBbJ3VwLWJ1dHRvbicsICdkb3duLWJ1dHRvbicsICdkZWxldGUtYnV0dG9uJ107XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBhcnIubGVuZ3RoOyBpKyspIHtcblx0XHRcdCQoJy4nICsgYXJyW2ldKS51bmJpbmQoJ2NsaWNrJyk7XG5cdFx0fVxuXHRcdCQoJy51cC1idXR0b24nKS5vbignY2xpY2snLCBmdW5jdGlvbigpIHtcblx0XHRcdHNlbGYudXAodGhpcy5pZCk7XG5cdFx0fSk7XG5cdFx0JCgnLmRvd24tYnV0dG9uJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKSB7XG5cdFx0XHRzZWxmLmRvd24odGhpcy5pZCk7XG5cdFx0fSk7XG5cdFx0JCgnLmRlbGV0ZS1idXR0b24nKS5vbignY2xpY2snLCBmdW5jdGlvbigpIHtcblx0XHRcdHNlbGYuZGVsZXRlKHRoaXMuaWQpO1xuXHRcdH0pO1xuXHR9O1xuXG5cdHRoaXMuYWRkUm93ID0gZnVuY3Rpb24oc2V0Rm9jdXMpIHtcblx0XHR0aGlzLmNvdW50ZXIrKztcblx0XHQkKCcjdGFzay10YWJsZS1ib2R5JykuYXBwZW5kKFxuXHRcdFx0Jzx0ciBjbGFzcz1cInRhc2tcIiBpZD1cInRhc2stJyArIHRoaXMuY291bnRlciArICdcIj4nICtcblx0XHRcdCc8dGQ+PGRpdiBjbGFzcz1cImlucHV0LWFwcGVuZCBkYXRlXCI+PGlucHV0IGNsYXNzPVwiZm9ybS1jb250cm9sXCIgaWQ9XCJkYXRlcGlja2VyLXN0YXJ0LScgKyB0aGlzLmNvdW50ZXIgKyAnXCIgc2l6ZT1cIjE2XCIgdHlwZT1cInRleHRcIiByZWFkb25seT48c3BhbiBjbGFzcz1cImFkZC1vblwiPjxpIGNsYXNzPVwiaWNvbi10aFwiPjwvaT48L3NwYW4+PC9kaXY+PC90ZD4nICtcblx0XHRcdCc8dGQ+PGRpdiBjbGFzcz1cImlucHV0LWFwcGVuZCBkYXRlXCI+PGlucHV0IGNsYXNzPVwiZm9ybS1jb250cm9sXCIgaWQ9XCJkYXRlcGlja2VyLWVuZC0nICsgdGhpcy5jb3VudGVyICsgJ1wiIHNpemU9XCIxNlwiIHR5cGU9XCJ0ZXh0XCIgcmVhZG9ubHk+PHNwYW4gY2xhc3M9XCJhZGQtb25cIj48aSBjbGFzcz1cImljb24tdGhcIj48L2k+PC9zcGFuPjwvdGQ+JyArXG5cdFx0XHQnPHRkPjxkaXYgY2xhc3M9XCJjaGVja2JveFwiPjxsYWJlbD48aW5wdXQgaWQ9XCJkYXRlcGlja2VyLWVuZC0nICsgdGhpcy5jb3VudGVyICsgJy1vbmdvaW5nXCIgdHlwZT1cImNoZWNrYm94XCI+Jm5ic3A7T25nb2luZzwvbGFiZWw+PC9kaXY+PC90ZD4nICtcblx0XHRcdCc8dGQ+PGlucHV0IGNsYXNzPVwiZm9ybS1jb250cm9sXCIgaWQ9XCJsYWJlbC0nICsgdGhpcy5jb3VudGVyICsgJ1wiIHR5cGU9XCJ0ZXh0XCI+PC90ZD4nICtcblx0XHRcdCc8dGQ+PGJ1dHRvbiBjbGFzcz1cInVwLWJ1dHRvbiBidG4gYnRuLWRlZmF1bHRcIiBpZD1cInVwLWJ1dHRvbi0nICsgdGhpcy5jb3VudGVyICsgJ1wiPiZ1YXJyOzwvYnV0dG9uPjwvdGQ+JyArXG5cdFx0XHQnPHRkPjxidXR0b24gY2xhc3M9XCJkb3duLWJ1dHRvbiBidG4gYnRuLWRlZmF1bHRcIiBpZD1cImRvd24tYnV0dG9uLScgKyB0aGlzLmNvdW50ZXIgKyAnXCI+JmRhcnI7PC9idXR0b24+PC90ZD4nICtcblx0XHRcdCc8dGQ+PGJ1dHRvbiBjbGFzcz1cImRlbGV0ZS1idXR0b24gYnRuIGJ0bi1kZWZhdWx0XCIgaWQ9XCJkZWxldGUtYnV0dG9uLScgKyB0aGlzLmNvdW50ZXIgKyAnXCI+JmNyb3NzOzwvYnV0dG9uPjwvdGQ+JyArXG5cdFx0XHQnPC90cj4nXG5cdFx0KTtcblx0XHQkKCcjZGF0ZXBpY2tlci1zdGFydC0nICsgdGhpcy5jb3VudGVyICsgJywjZGF0ZXBpY2tlci1lbmQtJyArIHRoaXMuY291bnRlcikuZGF0ZXBpY2tlcih7Zm9ybWF0OiBcInl5eXktbW0tZGRcIn0pO1xuXHRcdFxuXHRcdGlmIChzZXRGb2N1cykge1xuXHRcdFx0JCgnI2RhdGVwaWNrZXItc3RhcnQtJyArIHRoaXMuY291bnRlcikuZm9jdXMoKTtcblx0XHR9XG5cblx0XHR0aGlzLmFkZFRhYmxlQnV0dG9uSGFuZGxlcnMoKTtcblxuXHRcdHJldHVybiB0aGlzLmNvdW50ZXI7XG5cdH07XG5cblx0dGhpcy5zZXJpYWxpemUgPSBmdW5jdGlvbigpIHtcblx0XHR2YXIgb2JqID0ge1xuXHRcdFx0XCJzZXR0aW5nc1wiOiB7XG5cblx0XHRcdH0sXG5cdFx0XHRcInRhc2tzXCI6IFtdLFxuXHRcdFx0XCJ0aGVtZVwiOiB7XG5cdFx0XHQgICAgXCJmcmFtZUJvcmRlckNvbG9yXCI6IFwiI2ZmZmZmZlwiLFxuXHRcdFx0ICAgIFwiZnJhbWVGaWxsQ29sb3JcIjogXCIjODg4ODg4XCIsXG5cdFx0XHQgICAgXCJzdHJpcGVDb2xvckRhcmtcIjogXCIjZGRkZGRkXCIsXG5cdFx0XHQgICAgXCJzdHJpcGVDb2xvckxpZ2h0XCI6IFwiI2VlZWVlZVwiLFxuXHRcdFx0ICAgIFwiZ3JpZENvbG9yXCI6IFwiIzk5OTk5OVwiXG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdC8vdGFza3Ncblx0XHR2YXIgdGFza3MgPSAkKCcudGFzaycpO1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdGFza3MubGVuZ3RoOyBpKyspIHtcblx0XHRcdHZhciB0YXNrID0gdGFza3NbaV07XG5cdFx0XHR2YXIgaWQgPSB0YXNrLmlkO1xuXHRcdFx0dmFyIGlkTnVtID0gaWQucmVwbGFjZSgvXnRhc2stLywgXCJcIik7XG5cblx0XHRcdHZhciBzdGFydERhdGUgPSAkKCcjZGF0ZXBpY2tlci1zdGFydC0nICsgaWROdW0pLmRhdGVwaWNrZXIoXCJnZXRGb3JtYXR0ZWREYXRlXCIpO1xuXHRcdFx0dmFyIGVuZERhdGUgPSAkKCcjZGF0ZXBpY2tlci1lbmQtJyArIGlkTnVtKS5kYXRlcGlja2VyKFwiZ2V0Rm9ybWF0dGVkRGF0ZVwiKTtcblx0XHRcdHZhciBlbmREYXRlT25nb2luZyA9ICQoJyNkYXRlcGlja2VyLWVuZC0nICsgaWROdW0gKyAnLW9uZ29pbmcnKS5wcm9wKCdjaGVja2VkJyk7IFxuXHRcdFx0aWYgKGVuZERhdGVPbmdvaW5nKSB7XG5cdFx0XHRcdGVuZERhdGUgPSBcIi1cIjtcblx0XHRcdH1cblx0XHRcdHZhciBsYWJlbCA9ICQoJyNsYWJlbC0nICsgaWROdW0pLnZhbCgpO1xuXG5cdFx0XHR2YXIgdGFza09iaiA9IHt9O1xuXHRcdFx0dGFza09iai5zdGFydCA9IHN0YXJ0RGF0ZTtcblx0XHRcdHRhc2tPYmouZW5kID0gZW5kRGF0ZTtcblx0XHRcdHRhc2tPYmoubGFiZWwgPSBsYWJlbDtcblxuXHRcdFx0b2JqLnRhc2tzLnB1c2godGFza09iaik7XG5cdFx0fVxuXG5cdFx0Ly9zZXR0aW5nc1xuXHRcdG9iai5zZXR0aW5ncy5lbmQgPSAkKCcjZGF0ZXBpY2tlci1lbmQnKS5kYXRlcGlja2VyKFwiZ2V0Rm9ybWF0dGVkRGF0ZVwiKTtcblx0XHR2YXIgc2V0dGluZ0VuZERhdGVPbmdvaW5nID0gJCgnI2RhdGVwaWNrZXItZW5kLW9uZ29pbmcnKS5wcm9wKCdjaGVja2VkJyk7XG5cdFx0aWYgKHNldHRpbmdFbmREYXRlT25nb2luZykge1xuXHRcdFx0b2JqLnNldHRpbmdzLmVuZCA9IFwiLVwiO1xuXHRcdH1cblx0XHRvYmouc2V0dGluZ3Muem9vbSA9IHBhcnNlSW50KCQoJyN6b29tLWlucHV0JykudmFsKCkpO1xuXHRcdG9iai5zZXR0aW5ncy5oaWRlRGF5c0Zyb20gPSBwYXJzZUludCgkKCcjaGlkZS1kYXlzLWZyb20taW5wdXQnKS52YWwoKSk7XG5cdFx0b2JqLnNldHRpbmdzLmhpZGVXZWVrc0Zyb20gPSBwYXJzZUludCgkKCcjaGlkZS13ZWVrcy1mcm9tLWlucHV0JykudmFsKCkpO1xuXHRcdFxuXHRcdC8vdGhlbWVcblx0XHRvYmoudGhlbWUuY29sb3JTY2hlbWUgPSAkKCcjY29sb3Itc2NoZW1lLXNlbGVjdCcpLnZhbCgpO1xuXHRcdG9iai50aGVtZS5ib3JkZXJDb2xvcjEgPSAkKCcjY29sb3ItcGlja2VyLWJvcmRlci0xJykuY29sb3JwaWNrZXIoJ2dldFZhbHVlJywgJy0nKTtcblx0XHRvYmoudGhlbWUuZmlsbENvbG9yMSA9ICQoJyNjb2xvci1waWNrZXItZmlsbC0xJykuY29sb3JwaWNrZXIoJ2dldFZhbHVlJywgJy0nKTtcblx0XHRvYmoudGhlbWUuYm9yZGVyQ29sb3IyID0gJCgnI2NvbG9yLXBpY2tlci1ib3JkZXItMicpLmNvbG9ycGlja2VyKCdnZXRWYWx1ZScsICctJyk7XG5cdFx0b2JqLnRoZW1lLmZpbGxDb2xvcjIgPSAkKCcjY29sb3ItcGlja2VyLWZpbGwtMicpLmNvbG9ycGlja2VyKCdnZXRWYWx1ZScsICctJyk7XG5cblx0ICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShvYmopO1xuXHR9XG5cblx0dGhpcy5wb3N0ID0gZnVuY3Rpb24oKSB7XG5cdFx0dmFyIGpzb24gPSB0aGlzLnNlcmlhbGl6ZSgpO1xuXHRcdCQucG9zdChcblx0XHRcdFwiL3RpbWVsaW5lXCIsXG5cdFx0XHRqc29uLFxuXHRcdFx0ZnVuY3Rpb24oZGF0YSkge1xuICBcdFx0XHRcdCQoXCIjcmVzdWx0XCIpLmh0bWwoZGF0YSk7XG4gIFx0XHRcdFx0XG4gIFx0XHRcdFx0aWYgKGpzb24ubGVuZ3RoID09PSAwKSB7XG4gIFx0XHRcdFx0XHQkKCcjc291cmNlLWRpdicpLmNzcyh7XCJkaXNwbGF5XCI6IFwibm9uZVwifSk7XG4gIFx0XHRcdFx0XHRyZXR1cm47XG4gIFx0XHRcdFx0fVxuICBcdFx0XHRcdCQoXCIjc291cmNlLWRpdlwiKS5jc3Moe1wiZGlzcGxheVwiOiBcImJsb2NrXCJ9KTtcbiAgXHRcdFx0XHQkKFwiI3NvdXJjZVwiKVswXS52YWx1ZSA9IGpzb247XG4gIFx0XHRcdH1cbiAgXHRcdCk7XG5cdH07XG5cblx0dGhpcy51cCA9IGZ1bmN0aW9uKGlkKSB7XG5cdFx0dmFyIHJvd0lkID0gaWQucmVwbGFjZSgvXnVwLWJ1dHRvbi8sICcjdGFzaycpO1xuXHRcdCQocm93SWQpLnByZXYoKS5iZWZvcmUoJChyb3dJZCkpO1xuXHRcdHRoaXMuYWRkVGFibGVCdXR0b25IYW5kbGVycygpO1xuXHR9O1xuXG5cdHRoaXMuZG93biA9IGZ1bmN0aW9uKGlkKSB7XG5cdFx0dmFyIHJvd0lkID0gaWQucmVwbGFjZSgvXmRvd24tYnV0dG9uLywgJyN0YXNrJyk7XG5cdFx0JChyb3dJZCkubmV4dCgpLmFmdGVyKCQocm93SWQpKTtcblx0XHR0aGlzLmFkZFRhYmxlQnV0dG9uSGFuZGxlcnMoKTtcblx0fTtcblxuXHR0aGlzLmRlbGV0ZSA9IGZ1bmN0aW9uKGlkKSB7XG5cdFx0dmFyIHJvd0lkID0gaWQucmVwbGFjZSgvXmRlbGV0ZS1idXR0b24vLCAnI3Rhc2snKTtcblx0XHQkKHJvd0lkKS5yZW1vdmUoKTtcblx0XHR0aGlzLmFkZFRhYmxlQnV0dG9uSGFuZGxlcnMoKTtcblx0fTtcblxuXHR0aGlzLmltcG9ydCA9IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBzID0gJCgnI21vZGFsLXNvdXJjZScpWzBdLnZhbHVlO1xuXHRcdHZhciBvYmogPSBKU09OLnBhcnNlKHMpO1xuXHRcdGlmIChvYmogPT09IHt9IHx8IG9iaiA9PT0gbnVsbCB8fCB0eXBlb2Yob2JqKSA9PSAndW5kZWZpbmVkJykge1xuXHRcdFx0JCgnI3Jlc3VsdCcpWzBdLmlubmVySFRNTCA9IFwiQ2FuJ3QgaW1wb3J0IHRpbWVsaW5lXCI7XG5cdFx0fVxuXG5cdFx0dGhpcy5jbGVhclRhc2tzKCk7XG5cdFx0aWYgKG9iai50YXNrcykge1xuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBvYmoudGFza3MubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0dmFyIHRhc2sgPSBvYmoudGFza3NbaV1cblx0XHRcdFx0dmFyIGNvdW50ZXIgPSB0aGlzLmFkZFJvdyhmYWxzZSk7XG5cblx0XHRcdFx0JCgnI2RhdGVwaWNrZXItc3RhcnQtJyArIGNvdW50ZXIpLmRhdGVwaWNrZXIoJ3VwZGF0ZScsIHRhc2suc3RhcnQpO1xuXHRcdFx0XHQkKCcjZGF0ZXBpY2tlci1lbmQtJyArIGNvdW50ZXIpLmRhdGVwaWNrZXIoJ3VwZGF0ZScsICh0YXNrLmVuZCA9PT0gXCItXCIpID8gXCJcIiA6IHRhc2suZW5kKTtcblx0XHRcdFx0JCgnI2xhYmVsLScgKyBjb3VudGVyKS52YWwodGFzay5sYWJlbCk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9O1xuXG5cdHRoaXMuY2xlYXJUYXNrcyA9IGZ1bmN0aW9uKCkge1xuXHRcdCQoJyN0YXNrLXRhYmxlLWJvZHknKVswXS5pbm5lckhUTUwgPSAnJ1xuXHR9O1xufTtcblxuZnVuY3Rpb24gbWFpbkZ1bmMoKSB7XG4gIHZhciBhcHAgPSBuZXcgQXBwKCk7XG4gIGFwcC5pbml0KCk7XG59XG5cbndpbmRvdy5vbmxvYWQgPSBtYWluRnVuYztcbiJdfQ==
