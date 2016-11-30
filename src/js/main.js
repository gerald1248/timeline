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
