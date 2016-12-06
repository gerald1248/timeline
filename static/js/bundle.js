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
	}
};

function mainFunc() {
  var app = new App();
  app.init();
}

window.onload = mainFunc;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiXSwibmFtZXMiOlsibWFpbkZ1bmMiLCJhcHAiLCJBcHAiLCJpbml0IiwidGhpcyIsImNvdW50ZXIiLCJzZWxmIiwiYWRkUm93IiwiJCIsIm9uIiwicG9zdCIsImNvbG9ycGlja2VyIiwiZm9ybWF0IiwiZGF0ZXBpY2tlciIsImNzcyIsImRpc3BsYXkiLCJhZGRUYWJsZUJ1dHRvbkhhbmRsZXJzIiwiYXJyIiwiaSIsImxlbmd0aCIsInVuYmluZCIsInVwIiwiaWQiLCJkb3duIiwiZGVsZXRlIiwic2V0Rm9jdXMiLCJhcHBlbmQiLCJmb2N1cyIsInNlcmlhbGl6ZSIsIm9iaiIsInNldHRpbmdzIiwidGFza3MiLCJ0aGVtZSIsImZyYW1lQm9yZGVyQ29sb3IiLCJmcmFtZUZpbGxDb2xvciIsInN0cmlwZUNvbG9yRGFyayIsInN0cmlwZUNvbG9yTGlnaHQiLCJncmlkQ29sb3IiLCJ0YXNrIiwiaWROdW0iLCJyZXBsYWNlIiwic3RhcnREYXRlIiwiZW5kRGF0ZSIsImVuZERhdGVPbmdvaW5nIiwicHJvcCIsImxhYmVsIiwidmFsIiwidGFza09iaiIsInN0YXJ0IiwiZW5kIiwicHVzaCIsInNldHRpbmdFbmREYXRlT25nb2luZyIsInpvb20iLCJwYXJzZUludCIsImhpZGVEYXlzRnJvbSIsImhpZGVXZWVrc0Zyb20iLCJjb2xvclNjaGVtZSIsImJvcmRlckNvbG9yMSIsImZpbGxDb2xvcjEiLCJib3JkZXJDb2xvcjIiLCJmaWxsQ29sb3IyIiwiSlNPTiIsInN0cmluZ2lmeSIsImpzb24iLCJkYXRhIiwiaHRtbCIsInZhbHVlIiwicm93SWQiLCJwcmV2IiwiYmVmb3JlIiwibmV4dCIsImFmdGVyIiwicmVtb3ZlIiwid2luZG93Iiwib25sb2FkIl0sIm1hcHBpbmdzIjoiQUF3SkEsUUFBQUEsWUFDQSxHQUFBQyxHQUFBLEdBQUFDLElBQ0FELEdBQUFFLE9BMUpBLEdBQUFELEtBQUEsV0FDQUUsS0FBQUMsUUFBQSxFQUNBRCxLQUFBRCxLQUFBLFdBQ0Es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QUEsS0FDQWtCLEVBQUFHLE1BQUE0QixXQUFBcEQsRUFBQSx3QkFBQUcsWUFBQSxXQUFBLEtBRUFrRCxLQUFBQyxVQUFBakMsSUFHQXpCLEtBQUFNLEtBQUEsV0FDQSxHQUFBcUQsR0FBQTNELEtBQUF3QixXQUNBcEIsR0FBQUUsS0FDQSxZQUNBcUQsRUFDQSxTQUFBQyxHQUdBLE1BRkF4RCxHQUFBLFdBQUF5RCxLQUFBRCxHQUVBLElBQUFELEVBQUE1QyxXQUNBWCxHQUFBLGVBQUFNLEtBQUFDLFFBQUEsVUFHQVAsRUFBQSxlQUFBTSxLQUFBQyxRQUFBLGVBQ0FQLEVBQUEsV0FBQSxHQUFBMEQsTUFBQUgsT0FLQTNELEtBQUFpQixHQUFBLFNBQUFDLEdBQ0EsR0FBQTZDLEdBQUE3QyxFQUFBa0IsUUFBQSxhQUFBLFFBQ0FoQyxHQUFBMkQsR0FBQUMsT0FBQUMsT0FBQTdELEVBQUEyRCxJQUNBL0QsS0FBQVksMEJBR0FaLEtBQUFtQixLQUFBLFNBQUFELEdBQ0EsR0FBQTZDLEdBQUE3QyxFQUFBa0IsUUFBQSxlQUFBLFFBQ0FoQyxHQUFBMkQsR0FBQUcsT0FBQUMsTUFBQS9ELEVBQUEyRCxJQUNBL0QsS0FBQVksMEJBR0FaLEtBQUFvQixPQUFBLFNBQUFGLEdBQ0EsR0FBQTZDLEdBQUE3QyxFQUFBa0IsUUFBQSxpQkFBQSxRQUNBaEMsR0FBQTJELEdBQUFLLFNBQ0FwRSxLQUFBWSwwQkFTQXlELFFBQUFDLE9BQUExRSIsImZpbGUiOiJidW5kbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgQXBwID0gZnVuY3Rpb24oKSB7XG5cdHRoaXMuY291bnRlciA9IDA7XG5cdHRoaXMuaW5pdCA9IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBzZWxmID0gdGhpcztcblx0XHR0aGlzLmFkZFJvdyhmYWxzZSk7XG5cdFx0JCgnI2FkZC10YXNrLWJ1dHRvbicpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCkge1xuXHRcdFx0c2VsZi5hZGRSb3codHJ1ZSk7XG5cdFx0fSk7XG5cdFx0JCgnI3Nob3ctdGltZWxpbmUtYnV0dG9uJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKSB7XG5cdFx0XHRzZWxmLnBvc3QoKTtcblx0XHR9KTtcblx0XHQkKCcjY29sb3ItcGlja2VyLWJvcmRlci0xLCNjb2xvci1waWNrZXItZmlsbC0xJykuY29sb3JwaWNrZXIoe1wiZm9ybWF0XCI6IFwiaGV4XCJ9KTtcblx0XHQkKCcjY29sb3ItcGlja2VyLWJvcmRlci0yLCNjb2xvci1waWNrZXItZmlsbC0yJykuY29sb3JwaWNrZXIoe1wiZm9ybWF0XCI6IFwiaGV4XCJ9KTtcblx0XHQkKCcjZGF0ZXBpY2tlci1lbmQnKS5kYXRlcGlja2VyKHtmb3JtYXQ6IFwieXl5eS1tbS1kZFwifSk7XG5cdFx0JCgnI3NvdXJjZS1kaXYnKS5jc3Moe1wiZGlzcGxheVwiOiBcIm5vbmVcIn0pO1xuXHRcdHRoaXMuYWRkVGFibGVCdXR0b25IYW5kbGVycygpO1xuXHR9O1xuXG5cdHRoaXMuYWRkVGFibGVCdXR0b25IYW5kbGVycyA9IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBzZWxmID0gdGhpcztcblx0XHR2YXIgYXJyID0gWyd1cC1idXR0b24nLCAnZG93bi1idXR0b24nLCAnZGVsZXRlLWJ1dHRvbiddO1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgYXJyLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHQkKCcuJyArIGFycltpXSkudW5iaW5kKCdjbGljaycpO1xuXHRcdH1cblx0XHQkKCcudXAtYnV0dG9uJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKSB7XG5cdFx0XHRzZWxmLnVwKHRoaXMuaWQpO1xuXHRcdH0pO1xuXHRcdCQoJy5kb3duLWJ1dHRvbicpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCkge1xuXHRcdFx0c2VsZi5kb3duKHRoaXMuaWQpO1xuXHRcdH0pO1xuXHRcdCQoJy5kZWxldGUtYnV0dG9uJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKSB7XG5cdFx0XHRzZWxmLmRlbGV0ZSh0aGlzLmlkKTtcblx0XHR9KTtcblx0fTtcblxuXHR0aGlzLmFkZFJvdyA9IGZ1bmN0aW9uKHNldEZvY3VzKSB7XG5cdFx0dGhpcy5jb3VudGVyKys7XG5cdFx0JCgnI3Rhc2stdGFibGUtYm9keScpLmFwcGVuZChcblx0XHRcdCc8dHIgY2xhc3M9XCJ0YXNrXCIgaWQ9XCJ0YXNrLScgKyB0aGlzLmNvdW50ZXIgKyAnXCI+JyArXG5cdFx0XHQnPHRkPjxkaXYgY2xhc3M9XCJpbnB1dC1hcHBlbmQgZGF0ZVwiPjxpbnB1dCBjbGFzcz1cImZvcm0tY29udHJvbFwiIGlkPVwiZGF0ZXBpY2tlci1zdGFydC0nICsgdGhpcy5jb3VudGVyICsgJ1wiIHNpemU9XCIxNlwiIHR5cGU9XCJ0ZXh0XCIgcmVhZG9ubHk+PHNwYW4gY2xhc3M9XCJhZGQtb25cIj48aSBjbGFzcz1cImljb24tdGhcIj48L2k+PC9zcGFuPjwvZGl2PjwvdGQ+JyArXG5cdFx0XHQnPHRkPjxkaXYgY2xhc3M9XCJpbnB1dC1hcHBlbmQgZGF0ZVwiPjxpbnB1dCBjbGFzcz1cImZvcm0tY29udHJvbFwiIGlkPVwiZGF0ZXBpY2tlci1lbmQtJyArIHRoaXMuY291bnRlciArICdcIiBzaXplPVwiMTZcIiB0eXBlPVwidGV4dFwiIHJlYWRvbmx5PjxzcGFuIGNsYXNzPVwiYWRkLW9uXCI+PGkgY2xhc3M9XCJpY29uLXRoXCI+PC9pPjwvc3Bhbj48L3RkPicgK1xuXHRcdFx0Jzx0ZD48ZGl2IGNsYXNzPVwiY2hlY2tib3hcIj48bGFiZWw+PGlucHV0IGlkPVwiZGF0ZXBpY2tlci1lbmQtJyArIHRoaXMuY291bnRlciArICctb25nb2luZ1wiIHR5cGU9XCJjaGVja2JveFwiPiZuYnNwO09uZ29pbmc8L2xhYmVsPjwvZGl2PjwvdGQ+JyArXG5cdFx0XHQnPHRkPjxpbnB1dCBjbGFzcz1cImZvcm0tY29udHJvbFwiIGlkPVwibGFiZWwtJyArIHRoaXMuY291bnRlciArICdcIiB0eXBlPVwidGV4dFwiPjwvdGQ+JyArXG5cdFx0XHQnPHRkPjxidXR0b24gY2xhc3M9XCJ1cC1idXR0b24gYnRuIGJ0bi1kZWZhdWx0XCIgaWQ9XCJ1cC1idXR0b24tJyArIHRoaXMuY291bnRlciArICdcIj4mdWFycjs8L2J1dHRvbj48L3RkPicgK1xuXHRcdFx0Jzx0ZD48YnV0dG9uIGNsYXNzPVwiZG93bi1idXR0b24gYnRuIGJ0bi1kZWZhdWx0XCIgaWQ9XCJkb3duLWJ1dHRvbi0nICsgdGhpcy5jb3VudGVyICsgJ1wiPiZkYXJyOzwvYnV0dG9uPjwvdGQ+JyArXG5cdFx0XHQnPHRkPjxidXR0b24gY2xhc3M9XCJkZWxldGUtYnV0dG9uIGJ0biBidG4tZGVmYXVsdFwiIGlkPVwiZGVsZXRlLWJ1dHRvbi0nICsgdGhpcy5jb3VudGVyICsgJ1wiPiZjcm9zczs8L2J1dHRvbj48L3RkPicgK1xuXHRcdFx0JzwvdHI+J1xuXHRcdCk7XG5cdFx0JCgnI2RhdGVwaWNrZXItc3RhcnQtJyArIHRoaXMuY291bnRlciArICcsI2RhdGVwaWNrZXItZW5kLScgKyB0aGlzLmNvdW50ZXIpLmRhdGVwaWNrZXIoe2Zvcm1hdDogXCJ5eXl5LW1tLWRkXCJ9KTtcblx0XHRcblx0XHRpZiAoc2V0Rm9jdXMpIHtcblx0XHRcdCQoJyNkYXRlcGlja2VyLXN0YXJ0LScgKyB0aGlzLmNvdW50ZXIpLmZvY3VzKCk7XG5cdFx0fVxuXG5cdFx0dGhpcy5hZGRUYWJsZUJ1dHRvbkhhbmRsZXJzKCk7XG5cdH07XG5cblx0dGhpcy5zZXJpYWxpemUgPSBmdW5jdGlvbigpIHtcblx0XHR2YXIgb2JqID0ge1xuXHRcdFx0XCJzZXR0aW5nc1wiOiB7XG5cblx0XHRcdH0sXG5cdFx0XHRcInRhc2tzXCI6IFtdLFxuXHRcdFx0XCJ0aGVtZVwiOiB7XG5cdFx0XHQgICAgXCJmcmFtZUJvcmRlckNvbG9yXCI6IFwiI2ZmZmZmZlwiLFxuXHRcdFx0ICAgIFwiZnJhbWVGaWxsQ29sb3JcIjogXCIjODg4ODg4XCIsXG5cdFx0XHQgICAgXCJzdHJpcGVDb2xvckRhcmtcIjogXCIjZGRkZGRkXCIsXG5cdFx0XHQgICAgXCJzdHJpcGVDb2xvckxpZ2h0XCI6IFwiI2VlZWVlZVwiLFxuXHRcdFx0ICAgIFwiZ3JpZENvbG9yXCI6IFwiIzk5OTk5OVwiXG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdC8vdGFza3Ncblx0XHR2YXIgdGFza3MgPSAkKCcudGFzaycpO1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdGFza3MubGVuZ3RoOyBpKyspIHtcblx0XHRcdHZhciB0YXNrID0gdGFza3NbaV07XG5cdFx0XHR2YXIgaWQgPSB0YXNrLmlkO1xuXHRcdFx0dmFyIGlkTnVtID0gaWQucmVwbGFjZSgvXnRhc2stLywgXCJcIik7XG5cblx0XHRcdHZhciBzdGFydERhdGUgPSAkKCcjZGF0ZXBpY2tlci1zdGFydC0nICsgaWROdW0pLmRhdGVwaWNrZXIoXCJnZXRGb3JtYXR0ZWREYXRlXCIpO1xuXHRcdFx0dmFyIGVuZERhdGUgPSAkKCcjZGF0ZXBpY2tlci1lbmQtJyArIGlkTnVtKS5kYXRlcGlja2VyKFwiZ2V0Rm9ybWF0dGVkRGF0ZVwiKTtcblx0XHRcdHZhciBlbmREYXRlT25nb2luZyA9ICQoJyNkYXRlcGlja2VyLWVuZC0nICsgaWROdW0gKyAnLW9uZ29pbmcnKS5wcm9wKCdjaGVja2VkJyk7IFxuXHRcdFx0aWYgKGVuZERhdGVPbmdvaW5nKSB7XG5cdFx0XHRcdGVuZERhdGUgPSBcIi1cIjtcblx0XHRcdH1cblx0XHRcdHZhciBsYWJlbCA9ICQoJyNsYWJlbC0nICsgaWROdW0pLnZhbCgpO1xuXG5cdFx0XHR2YXIgdGFza09iaiA9IHt9O1xuXHRcdFx0dGFza09iai5zdGFydCA9IHN0YXJ0RGF0ZTtcblx0XHRcdHRhc2tPYmouZW5kID0gZW5kRGF0ZTtcblx0XHRcdHRhc2tPYmoubGFiZWwgPSBsYWJlbDtcblxuXHRcdFx0b2JqLnRhc2tzLnB1c2godGFza09iaik7XG5cdFx0fVxuXG5cdFx0Ly9zZXR0aW5nc1xuXHRcdG9iai5zZXR0aW5ncy5lbmQgPSAkKCcjZGF0ZXBpY2tlci1lbmQnKS5kYXRlcGlja2VyKFwiZ2V0Rm9ybWF0dGVkRGF0ZVwiKTtcblx0XHR2YXIgc2V0dGluZ0VuZERhdGVPbmdvaW5nID0gJCgnI2RhdGVwaWNrZXItZW5kLW9uZ29pbmcnKS5wcm9wKCdjaGVja2VkJyk7XG5cdFx0aWYgKHNldHRpbmdFbmREYXRlT25nb2luZykge1xuXHRcdFx0b2JqLnNldHRpbmdzLmVuZCA9IFwiLVwiO1xuXHRcdH1cblx0XHRvYmouc2V0dGluZ3Muem9vbSA9IHBhcnNlSW50KCQoJyN6b29tLWlucHV0JykudmFsKCkpO1xuXHRcdG9iai5zZXR0aW5ncy5oaWRlRGF5c0Zyb20gPSBwYXJzZUludCgkKCcjaGlkZS1kYXlzLWZyb20taW5wdXQnKS52YWwoKSk7XG5cdFx0b2JqLnNldHRpbmdzLmhpZGVXZWVrc0Zyb20gPSBwYXJzZUludCgkKCcjaGlkZS13ZWVrcy1mcm9tLWlucHV0JykudmFsKCkpO1xuXHRcdFxuXHRcdC8vdGhlbWVcblx0XHRvYmoudGhlbWUuY29sb3JTY2hlbWUgPSAkKCcjY29sb3Itc2NoZW1lLXNlbGVjdCcpLnZhbCgpO1xuXHRcdG9iai50aGVtZS5ib3JkZXJDb2xvcjEgPSAkKCcjY29sb3ItcGlja2VyLWJvcmRlci0xJykuY29sb3JwaWNrZXIoJ2dldFZhbHVlJywgJy0nKTtcblx0XHRvYmoudGhlbWUuZmlsbENvbG9yMSA9ICQoJyNjb2xvci1waWNrZXItZmlsbC0xJykuY29sb3JwaWNrZXIoJ2dldFZhbHVlJywgJy0nKTtcblx0XHRvYmoudGhlbWUuYm9yZGVyQ29sb3IyID0gJCgnI2NvbG9yLXBpY2tlci1ib3JkZXItMicpLmNvbG9ycGlja2VyKCdnZXRWYWx1ZScsICctJyk7XG5cdFx0b2JqLnRoZW1lLmZpbGxDb2xvcjIgPSAkKCcjY29sb3ItcGlja2VyLWZpbGwtMicpLmNvbG9ycGlja2VyKCdnZXRWYWx1ZScsICctJyk7XG5cblx0ICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShvYmopO1xuXHR9XG5cblx0dGhpcy5wb3N0ID0gZnVuY3Rpb24oKSB7XG5cdFx0dmFyIGpzb24gPSB0aGlzLnNlcmlhbGl6ZSgpO1xuXHRcdCQucG9zdChcblx0XHRcdFwiL3RpbWVsaW5lXCIsXG5cdFx0XHRqc29uLFxuXHRcdFx0ZnVuY3Rpb24oZGF0YSkge1xuICBcdFx0XHRcdCQoXCIjcmVzdWx0XCIpLmh0bWwoZGF0YSk7XG4gIFx0XHRcdFx0XG4gIFx0XHRcdFx0aWYgKGpzb24ubGVuZ3RoID09PSAwKSB7XG4gIFx0XHRcdFx0XHQkKCcjc291cmNlLWRpdicpLmNzcyh7XCJkaXNwbGF5XCI6IFwibm9uZVwifSk7XG4gIFx0XHRcdFx0XHRyZXR1cm47XG4gIFx0XHRcdFx0fVxuICBcdFx0XHRcdCQoXCIjc291cmNlLWRpdlwiKS5jc3Moe1wiZGlzcGxheVwiOiBcImJsb2NrXCJ9KTtcbiAgXHRcdFx0XHQkKFwiI3NvdXJjZVwiKVswXS52YWx1ZSA9IGpzb247XG4gIFx0XHRcdH1cbiAgXHRcdCk7XG5cdH07XG5cblx0dGhpcy51cCA9IGZ1bmN0aW9uKGlkKSB7XG5cdFx0dmFyIHJvd0lkID0gaWQucmVwbGFjZSgvXnVwLWJ1dHRvbi8sICcjdGFzaycpO1xuXHRcdCQocm93SWQpLnByZXYoKS5iZWZvcmUoJChyb3dJZCkpO1xuXHRcdHRoaXMuYWRkVGFibGVCdXR0b25IYW5kbGVycygpO1xuXHR9O1xuXG5cdHRoaXMuZG93biA9IGZ1bmN0aW9uKGlkKSB7XG5cdFx0dmFyIHJvd0lkID0gaWQucmVwbGFjZSgvXmRvd24tYnV0dG9uLywgJyN0YXNrJyk7XG5cdFx0JChyb3dJZCkubmV4dCgpLmFmdGVyKCQocm93SWQpKTtcblx0XHR0aGlzLmFkZFRhYmxlQnV0dG9uSGFuZGxlcnMoKTtcblx0fTtcblxuXHR0aGlzLmRlbGV0ZSA9IGZ1bmN0aW9uKGlkKSB7XG5cdFx0dmFyIHJvd0lkID0gaWQucmVwbGFjZSgvXmRlbGV0ZS1idXR0b24vLCAnI3Rhc2snKTtcblx0XHQkKHJvd0lkKS5yZW1vdmUoKTtcblx0XHR0aGlzLmFkZFRhYmxlQnV0dG9uSGFuZGxlcnMoKTtcblx0fVxufTtcblxuZnVuY3Rpb24gbWFpbkZ1bmMoKSB7XG4gIHZhciBhcHAgPSBuZXcgQXBwKCk7XG4gIGFwcC5pbml0KCk7XG59XG5cbndpbmRvdy5vbmxvYWQgPSBtYWluRnVuYztcbiJdfQ==
