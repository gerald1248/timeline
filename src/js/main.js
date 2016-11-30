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
