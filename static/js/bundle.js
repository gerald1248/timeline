var App = function() {
	this.counter = 0;
	this.init = function() {
		var self = this;
		this.addRow();
		$('#add-task-button').on('click', function() {
			self.addRow();
		});
		$('#show-timeline-button').on('click', function() {
			self.post();
		});
		$('#color-picker-border-1,#color-picker-fill-1').colorpicker({"format": "hex"});
		$('#color-picker-border-2,#color-picker-fill-2').colorpicker({"format": "hex"});
		$('#datepicker-end').datepicker({format: "yyyy-mm-dd"});
		$('#source').css({"display": "none"});
	};

	this.addRow = function() {
		this.counter++;
		$('#task-table-body').append(
			'<tr class="task" id="task-' + this.counter + '"><td><div class="input-append date"><input id="datepicker-start-' + this.counter + '" size="16" type="text" readonly><span class="add-on"><i class="icon-th"></i></span></div></td><td><div class="input-append date"><input id="datepicker-end-' + this.counter + '" size="16" type="text" readonly><span class="add-on"><i class="icon-th"></i></span>&nbsp;<input id="datepicker-end-' + this.counter + '-ongoing" type="checkbox">&nbsp;Ongoing</div></td><td><input id="label-' + this.counter + '" type="text"></td></tr>'
		);
		$('#datepicker-start-' + this.counter + ',#datepicker-end-' + this.counter).datepicker({format: "yyyy-mm-dd"});
	};

	this.serialize = function() {
		var obj = {
			"zoom": "100",
			"layoutSteps": [180, 365],
			"tasks": []
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
		//var json = "{\"end\":\"-\",\"tasks\":[{\"start\":\"2016-01-01\",\"end\":\"2016-01-25\",\"label\":\"The houses are haunted\",\"endTo\":[1]},{\"start\":\"2016-02-01\",\"end\":\"-\",\"label\":\"By white night-gowns\"}]}";

		console.log('attempting to post: ' + json);

		$.post(
			"/timeline",
			json,
			function(data) {
  				$("#result").html(data);
  				
  				if (json.length === 0) {
  					$('#source').css({"display": "none"});
  					return;
  				}
  				$("#source").css({"display": "block"});
  				$("#source").html(json);
  			});
	};
};

function mainFunc() {
  var app = new App();
  app.init();
}

window.onload = mainFunc;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiXSwibmFtZXMiOlsibWFpbkZ1bmMiLCJhcHAiLCJBcHAiLCJpbml0IiwidGhpcyIsImNvdW50ZXIiLCJzZWxmIiwiYWRkUm93IiwiJCIsIm9uIiwicG9zdCIsImNvbG9ycGlja2VyIiwiZm9ybWF0IiwiZGF0ZXBpY2tlciIsImNzcyIsImRpc3BsYXkiLCJhcHBlbmQiLCJzZXJpYWxpemUiLCJvYmoiLCJ6b29tIiwibGF5b3V0U3RlcHMiLCJ0YXNrcyIsImkiLCJsZW5ndGgiLCJ0YXNrIiwiaWQiLCJpZE51bSIsInJlcGxhY2UiLCJzdGFydERhdGUiLCJlbmREYXRlIiwiZW5kRGF0ZU9uZ29pbmciLCJwcm9wIiwibGFiZWwiLCJ2YWwiLCJ0YXNrT2JqIiwic3RhcnQiLCJlbmQiLCJwdXNoIiwiSlNPTiIsInN0cmluZ2lmeSIsImpzb24iLCJjb25zb2xlIiwibG9nIiwiZGF0YSIsImh0bWwiLCJ3aW5kb3ciLCJvbmxvYWQiXSwibWFwcGluZ3MiOiJBQStFQSxRQUFBQSxZQUNBLEdBQUFDLEdBQUEsR0FBQUMsSUFDQUQsR0FBQUUsT0FqRkEsR0FBQUQsS0FBQSxXQUNBRSxLQUFBQyxRQUFBLEVBQ0FELEtBQUFELEtBQUEsV0FDQSxHQUFBRyxHQUFBRixJQUNBQSxNQUFBRyxTQUNBQyxFQUFBLG9CQUFBQyxHQUFBLFFBQUEsV0FDQUgsRUFBQUMsV0FFQUMsRUFBQSx5QkFBQUMsR0FBQSxRQUFBLFdBQ0FILEVBQUFJLFNBRUFGLEVBQUEsK0NBQUFHLGFBQUFDLE9BQUEsUUFDQUosRUFBQSwrQ0FBQUcsYUFBQUMsT0FBQSxRQUNBSixFQUFBLG1CQUFBSyxZQUFBRCxPQUFBLGVBQ0FKLEVBQUEsV0FBQU0sS0FBQUMsUUFBQSxVQUdBWCxLQUFBRyxPQUFBLFdBQ0FILEtBQUFDLFVBQ0FHLEVBQUEsb0JBQUFRLE9BQ0EsNkJBQUFaLEtBQUFDLFFBQUEsb0VBQUFELEtBQUFDLFFBQUEsK0pBQUFELEtBQUFDLFFBQUEsdUhBQUFELEtBQUFDLFFBQUEsMEVBQUFELEtBQUFDLFFBQUEsNEJBRUFHLEVBQUEscUJBQUFKLEtBQUFDLFFBQUEsb0JBQUFELEtBQUFDLFNBQUFRLFlBQUFELE9BQUEsZ0JBR0FSLEtBQUFhLFVBQUEsV0FRQSxJQUFBLEdBUEFDLElBQ0FDLEtBQUEsTUFDQUMsYUFBQSxJQUFBLEtBQ0FDLFVBR0FBLEVBQUFiLEVBQUEsU0FDQWMsRUFBQSxFQUFBQSxFQUFBRCxFQUFBRSxPQUFBRCxJQUFBLENBQ0EsR0FBQUUsR0FBQUgsRUFBQUMsR0FDQUcsRUFBQUQsRUFBQUMsR0FDQUMsRUFBQUQsRUFBQUUsUUFBQSxTQUFBLElBRUFDLEVBQUFwQixFQUFBLHFCQUFBa0IsR0FBQWIsV0FBQSxvQkFDQWdCLEVBQUFyQixFQUFBLG1CQUFBa0IsR0FBQWIsV0FBQSxvQkFDQWlCLEVBQUF0QixFQUFBLG1CQUFBa0IsRUFBQSxZQUFBSyxLQUFBLFVBQ0FELEtBQ0FELEVBQUEsSUFFQSxJQUFBRyxHQUFBeEIsRUFBQSxVQUFBa0IsR0FBQU8sTUFFQUMsSUFDQUEsR0FBQUMsTUFBQVAsRUFDQU0sRUFBQUUsSUFBQVAsRUFDQUssRUFBQUYsTUFBQUEsRUFFQWQsRUFBQUcsTUFBQWdCLEtBQUFILEdBR0EsTUFBQUksTUFBQUMsVUFBQXJCLElBR0FkLEtBQUFNLEtBQUEsV0FDQSxHQUFBOEIsR0FBQXBDLEtBQUFhLFdBR0F3QixTQUFBQyxJQUFBLHVCQUFBRixHQUVBaEMsRUFBQUUsS0FDQSxZQUNBOEIsRUFDQSxTQUFBRyxHQUdBLE1BRkFuQyxHQUFBLFdBQUFvQyxLQUFBRCxHQUVBLElBQUFILEVBQUFqQixXQUNBZixHQUFBLFdBQUFNLEtBQUFDLFFBQUEsVUFHQVAsRUFBQSxXQUFBTSxLQUFBQyxRQUFBLGNBQ0FQLEdBQUEsV0FBQW9DLEtBQUFKLE9BVUFLLFFBQUFDLE9BQUE5QyIsImZpbGUiOiJidW5kbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgQXBwID0gZnVuY3Rpb24oKSB7XG5cdHRoaXMuY291bnRlciA9IDA7XG5cdHRoaXMuaW5pdCA9IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBzZWxmID0gdGhpcztcblx0XHR0aGlzLmFkZFJvdygpO1xuXHRcdCQoJyNhZGQtdGFzay1idXR0b24nKS5vbignY2xpY2snLCBmdW5jdGlvbigpIHtcblx0XHRcdHNlbGYuYWRkUm93KCk7XG5cdFx0fSk7XG5cdFx0JCgnI3Nob3ctdGltZWxpbmUtYnV0dG9uJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKSB7XG5cdFx0XHRzZWxmLnBvc3QoKTtcblx0XHR9KTtcblx0XHQkKCcjY29sb3ItcGlja2VyLWJvcmRlci0xLCNjb2xvci1waWNrZXItZmlsbC0xJykuY29sb3JwaWNrZXIoe1wiZm9ybWF0XCI6IFwiaGV4XCJ9KTtcblx0XHQkKCcjY29sb3ItcGlja2VyLWJvcmRlci0yLCNjb2xvci1waWNrZXItZmlsbC0yJykuY29sb3JwaWNrZXIoe1wiZm9ybWF0XCI6IFwiaGV4XCJ9KTtcblx0XHQkKCcjZGF0ZXBpY2tlci1lbmQnKS5kYXRlcGlja2VyKHtmb3JtYXQ6IFwieXl5eS1tbS1kZFwifSk7XG5cdFx0JCgnI3NvdXJjZScpLmNzcyh7XCJkaXNwbGF5XCI6IFwibm9uZVwifSk7XG5cdH07XG5cblx0dGhpcy5hZGRSb3cgPSBmdW5jdGlvbigpIHtcblx0XHR0aGlzLmNvdW50ZXIrKztcblx0XHQkKCcjdGFzay10YWJsZS1ib2R5JykuYXBwZW5kKFxuXHRcdFx0Jzx0ciBjbGFzcz1cInRhc2tcIiBpZD1cInRhc2stJyArIHRoaXMuY291bnRlciArICdcIj48dGQ+PGRpdiBjbGFzcz1cImlucHV0LWFwcGVuZCBkYXRlXCI+PGlucHV0IGlkPVwiZGF0ZXBpY2tlci1zdGFydC0nICsgdGhpcy5jb3VudGVyICsgJ1wiIHNpemU9XCIxNlwiIHR5cGU9XCJ0ZXh0XCIgcmVhZG9ubHk+PHNwYW4gY2xhc3M9XCJhZGQtb25cIj48aSBjbGFzcz1cImljb24tdGhcIj48L2k+PC9zcGFuPjwvZGl2PjwvdGQ+PHRkPjxkaXYgY2xhc3M9XCJpbnB1dC1hcHBlbmQgZGF0ZVwiPjxpbnB1dCBpZD1cImRhdGVwaWNrZXItZW5kLScgKyB0aGlzLmNvdW50ZXIgKyAnXCIgc2l6ZT1cIjE2XCIgdHlwZT1cInRleHRcIiByZWFkb25seT48c3BhbiBjbGFzcz1cImFkZC1vblwiPjxpIGNsYXNzPVwiaWNvbi10aFwiPjwvaT48L3NwYW4+Jm5ic3A7PGlucHV0IGlkPVwiZGF0ZXBpY2tlci1lbmQtJyArIHRoaXMuY291bnRlciArICctb25nb2luZ1wiIHR5cGU9XCJjaGVja2JveFwiPiZuYnNwO09uZ29pbmc8L2Rpdj48L3RkPjx0ZD48aW5wdXQgaWQ9XCJsYWJlbC0nICsgdGhpcy5jb3VudGVyICsgJ1wiIHR5cGU9XCJ0ZXh0XCI+PC90ZD48L3RyPidcblx0XHQpO1xuXHRcdCQoJyNkYXRlcGlja2VyLXN0YXJ0LScgKyB0aGlzLmNvdW50ZXIgKyAnLCNkYXRlcGlja2VyLWVuZC0nICsgdGhpcy5jb3VudGVyKS5kYXRlcGlja2VyKHtmb3JtYXQ6IFwieXl5eS1tbS1kZFwifSk7XG5cdH07XG5cblx0dGhpcy5zZXJpYWxpemUgPSBmdW5jdGlvbigpIHtcblx0XHR2YXIgb2JqID0ge1xuXHRcdFx0XCJ6b29tXCI6IFwiMTAwXCIsXG5cdFx0XHRcImxheW91dFN0ZXBzXCI6IFsxODAsIDM2NV0sXG5cdFx0XHRcInRhc2tzXCI6IFtdXG5cdFx0fTtcblxuXHRcdHZhciB0YXNrcyA9ICQoJy50YXNrJyk7XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0YXNrcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0dmFyIHRhc2sgPSB0YXNrc1tpXTtcblx0XHRcdHZhciBpZCA9IHRhc2suaWQ7XG5cdFx0XHR2YXIgaWROdW0gPSBpZC5yZXBsYWNlKC9edGFzay0vLCBcIlwiKTtcblxuXHRcdFx0dmFyIHN0YXJ0RGF0ZSA9ICQoJyNkYXRlcGlja2VyLXN0YXJ0LScgKyBpZE51bSkuZGF0ZXBpY2tlcihcImdldEZvcm1hdHRlZERhdGVcIik7XG5cdFx0XHR2YXIgZW5kRGF0ZSA9ICQoJyNkYXRlcGlja2VyLWVuZC0nICsgaWROdW0pLmRhdGVwaWNrZXIoXCJnZXRGb3JtYXR0ZWREYXRlXCIpO1xuXHRcdFx0dmFyIGVuZERhdGVPbmdvaW5nID0gJCgnI2RhdGVwaWNrZXItZW5kLScgKyBpZE51bSArICctb25nb2luZycpLnByb3AoJ2NoZWNrZWQnKTsgXG5cdFx0XHRpZiAoZW5kRGF0ZU9uZ29pbmcpIHtcblx0XHRcdFx0ZW5kRGF0ZSA9IFwiLVwiO1xuXHRcdFx0fVxuXHRcdFx0dmFyIGxhYmVsID0gJCgnI2xhYmVsLScgKyBpZE51bSkudmFsKCk7XG5cblx0XHRcdHZhciB0YXNrT2JqID0ge307XG5cdFx0XHR0YXNrT2JqLnN0YXJ0ID0gc3RhcnREYXRlO1xuXHRcdFx0dGFza09iai5lbmQgPSBlbmREYXRlO1xuXHRcdFx0dGFza09iai5sYWJlbCA9IGxhYmVsO1xuXG5cdFx0XHRvYmoudGFza3MucHVzaCh0YXNrT2JqKTtcblx0XHR9XG5cblx0ICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShvYmopO1xuXHR9XG5cblx0dGhpcy5wb3N0ID0gZnVuY3Rpb24oKSB7XG5cdFx0dmFyIGpzb24gPSB0aGlzLnNlcmlhbGl6ZSgpO1xuXHRcdC8vdmFyIGpzb24gPSBcIntcXFwiZW5kXFxcIjpcXFwiLVxcXCIsXFxcInRhc2tzXFxcIjpbe1xcXCJzdGFydFxcXCI6XFxcIjIwMTYtMDEtMDFcXFwiLFxcXCJlbmRcXFwiOlxcXCIyMDE2LTAxLTI1XFxcIixcXFwibGFiZWxcXFwiOlxcXCJUaGUgaG91c2VzIGFyZSBoYXVudGVkXFxcIixcXFwiZW5kVG9cXFwiOlsxXX0se1xcXCJzdGFydFxcXCI6XFxcIjIwMTYtMDItMDFcXFwiLFxcXCJlbmRcXFwiOlxcXCItXFxcIixcXFwibGFiZWxcXFwiOlxcXCJCeSB3aGl0ZSBuaWdodC1nb3duc1xcXCJ9XX1cIjtcblxuXHRcdGNvbnNvbGUubG9nKCdhdHRlbXB0aW5nIHRvIHBvc3Q6ICcgKyBqc29uKTtcblxuXHRcdCQucG9zdChcblx0XHRcdFwiL3RpbWVsaW5lXCIsXG5cdFx0XHRqc29uLFxuXHRcdFx0ZnVuY3Rpb24oZGF0YSkge1xuICBcdFx0XHRcdCQoXCIjcmVzdWx0XCIpLmh0bWwoZGF0YSk7XG4gIFx0XHRcdFx0XG4gIFx0XHRcdFx0aWYgKGpzb24ubGVuZ3RoID09PSAwKSB7XG4gIFx0XHRcdFx0XHQkKCcjc291cmNlJykuY3NzKHtcImRpc3BsYXlcIjogXCJub25lXCJ9KTtcbiAgXHRcdFx0XHRcdHJldHVybjtcbiAgXHRcdFx0XHR9XG4gIFx0XHRcdFx0JChcIiNzb3VyY2VcIikuY3NzKHtcImRpc3BsYXlcIjogXCJibG9ja1wifSk7XG4gIFx0XHRcdFx0JChcIiNzb3VyY2VcIikuaHRtbChqc29uKTtcbiAgXHRcdFx0fSk7XG5cdH07XG59O1xuXG5mdW5jdGlvbiBtYWluRnVuYygpIHtcbiAgdmFyIGFwcCA9IG5ldyBBcHAoKTtcbiAgYXBwLmluaXQoKTtcbn1cblxud2luZG93Lm9ubG9hZCA9IG1haW5GdW5jO1xuIl19
