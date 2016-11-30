var App = function() {
	this.counter = 0;
	this.init = function() {
		var self = this;
		this.addRow("2016-01-01", "2016-01-10", "Task #1");
		this.addRow("2016-05-01", "2016-05-10", "Task #2");
		this.addRow("2016-01-01", "2016-08-01", "Task #3");
		$('#add-task-button').on('click', function() {
			self.addRow();
		});
		$('#show-timeline-button').on('click', function() {
			self.post();
		});
		$('#color-picker-border-1,#color-picker-fill-1').colorpicker({"format": "hex"});
		$('#color-picker-border-2,#color-picker-fill-2').colorpicker({"format": "hex"});
		$('#datepicker-end').datepicker({format: "yyyy-mm-dd"});
	};

	this.addRow = function(a, b, c) {
		this.counter++;
		$('#task-table-body').append(
			'<tr class="task" id="task-' + this.counter + '"><td><div class="input-append date"><input id="datepicker-start-' + this.counter + '" size="16" type="text" readonly><span class="add-on"><i class="icon-th"></i></span></div></td><td><div class="input-append date"><input id="datepicker-end-' + this.counter + '" size="16" type="text" readonly><span class="add-on"><i class="icon-th"></i></span>&nbsp;<input id="datepicker-end-' + this.counter + '-ongoing" type="checkbox">&nbsp;Ongoing</div></td><td><input id="label-' + this.counter + '" type="text"></td></tr>'
		);
		$('#datepicker-start-' + this.counter + ',#datepicker-end-' + this.counter).datepicker({format: "yyyy-mm-dd"});
	};

	this.serialize = function() {
		var obj = {
			"end": "-",
			"tasks": []
		};

		var tasks = $('.task');
		for (var i = 0; i < tasks.length; i++) {
			var task = tasks[i];
			var id = task.id;
			obj.tasks.push(id);
		}

	    return obj;
	}

	this.post = function() {
		$.post(
			"/timeline",
			//this.serialize(),
			"{\"end\":\"-\",\"tasks\":[{\"start\":\"2016-01-01\",\"end\":\"2016-01-25\",\"label\":\"The houses are haunted\",\"endTo\":[1]},{\"start\":\"2016-02-01\",\"end\":\"-\",\"label\":\"By white night-gowns\"}]}",
			function(data) {
  				$("#result").html(data);
			}
		);
	};

	this.init();
};

function mainFunc() {
  var app = new App();
  app.init();
}

