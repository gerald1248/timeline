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
			"zoom": "100",
			"layoutSteps": [180, 365],
			"tasks": [],
			"theme": {
				"name": "duration",
				"borderColor1": [0, 255, 0],
				"fillColor1": [0, 255, 0],
				"borderColor2": [255, 0, 0],
				"fillColor2": [255, 0, 0],
			    "frameBorderColor": [255, 255, 255],
			    "frameFillColor": [150, 150, 150],
			    "canvasColor1": [200, 200, 200],
			    "canvasColor2": [240, 240, 240],
			    "canvasGridColor": [100, 100, 100]
			}
		};

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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiXSwibmFtZXMiOlsibWFpbkZ1bmMiLCJhcHAiLCJBcHAiLCJpbml0IiwidGhpcyIsImNvdW50ZXIiLCJzZWxmIiwiYWRkUm93IiwiJCIsIm9uIiwicG9zdCIsImNvbG9ycGlja2VyIiwiZm9ybWF0IiwiZGF0ZXBpY2tlciIsImNzcyIsImRpc3BsYXkiLCJhZGRUYWJsZUJ1dHRvbkhhbmRsZXJzIiwiYXJyIiwiaSIsImxlbmd0aCIsInVuYmluZCIsInVwIiwiaWQiLCJkb3duIiwiZGVsZXRlIiwic2V0Rm9jdXMiLCJhcHBlbmQiLCJmb2N1cyIsInNlcmlhbGl6ZSIsIm9iaiIsInpvb20iLCJsYXlvdXRTdGVwcyIsInRhc2tzIiwidGhlbWUiLCJuYW1lIiwiYm9yZGVyQ29sb3IxIiwiZmlsbENvbG9yMSIsImJvcmRlckNvbG9yMiIsImZpbGxDb2xvcjIiLCJmcmFtZUJvcmRlckNvbG9yIiwiZnJhbWVGaWxsQ29sb3IiLCJjYW52YXNDb2xvcjEiLCJjYW52YXNDb2xvcjIiLCJjYW52YXNHcmlkQ29sb3IiLCJ0YXNrIiwiaWROdW0iLCJyZXBsYWNlIiwic3RhcnREYXRlIiwiZW5kRGF0ZSIsImVuZERhdGVPbmdvaW5nIiwicHJvcCIsImxhYmVsIiwidmFsIiwidGFza09iaiIsInN0YXJ0IiwiZW5kIiwicHVzaCIsIkpTT04iLCJzdHJpbmdpZnkiLCJqc29uIiwiZGF0YSIsImh0bWwiLCJ2YWx1ZSIsInJvd0lkIiwicHJldiIsImJlZm9yZSIsIm5leHQiLCJhZnRlciIsInJlbW92ZSIsIndpbmRvdyIsIm9ubG9hZCJdLCJtYXBwaW5ncyI6IkFBMElBLFFBQUFBLFlBQ0EsR0FBQUMsR0FBQSxHQUFBQyxJQUNBRCxHQUFBRSxPQTVJQSxHQUFBRCxLQUFBLFdBQ0FFLEtBQUFDLFFBQUEsRUFDQUQsS0FBQUQsS0FBQSxXQUNBLEdBQUFHLEdBQUFGLElBQ0FBLE1BQUFHLFFBQUEsR0FDQUMsRUFBQSxvQkFBQUMsR0FBQSxRQUFBLFdBQ0FILEVBQUFDLFFB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LEtBQUFZLDBCQUdBWixLQUFBbUIsS0FBQSxTQUFBRCxHQUNBLEdBQUF5QyxHQUFBekMsRUFBQXdCLFFBQUEsZUFBQSxRQUNBdEMsR0FBQXVELEdBQUFHLE9BQUFDLE1BQUEzRCxFQUFBdUQsSUFDQTNELEtBQUFZLDBCQUdBWixLQUFBb0IsT0FBQSxTQUFBRixHQUNBLEdBQUF5QyxHQUFBekMsRUFBQXdCLFFBQUEsaUJBQUEsUUFDQXRDLEdBQUF1RCxHQUFBSyxTQUNBaEUsS0FBQVksMEJBU0FxRCxRQUFBQyxPQUFBdEUiLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsidmFyIEFwcCA9IGZ1bmN0aW9uKCkge1xuXHR0aGlzLmNvdW50ZXIgPSAwO1xuXHR0aGlzLmluaXQgPSBmdW5jdGlvbigpIHtcblx0XHR2YXIgc2VsZiA9IHRoaXM7XG5cdFx0dGhpcy5hZGRSb3coZmFsc2UpO1xuXHRcdCQoJyNhZGQtdGFzay1idXR0b24nKS5vbignY2xpY2snLCBmdW5jdGlvbigpIHtcblx0XHRcdHNlbGYuYWRkUm93KHRydWUpO1xuXHRcdH0pO1xuXHRcdCQoJyNzaG93LXRpbWVsaW5lLWJ1dHRvbicpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCkge1xuXHRcdFx0c2VsZi5wb3N0KCk7XG5cdFx0fSk7XG5cdFx0JCgnI2NvbG9yLXBpY2tlci1ib3JkZXItMSwjY29sb3ItcGlja2VyLWZpbGwtMScpLmNvbG9ycGlja2VyKHtcImZvcm1hdFwiOiBcImhleFwifSk7XG5cdFx0JCgnI2NvbG9yLXBpY2tlci1ib3JkZXItMiwjY29sb3ItcGlja2VyLWZpbGwtMicpLmNvbG9ycGlja2VyKHtcImZvcm1hdFwiOiBcImhleFwifSk7XG5cdFx0JCgnI2RhdGVwaWNrZXItZW5kJykuZGF0ZXBpY2tlcih7Zm9ybWF0OiBcInl5eXktbW0tZGRcIn0pO1xuXHRcdCQoJyNzb3VyY2UtZGl2JykuY3NzKHtcImRpc3BsYXlcIjogXCJub25lXCJ9KTtcblx0XHR0aGlzLmFkZFRhYmxlQnV0dG9uSGFuZGxlcnMoKTtcblx0fTtcblxuXHR0aGlzLmFkZFRhYmxlQnV0dG9uSGFuZGxlcnMgPSBmdW5jdGlvbigpIHtcblx0XHR2YXIgc2VsZiA9IHRoaXM7XG5cdFx0dmFyIGFyciA9IFsndXAtYnV0dG9uJywgJ2Rvd24tYnV0dG9uJywgJ2RlbGV0ZS1idXR0b24nXTtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGFyci5sZW5ndGg7IGkrKykge1xuXHRcdFx0JCgnLicgKyBhcnJbaV0pLnVuYmluZCgnY2xpY2snKTtcblx0XHR9XG5cdFx0JCgnLnVwLWJ1dHRvbicpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCkge1xuXHRcdFx0c2VsZi51cCh0aGlzLmlkKTtcblx0XHR9KTtcblx0XHQkKCcuZG93bi1idXR0b24nKS5vbignY2xpY2snLCBmdW5jdGlvbigpIHtcblx0XHRcdHNlbGYuZG93bih0aGlzLmlkKTtcblx0XHR9KTtcblx0XHQkKCcuZGVsZXRlLWJ1dHRvbicpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCkge1xuXHRcdFx0c2VsZi5kZWxldGUodGhpcy5pZCk7XG5cdFx0fSk7XG5cdH07XG5cblx0dGhpcy5hZGRSb3cgPSBmdW5jdGlvbihzZXRGb2N1cykge1xuXHRcdHRoaXMuY291bnRlcisrO1xuXHRcdCQoJyN0YXNrLXRhYmxlLWJvZHknKS5hcHBlbmQoXG5cdFx0XHQnPHRyIGNsYXNzPVwidGFza1wiIGlkPVwidGFzay0nICsgdGhpcy5jb3VudGVyICsgJ1wiPicgK1xuXHRcdFx0Jzx0ZD48ZGl2IGNsYXNzPVwiaW5wdXQtYXBwZW5kIGRhdGVcIj48aW5wdXQgY2xhc3M9XCJmb3JtLWNvbnRyb2xcIiBpZD1cImRhdGVwaWNrZXItc3RhcnQtJyArIHRoaXMuY291bnRlciArICdcIiBzaXplPVwiMTZcIiB0eXBlPVwidGV4dFwiIHJlYWRvbmx5PjxzcGFuIGNsYXNzPVwiYWRkLW9uXCI+PGkgY2xhc3M9XCJpY29uLXRoXCI+PC9pPjwvc3Bhbj48L2Rpdj48L3RkPicgK1xuXHRcdFx0Jzx0ZD48ZGl2IGNsYXNzPVwiaW5wdXQtYXBwZW5kIGRhdGVcIj48aW5wdXQgY2xhc3M9XCJmb3JtLWNvbnRyb2xcIiBpZD1cImRhdGVwaWNrZXItZW5kLScgKyB0aGlzLmNvdW50ZXIgKyAnXCIgc2l6ZT1cIjE2XCIgdHlwZT1cInRleHRcIiByZWFkb25seT48c3BhbiBjbGFzcz1cImFkZC1vblwiPjxpIGNsYXNzPVwiaWNvbi10aFwiPjwvaT48L3NwYW4+PC90ZD4nICtcblx0XHRcdCc8dGQ+PGRpdiBjbGFzcz1cImNoZWNrYm94XCI+PGxhYmVsPjxpbnB1dCBpZD1cImRhdGVwaWNrZXItZW5kLScgKyB0aGlzLmNvdW50ZXIgKyAnLW9uZ29pbmdcIiB0eXBlPVwiY2hlY2tib3hcIj4mbmJzcDtPbmdvaW5nPC9sYWJlbD48L2Rpdj48L3RkPicgK1xuXHRcdFx0Jzx0ZD48aW5wdXQgY2xhc3M9XCJmb3JtLWNvbnRyb2xcIiBpZD1cImxhYmVsLScgKyB0aGlzLmNvdW50ZXIgKyAnXCIgdHlwZT1cInRleHRcIj48L3RkPicgK1xuXHRcdFx0Jzx0ZD48YnV0dG9uIGNsYXNzPVwidXAtYnV0dG9uIGJ0biBidG4tZGVmYXVsdFwiIGlkPVwidXAtYnV0dG9uLScgKyB0aGlzLmNvdW50ZXIgKyAnXCI+JnVhcnI7PC9idXR0b24+PC90ZD4nICtcblx0XHRcdCc8dGQ+PGJ1dHRvbiBjbGFzcz1cImRvd24tYnV0dG9uIGJ0biBidG4tZGVmYXVsdFwiIGlkPVwiZG93bi1idXR0b24tJyArIHRoaXMuY291bnRlciArICdcIj4mZGFycjs8L2J1dHRvbj48L3RkPicgK1xuXHRcdFx0Jzx0ZD48YnV0dG9uIGNsYXNzPVwiZGVsZXRlLWJ1dHRvbiBidG4gYnRuLWRlZmF1bHRcIiBpZD1cImRlbGV0ZS1idXR0b24tJyArIHRoaXMuY291bnRlciArICdcIj4mY3Jvc3M7PC9idXR0b24+PC90ZD4nICtcblx0XHRcdCc8L3RyPidcblx0XHQpO1xuXHRcdCQoJyNkYXRlcGlja2VyLXN0YXJ0LScgKyB0aGlzLmNvdW50ZXIgKyAnLCNkYXRlcGlja2VyLWVuZC0nICsgdGhpcy5jb3VudGVyKS5kYXRlcGlja2VyKHtmb3JtYXQ6IFwieXl5eS1tbS1kZFwifSk7XG5cdFx0XG5cdFx0aWYgKHNldEZvY3VzKSB7XG5cdFx0XHQkKCcjZGF0ZXBpY2tlci1zdGFydC0nICsgdGhpcy5jb3VudGVyKS5mb2N1cygpO1xuXHRcdH1cblxuXHRcdHRoaXMuYWRkVGFibGVCdXR0b25IYW5kbGVycygpO1xuXHR9O1xuXG5cdHRoaXMuc2VyaWFsaXplID0gZnVuY3Rpb24oKSB7XG5cdFx0dmFyIG9iaiA9IHtcblx0XHRcdFwiem9vbVwiOiBcIjEwMFwiLFxuXHRcdFx0XCJsYXlvdXRTdGVwc1wiOiBbMTgwLCAzNjVdLFxuXHRcdFx0XCJ0YXNrc1wiOiBbXSxcblx0XHRcdFwidGhlbWVcIjoge1xuXHRcdFx0XHRcIm5hbWVcIjogXCJkdXJhdGlvblwiLFxuXHRcdFx0XHRcImJvcmRlckNvbG9yMVwiOiBbMCwgMjU1LCAwXSxcblx0XHRcdFx0XCJmaWxsQ29sb3IxXCI6IFswLCAyNTUsIDBdLFxuXHRcdFx0XHRcImJvcmRlckNvbG9yMlwiOiBbMjU1LCAwLCAwXSxcblx0XHRcdFx0XCJmaWxsQ29sb3IyXCI6IFsyNTUsIDAsIDBdLFxuXHRcdFx0ICAgIFwiZnJhbWVCb3JkZXJDb2xvclwiOiBbMjU1LCAyNTUsIDI1NV0sXG5cdFx0XHQgICAgXCJmcmFtZUZpbGxDb2xvclwiOiBbMTUwLCAxNTAsIDE1MF0sXG5cdFx0XHQgICAgXCJjYW52YXNDb2xvcjFcIjogWzIwMCwgMjAwLCAyMDBdLFxuXHRcdFx0ICAgIFwiY2FudmFzQ29sb3IyXCI6IFsyNDAsIDI0MCwgMjQwXSxcblx0XHRcdCAgICBcImNhbnZhc0dyaWRDb2xvclwiOiBbMTAwLCAxMDAsIDEwMF1cblx0XHRcdH1cblx0XHR9O1xuXG5cdFx0dmFyIHRhc2tzID0gJCgnLnRhc2snKTtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHRhc2tzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHR2YXIgdGFzayA9IHRhc2tzW2ldO1xuXHRcdFx0dmFyIGlkID0gdGFzay5pZDtcblx0XHRcdHZhciBpZE51bSA9IGlkLnJlcGxhY2UoL150YXNrLS8sIFwiXCIpO1xuXG5cdFx0XHR2YXIgc3RhcnREYXRlID0gJCgnI2RhdGVwaWNrZXItc3RhcnQtJyArIGlkTnVtKS5kYXRlcGlja2VyKFwiZ2V0Rm9ybWF0dGVkRGF0ZVwiKTtcblx0XHRcdHZhciBlbmREYXRlID0gJCgnI2RhdGVwaWNrZXItZW5kLScgKyBpZE51bSkuZGF0ZXBpY2tlcihcImdldEZvcm1hdHRlZERhdGVcIik7XG5cdFx0XHR2YXIgZW5kRGF0ZU9uZ29pbmcgPSAkKCcjZGF0ZXBpY2tlci1lbmQtJyArIGlkTnVtICsgJy1vbmdvaW5nJykucHJvcCgnY2hlY2tlZCcpOyBcblx0XHRcdGlmIChlbmREYXRlT25nb2luZykge1xuXHRcdFx0XHRlbmREYXRlID0gXCItXCI7XG5cdFx0XHR9XG5cdFx0XHR2YXIgbGFiZWwgPSAkKCcjbGFiZWwtJyArIGlkTnVtKS52YWwoKTtcblxuXHRcdFx0dmFyIHRhc2tPYmogPSB7fTtcblx0XHRcdHRhc2tPYmouc3RhcnQgPSBzdGFydERhdGU7XG5cdFx0XHR0YXNrT2JqLmVuZCA9IGVuZERhdGU7XG5cdFx0XHR0YXNrT2JqLmxhYmVsID0gbGFiZWw7XG5cblx0XHRcdG9iai50YXNrcy5wdXNoKHRhc2tPYmopO1xuXHRcdH1cblxuXHQgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KG9iaik7XG5cdH1cblxuXHR0aGlzLnBvc3QgPSBmdW5jdGlvbigpIHtcblx0XHR2YXIganNvbiA9IHRoaXMuc2VyaWFsaXplKCk7XG5cdFx0JC5wb3N0KFxuXHRcdFx0XCIvdGltZWxpbmVcIixcblx0XHRcdGpzb24sXG5cdFx0XHRmdW5jdGlvbihkYXRhKSB7XG4gIFx0XHRcdFx0JChcIiNyZXN1bHRcIikuaHRtbChkYXRhKTtcbiAgXHRcdFx0XHRcbiAgXHRcdFx0XHRpZiAoanNvbi5sZW5ndGggPT09IDApIHtcbiAgXHRcdFx0XHRcdCQoJyNzb3VyY2UtZGl2JykuY3NzKHtcImRpc3BsYXlcIjogXCJub25lXCJ9KTtcbiAgXHRcdFx0XHRcdHJldHVybjtcbiAgXHRcdFx0XHR9XG4gIFx0XHRcdFx0JChcIiNzb3VyY2UtZGl2XCIpLmNzcyh7XCJkaXNwbGF5XCI6IFwiYmxvY2tcIn0pO1xuICBcdFx0XHRcdCQoXCIjc291cmNlXCIpWzBdLnZhbHVlID0ganNvbjtcbiAgXHRcdFx0fVxuICBcdFx0KTtcblx0fTtcblxuXHR0aGlzLnVwID0gZnVuY3Rpb24oaWQpIHtcblx0XHR2YXIgcm93SWQgPSBpZC5yZXBsYWNlKC9edXAtYnV0dG9uLywgJyN0YXNrJyk7XG5cdFx0JChyb3dJZCkucHJldigpLmJlZm9yZSgkKHJvd0lkKSk7XG5cdFx0dGhpcy5hZGRUYWJsZUJ1dHRvbkhhbmRsZXJzKCk7XG5cdH07XG5cblx0dGhpcy5kb3duID0gZnVuY3Rpb24oaWQpIHtcblx0XHR2YXIgcm93SWQgPSBpZC5yZXBsYWNlKC9eZG93bi1idXR0b24vLCAnI3Rhc2snKTtcblx0XHQkKHJvd0lkKS5uZXh0KCkuYWZ0ZXIoJChyb3dJZCkpO1xuXHRcdHRoaXMuYWRkVGFibGVCdXR0b25IYW5kbGVycygpO1xuXHR9O1xuXG5cdHRoaXMuZGVsZXRlID0gZnVuY3Rpb24oaWQpIHtcblx0XHR2YXIgcm93SWQgPSBpZC5yZXBsYWNlKC9eZGVsZXRlLWJ1dHRvbi8sICcjdGFzaycpO1xuXHRcdCQocm93SWQpLnJlbW92ZSgpO1xuXHRcdHRoaXMuYWRkVGFibGVCdXR0b25IYW5kbGVycygpO1xuXHR9XG59O1xuXG5mdW5jdGlvbiBtYWluRnVuYygpIHtcbiAgdmFyIGFwcCA9IG5ldyBBcHAoKTtcbiAgYXBwLmluaXQoKTtcbn1cblxud2luZG93Lm9ubG9hZCA9IG1haW5GdW5jO1xuIl19