window.onload = mainFunc;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiXSwibmFtZXMiOlsibWFpbkZ1bmMiLCJhcHAiLCJBcHAiLCJpbml0IiwidGhpcyIsImNvdW50ZXIiLCJzZWxmIiwiYWRkUm93IiwiJCIsIm9uIiwicG9zdCIsImNvbG9ycGlja2VyIiwiZm9ybWF0IiwiZGF0ZXBpY2tlciIsImEiLCJiIiwiYyIsImFwcGVuZCIsInNlcmlhbGl6ZSIsIm9iaiIsImVuZCIsInRhc2tzIiwiaSIsImxlbmd0aCIsInRhc2siLCJpZCIsInB1c2giLCJkYXRhIiwiaHRtbCIsIndpbmRvdyIsIm9ubG9hZCJdLCJtYXBwaW5ncyI6IkFBd0RBLFFBQUFBLFlBQ0EsR0FBQUMsR0FBQSxHQUFBQyxJQUNBRCxHQUFBRSxPQTFEQSxHQUFBRCxLQUFBLFdBQ0FFLEtBQUFDLFFBQUEsRUFDQUQsS0FBQUQsS0FBQSxXQUNBLEdBQUFHLEdBQUFGLElBQ0FBLE1BQUFHLE9BQUEsYUFBQSxhQUFBLFdBQ0FILEtBQUFHLE9BQUEsYUFBQSxhQUFBLFdBQ0FILEtBQUFHLE9BQUEsYUFBQSxhQUFBLFdBQ0FDLEVBQUEsb0JBQUFDLEdBQUEsUUFBQSxXQUNBSCxFQUFBQyxXQUVBQyxFQUFBLHlCQUFBQyxHQUFBLFFBQUEsV0FDQUgsRUFBQUksU0FFQUYsRUFBQSwrQ0FBQUcsYUFBQUMsT0FBQSxRQUNBSixFQUFBLCtDQUFBRyxhQUFBQyxPQUFBLFFBQ0FKLEVBQUEsbUJBQUFLLFlBQUFELE9BQUEsZ0JBR0FSLEtBQUFHLE9BQUEsU0FBQU8sRUFBQUMsRUFBQUMsR0FDQVosS0FBQUMsVUFDQUcsRUFBQSxvQkFBQVMsT0FDQSw2QkFBQWIsS0FBQUMsUUFBQSxvRUFBQUQsS0FBQUMsUUFBQSwrSkFBQUQsS0FBQUMsUUFBQSx1SEFBQUQsS0FBQUMsUUFBQSwwRUFBQUQsS0FBQUMsUUFBQSw0QkFFQUcsRUFBQSxxQkFBQUosS0FBQUMsUUFBQSxvQkFBQUQsS0FBQUMsU0FBQVEsWUFBQUQsT0FBQSxnQkFHQVIsS0FBQWMsVUFBQSxXQU9BLElBQUEsR0FOQUMsSUFDQUMsSUFBQSxJQUNBQyxVQUdBQSxFQUFBYixFQUFBLFNBQ0FjLEVBQUEsRUFBQUEsRUFBQUQsRUFBQUUsT0FBQUQsSUFBQSxDQUNBLEdBQUFFLEdBQUFILEVBQUFDLEdBQ0FHLEVBQUFELEVBQUFDLEVBQ0FOLEdBQUFFLE1BQUFLLEtBQUFELEdBR0EsTUFBQU4sSUFHQWYsS0FBQU0sS0FBQSxXQUNBRixFQUFBRSxLQUNBLFlBRUEsK0tBQ0EsU0FBQWlCLEdBQ0FuQixFQUFBLFdBQUFvQixLQUFBRCxNQUtBdkIsS0FBQUQsT0FRQTBCLFFBQUFDLE9BQUE5QiIsImZpbGUiOiJidW5kbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgQXBwID0gZnVuY3Rpb24oKSB7XG5cdHRoaXMuY291bnRlciA9IDA7XG5cdHRoaXMuaW5pdCA9IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBzZWxmID0gdGhpcztcblx0XHR0aGlzLmFkZFJvdyhcIjIwMTYtMDEtMDFcIiwgXCIyMDE2LTAxLTEwXCIsIFwiVGFzayAjMVwiKTtcblx0XHR0aGlzLmFkZFJvdyhcIjIwMTYtMDUtMDFcIiwgXCIyMDE2LTA1LTEwXCIsIFwiVGFzayAjMlwiKTtcblx0XHR0aGlzLmFkZFJvdyhcIjIwMTYtMDEtMDFcIiwgXCIyMDE2LTA4LTAxXCIsIFwiVGFzayAjM1wiKTtcblx0XHQkKCcjYWRkLXRhc2stYnV0dG9uJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKSB7XG5cdFx0XHRzZWxmLmFkZFJvdygpO1xuXHRcdH0pO1xuXHRcdCQoJyNzaG93LXRpbWVsaW5lLWJ1dHRvbicpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCkge1xuXHRcdFx0c2VsZi5wb3N0KCk7XG5cdFx0fSk7XG5cdFx0JCgnI2NvbG9yLXBpY2tlci1ib3JkZXItMSwjY29sb3ItcGlja2VyLWZpbGwtMScpLmNvbG9ycGlja2VyKHtcImZvcm1hdFwiOiBcImhleFwifSk7XG5cdFx0JCgnI2NvbG9yLXBpY2tlci1ib3JkZXItMiwjY29sb3ItcGlja2VyLWZpbGwtMicpLmNvbG9ycGlja2VyKHtcImZvcm1hdFwiOiBcImhleFwifSk7XG5cdFx0JCgnI2RhdGVwaWNrZXItZW5kJykuZGF0ZXBpY2tlcih7Zm9ybWF0OiBcInl5eXktbW0tZGRcIn0pO1xuXHR9O1xuXG5cdHRoaXMuYWRkUm93ID0gZnVuY3Rpb24oYSwgYiwgYykge1xuXHRcdHRoaXMuY291bnRlcisrO1xuXHRcdCQoJyN0YXNrLXRhYmxlLWJvZHknKS5hcHBlbmQoXG5cdFx0XHQnPHRyIGNsYXNzPVwidGFza1wiIGlkPVwidGFzay0nICsgdGhpcy5jb3VudGVyICsgJ1wiPjx0ZD48ZGl2IGNsYXNzPVwiaW5wdXQtYXBwZW5kIGRhdGVcIj48aW5wdXQgaWQ9XCJkYXRlcGlja2VyLXN0YXJ0LScgKyB0aGlzLmNvdW50ZXIgKyAnXCIgc2l6ZT1cIjE2XCIgdHlwZT1cInRleHRcIiByZWFkb25seT48c3BhbiBjbGFzcz1cImFkZC1vblwiPjxpIGNsYXNzPVwiaWNvbi10aFwiPjwvaT48L3NwYW4+PC9kaXY+PC90ZD48dGQ+PGRpdiBjbGFzcz1cImlucHV0LWFwcGVuZCBkYXRlXCI+PGlucHV0IGlkPVwiZGF0ZXBpY2tlci1lbmQtJyArIHRoaXMuY291bnRlciArICdcIiBzaXplPVwiMTZcIiB0eXBlPVwidGV4dFwiIHJlYWRvbmx5PjxzcGFuIGNsYXNzPVwiYWRkLW9uXCI+PGkgY2xhc3M9XCJpY29uLXRoXCI+PC9pPjwvc3Bhbj4mbmJzcDs8aW5wdXQgaWQ9XCJkYXRlcGlja2VyLWVuZC0nICsgdGhpcy5jb3VudGVyICsgJy1vbmdvaW5nXCIgdHlwZT1cImNoZWNrYm94XCI+Jm5ic3A7T25nb2luZzwvZGl2PjwvdGQ+PHRkPjxpbnB1dCBpZD1cImxhYmVsLScgKyB0aGlzLmNvdW50ZXIgKyAnXCIgdHlwZT1cInRleHRcIj48L3RkPjwvdHI+J1xuXHRcdCk7XG5cdFx0JCgnI2RhdGVwaWNrZXItc3RhcnQtJyArIHRoaXMuY291bnRlciArICcsI2RhdGVwaWNrZXItZW5kLScgKyB0aGlzLmNvdW50ZXIpLmRhdGVwaWNrZXIoe2Zvcm1hdDogXCJ5eXl5LW1tLWRkXCJ9KTtcblx0fTtcblxuXHR0aGlzLnNlcmlhbGl6ZSA9IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBvYmogPSB7XG5cdFx0XHRcImVuZFwiOiBcIi1cIixcblx0XHRcdFwidGFza3NcIjogW11cblx0XHR9O1xuXG5cdFx0dmFyIHRhc2tzID0gJCgnLnRhc2snKTtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHRhc2tzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHR2YXIgdGFzayA9IHRhc2tzW2ldO1xuXHRcdFx0dmFyIGlkID0gdGFzay5pZDtcblx0XHRcdG9iai50YXNrcy5wdXNoKGlkKTtcblx0XHR9XG5cblx0ICAgIHJldHVybiBvYmo7XG5cdH1cblxuXHR0aGlzLnBvc3QgPSBmdW5jdGlvbigpIHtcblx0XHQkLnBvc3QoXG5cdFx0XHRcIi90aW1lbGluZVwiLFxuXHRcdFx0Ly90aGlzLnNlcmlhbGl6ZSgpLFxuXHRcdFx0XCJ7XFxcImVuZFxcXCI6XFxcIi1cXFwiLFxcXCJ0YXNrc1xcXCI6W3tcXFwic3RhcnRcXFwiOlxcXCIyMDE2LTAxLTAxXFxcIixcXFwiZW5kXFxcIjpcXFwiMjAxNi0wMS0yNVxcXCIsXFxcImxhYmVsXFxcIjpcXFwiVGhlIGhvdXNlcyBhcmUgaGF1bnRlZFxcXCIsXFxcImVuZFRvXFxcIjpbMV19LHtcXFwic3RhcnRcXFwiOlxcXCIyMDE2LTAyLTAxXFxcIixcXFwiZW5kXFxcIjpcXFwiLVxcXCIsXFxcImxhYmVsXFxcIjpcXFwiQnkgd2hpdGUgbmlnaHQtZ293bnNcXFwifV19XCIsXG5cdFx0XHRmdW5jdGlvbihkYXRhKSB7XG4gIFx0XHRcdFx0JChcIiNyZXN1bHRcIikuaHRtbChkYXRhKTtcblx0XHRcdH1cblx0XHQpO1xuXHR9O1xuXG5cdHRoaXMuaW5pdCgpO1xufTtcblxuZnVuY3Rpb24gbWFpbkZ1bmMoKSB7XG4gIHZhciBhcHAgPSBuZXcgQXBwKCk7XG4gIGFwcC5pbml0KCk7XG59XG5cbndpbmRvdy5vbmxvYWQgPSBtYWluRnVuYztcbiJdfQ==
