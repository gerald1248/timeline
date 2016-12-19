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
    $('#color-picker-frame-border,#color-picker-frame-fill').colorpicker({"format": "hex"});
    $('#color-picker-stripe-dark,#color-picker-stripe-light,#color-picker-grid').colorpicker({"format": "hex"});
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
        '<td><input class="form-control" id="milestones-' + this.counter + '" type="text" placeholder="2001-01-01, ..."></td>' +
        '<td><input class="form-control" id="dateStamps-' + this.counter + '" type="text" placeholder="2001-01-01, ..."></td>' +
        '<td><input class="form-control" id="startTo-' + this.counter + '" type="text" placeholder="1, 2"></td>' +
        '<td><input class="form-control" id="endTo-' + this.counter + '" type="text" placeholder="3, 4"></td>' +
        '<td><input class="form-control" id="recur-' + this.counter + '" type="text" placeholder="7"></td>' +
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
    obj.theme.frameBorderColor = $('#color-picker-frame-border').colorpicker('getValue', '#ffffff');
    obj.theme.frameFillColor = $('#color-picker-frame-fill').colorpicker('getValue', '#ffffff');
    obj.theme.stripeColorDark = $('#color-picker-stripe-dark').colorpicker('getValue', '#ffffff');
    obj.theme.stripeColorLight = $('#color-picker-stripe-light').colorpicker('getValue', '#ffffff');
    obj.theme.stripeGridColor = $('#color-picker-grid').colorpicker('getValue', '#ffffff');

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
      $('#color-picker-frame-border').colorpicker('setValue', theme.frameBorderColor);
      $('#color-picker-frame-fill').colorpicker('setValue', theme.frameFillColor);
      $('#color-picker-stripe-dark').colorpicker('setValue', theme.stripeColorDark);
      $('#color-picker-stripe-light').colorpicker('setValue', theme.stripeColorLight);
      $('#color-picker-grid').colorpicker('setValue', theme.gridColor);
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiXSwibmFtZXMiOlsibWFpbkZ1bmMiLCJhcHAiLCJBcHAiLCJpbml0IiwidGhpcyIsImNvdW50ZXIiLCJzZWxmIiwiYWRkUm93IiwiJCIsIm9uIiwicG9zdCIsImNvbG9ycGlja2VyIiwiZm9ybWF0IiwiZGF0ZXBpY2tlciIsImNzcyIsImRpc3BsYXkiLCJpbXBvcnQiLCJhZGRUYWJsZUJ1dHRvbkhhbmRsZXJzIiwiY2xpcGJvYXJkIiwiQ2xpcGJvYXJkIiwiZSIsImZvY3VzIiwiYXJyIiwiaSIsImxlbmd0aCIsInVuYmluZCIsInVwIiwiaWQiLCJkb3duIiwiZGVsZXRlIiwic2V0Rm9jdXMiLCJhcHBlbmQiLCJzZXJpYWxpemUiLCJvYmoiLCJzZXR0aW5ncyIsInRhc2tzIiwidGhlbWUiLCJmcmFtZUJvcmRlckNvbG9yIiwiZnJhbWVGaWxsQ29sb3IiLCJzdHJpcGVDb2xvckRhcmsiLCJzdHJpcGVDb2xvckxpZ2h0IiwiZ3JpZENvbG9yIiwidGFzayIsImlkTnVtIiwicmVwbGFjZSIsInN0YXJ0RGF0ZSIsImVuZERhdGUiLCJlbmREYXRlT25nb2luZyIsInByb3AiLCJsYWJlbCIsInZhbCIsInRhc2tPYmoiLCJzdGFydCIsImVuZCIsInB1c2giLCJzZXR0aW5nRW5kRGF0ZU9uZ29pbmciLCJ6b29tVmFsIiwiTnVtYmVyIiwiem9vbSIsImhpZGVEYXlzRnJvbVZhbCIsImhpZGVEYXlzRnJvbSIsImhpZGVEYXlzRnJvVmFsIiwiaGlkZVdlZWtzRnJvbVZhbCIsImhpZGVXZWVrc0Zyb20iLCJjb2xvclNjaGVtZVZhbCIsImNvbG9yU2NoZW1lIiwiYm9yZGVyQ29sb3IxIiwiZmlsbENvbG9yMSIsImJvcmRlckNvbG9yMiIsImZpbGxDb2xvcjIiLCJzdHJpcGVHcmlkQ29sb3IiLCJKU09OIiwic3RyaW5naWZ5IiwianNvbiIsImRhdGEiLCJodG1sIiwidmFsdWUiLCJyb3dJZCIsInByZXYiLCJiZWZvcmUiLCJuZXh0IiwiYWZ0ZXIiLCJyZW1vdmUiLCJzIiwicGFyc2UiLCJpbm5lckhUTUwiLCJtZXNzYWdlIiwiY2xlYXJUYXNrcyIsIm9uZ29pbmciLCJ3aW5kb3ciLCJvbmxvYWQiXSwibWFwcGluZ3MiOiJBQXFQQSxRQUFBQSxZQUNBLEdBQUFDLEdBQUEsR0FBQUMsSUFDQUQsR0FBQUUsT0F2UEEsR0FBQUQsS0FBQSxXQUNBRSxLQUFBQyxRQUFBLEVBQ0FELEtBQUFELEtBQUEsV0FDQSxHQUFBRyxHQUFBRixJQUNBQSxNQUFBRyxRQUFBLEdBQ0FDLEVBQUEsb0JBQUFDLEdBQUEsUUFBQSxXQUNBSCxFQUFBQyxRQUFBLEtBRUFDLEVBQUEseUJBQUFDLEdBQUEsUUFBQSxXQUNBSCxFQUFBSSxTQUVBRixFQUFBLCtDQUFBRyxhQUFBQyxPQUFBLFFBQ0FKLEVBQUEsK0NBQUFHLGFBQUFDLE9BQUEsUUFDQUosRUFBQSx1REFBQUcsYUFBQUMsT0FBQSxRQUNBSixFQUFBLDJFQUFBRyxhQUFBQyxPQUFBLFFBQ0FKLEVBQUEsbUJBQUFLLFlBQUFELE9BQUEsZUFDQUosRUFBQSxlQUFBTSxLQUFBQyxRQUFBLFNBQ0FQLEVBQUEsd0JBQUFDLEdBQUEsUUFBQSxXQUNBSCxFQUFBVSxXQUVBWixLQUFBYSx5QkFFQWIsS0FBQWMsVUFBQSxHQUFBQyxXQUFBLGdCQUNBZixLQUFBYyxVQUFBVCxHQUFBLFFBQUEsU0FBQVcsTUFNQVosRUFBQSxpQkFBQUMsR0FBQSxpQkFBQSxXQUNBRCxFQUFBLGlCQUFBYSxXQUlBakIsS0FBQWEsdUJBQUEsV0FHQSxJQUFBLEdBRkFYLEdBQUFGLEtBQ0FrQixHQUFBLFlBQUEsY0FBQSxpQkFDQUMsRUFBQSxFQUFBQSxFQUFBRCxFQUFBRSxPQUFBRCxJQUNBZixFQUFBLElBQUFjLEVBQUFDLElBQUFFLE9BQUEsUUFFQWpCLEdBQUEsY0FBQUMsR0FBQSxRQUFBLFdBQ0FILEVBQUFvQixHQUFBdEIsS0FBQXVCLE1BRUFuQixFQUFBLGdCQUFBQyxHQUFBLFFBQUEsV0FDQUgsRUFBQXNCLEtBQUF4QixLQUFBdUIsTUFFQW5CLEVBQUEsa0JB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RUFBQUcsaUJBQ0EvQixFQUFBLDhCQUFBRyxZQUFBLFdBQUF5QixFQUFBSSxrQkFDQWhDLEVBQUEsc0JBQUFHLFlBQUEsV0FBQXlCLEVBQUFLLGFBSUFyQyxLQUFBbUYsV0FBQSxXQUNBL0UsRUFBQSxvQkFBQSxHQUFBNkUsVUFBQSxJQVNBSSxRQUFBQyxPQUFBMUYiLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsidmFyIEFwcCA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLmNvdW50ZXIgPSAwO1xuICB0aGlzLmluaXQgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdGhpcy5hZGRSb3coZmFsc2UpO1xuICAgICQoJyNhZGQtdGFzay1idXR0b24nKS5vbignY2xpY2snLCBmdW5jdGlvbigpIHtcbiAgICAgIHNlbGYuYWRkUm93KHRydWUpO1xuICAgIH0pO1xuICAgICQoJyNzaG93LXRpbWVsaW5lLWJ1dHRvbicpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCkge1xuICAgICAgc2VsZi5wb3N0KCk7XG4gICAgfSk7XG4gICAgJCgnI2NvbG9yLXBpY2tlci1ib3JkZXItMSwjY29sb3ItcGlja2VyLWZpbGwtMScpLmNvbG9ycGlja2VyKHtcImZvcm1hdFwiOiBcImhleFwifSk7XG4gICAgJCgnI2NvbG9yLXBpY2tlci1ib3JkZXItMiwjY29sb3ItcGlja2VyLWZpbGwtMicpLmNvbG9ycGlja2VyKHtcImZvcm1hdFwiOiBcImhleFwifSk7XG4gICAgJCgnI2NvbG9yLXBpY2tlci1mcmFtZS1ib3JkZXIsI2NvbG9yLXBpY2tlci1mcmFtZS1maWxsJykuY29sb3JwaWNrZXIoe1wiZm9ybWF0XCI6IFwiaGV4XCJ9KTtcbiAgICAkKCcjY29sb3ItcGlja2VyLXN0cmlwZS1kYXJrLCNjb2xvci1waWNrZXItc3RyaXBlLWxpZ2h0LCNjb2xvci1waWNrZXItZ3JpZCcpLmNvbG9ycGlja2VyKHtcImZvcm1hdFwiOiBcImhleFwifSk7XG4gICAgJCgnI2RhdGVwaWNrZXItZW5kJykuZGF0ZXBpY2tlcih7Zm9ybWF0OiBcInl5eXktbW0tZGRcIn0pO1xuICAgICQoJyNzb3VyY2UtZGl2JykuY3NzKHtcImRpc3BsYXlcIjogXCJub25lXCJ9KTtcbiAgICAkKCcjbW9kYWwtYWN0aW9uLWJ1dHRvbicpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCkge1xuICAgICAgc2VsZi5pbXBvcnQoKTtcbiAgICB9KTtcbiAgICB0aGlzLmFkZFRhYmxlQnV0dG9uSGFuZGxlcnMoKTtcblxuICAgIHRoaXMuY2xpcGJvYXJkID0gbmV3IENsaXBib2FyZCgnI2NvcHktYnV0dG9uJyk7XG4gICAgdGhpcy5jbGlwYm9hcmQub24oJ2Vycm9yJywgZnVuY3Rpb24oZSkge1xuICAgICAgLy9UT0RPOiBDdHJsK0MgbWVzc2FnZSBmYWxsYmFja1xuICAgIH0pO1xuXG4gICAgLy9rZXlib2FyZCBmb2N1cyBvbiB0ZXh0YXJlYSBmb3IgcXVpY2sgcGFzdGUgYWN0aW9uXG4gICAgLy9ub3QgYWxsb3dlZCB0byByZWFkIGZyb20gY2xpcGJvYXJkXG4gICAgJCgnI2ltcG9ydC1tb2RhbCcpLm9uKCdzaG93bi5icy5tb2RhbCcsIGZ1bmN0aW9uKCkge1xuICAgICAgJCgnI21vZGFsLXNvdXJjZScpLmZvY3VzKCk7XG4gICAgfSk7XG4gIH07XG5cbiAgdGhpcy5hZGRUYWJsZUJ1dHRvbkhhbmRsZXJzID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHZhciBhcnIgPSBbJ3VwLWJ1dHRvbicsICdkb3duLWJ1dHRvbicsICdkZWxldGUtYnV0dG9uJ107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcnIubGVuZ3RoOyBpKyspIHtcbiAgICAgICQoJy4nICsgYXJyW2ldKS51bmJpbmQoJ2NsaWNrJyk7XG4gICAgfVxuICAgICQoJy51cC1idXR0b24nKS5vbignY2xpY2snLCBmdW5jdGlvbigpIHtcbiAgICAgIHNlbGYudXAodGhpcy5pZCk7XG4gICAgfSk7XG4gICAgJCgnLmRvd24tYnV0dG9uJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKSB7XG4gICAgICBzZWxmLmRvd24odGhpcy5pZCk7XG4gICAgfSk7XG4gICAgJCgnLmRlbGV0ZS1idXR0b24nKS5vbignY2xpY2snLCBmdW5jdGlvbigpIHtcbiAgICAgIHNlbGYuZGVsZXRlKHRoaXMuaWQpO1xuICAgIH0pO1xuICB9O1xuXG4gIHRoaXMuYWRkUm93ID0gZnVuY3Rpb24oc2V0Rm9jdXMpIHtcbiAgICB0aGlzLmNvdW50ZXIrKztcbiAgICAkKCcjdGFzay10YWJsZS1ib2R5JykuYXBwZW5kKFxuICAgICAgICAnPHRyIGNsYXNzPVwidGFza1wiIGlkPVwidGFzay0nICsgdGhpcy5jb3VudGVyICsgJ1wiPicgK1xuICAgICAgICAnPHRkPjxkaXYgY2xhc3M9XCJpbnB1dC1hcHBlbmQgZGF0ZVwiPjxpbnB1dCBjbGFzcz1cImZvcm0tY29udHJvbFwiIGlkPVwiZGF0ZXBpY2tlci1zdGFydC0nICsgdGhpcy5jb3VudGVyICsgJ1wiIHNpemU9XCIxNlwiIHR5cGU9XCJ0ZXh0XCIgcmVhZG9ubHk+PHNwYW4gY2xhc3M9XCJhZGQtb25cIj48aSBjbGFzcz1cImljb24tdGhcIj48L2k+PC9zcGFuPjwvZGl2PjwvdGQ+JyArXG4gICAgICAgICc8dGQ+PGRpdiBjbGFzcz1cImlucHV0LWFwcGVuZCBkYXRlXCI+PGlucHV0IGNsYXNzPVwiZm9ybS1jb250cm9sXCIgaWQ9XCJkYXRlcGlja2VyLWVuZC0nICsgdGhpcy5jb3VudGVyICsgJ1wiIHNpemU9XCIxNlwiIHR5cGU9XCJ0ZXh0XCIgcmVhZG9ubHk+PHNwYW4gY2xhc3M9XCJhZGQtb25cIj48aSBjbGFzcz1cImljb24tdGhcIj48L2k+PC9zcGFuPjwvdGQ+JyArXG4gICAgICAgICc8dGQ+PGRpdiBjbGFzcz1cImNoZWNrYm94XCI+PGxhYmVsPjxpbnB1dCBpZD1cImRhdGVwaWNrZXItZW5kLScgKyB0aGlzLmNvdW50ZXIgKyAnLW9uZ29pbmdcIiB0eXBlPVwiY2hlY2tib3hcIj4mbmJzcDtPbmdvaW5nPC9sYWJlbD48L2Rpdj48L3RkPicgK1xuICAgICAgICAnPHRkPjxpbnB1dCBjbGFzcz1cImZvcm0tY29udHJvbFwiIGlkPVwibGFiZWwtJyArIHRoaXMuY291bnRlciArICdcIiB0eXBlPVwidGV4dFwiPjwvdGQ+JyArXG4gICAgICAgICc8dGQ+PGlucHV0IGNsYXNzPVwiZm9ybS1jb250cm9sXCIgaWQ9XCJtaWxlc3RvbmVzLScgKyB0aGlzLmNvdW50ZXIgKyAnXCIgdHlwZT1cInRleHRcIiBwbGFjZWhvbGRlcj1cIjIwMDEtMDEtMDEsIC4uLlwiPjwvdGQ+JyArXG4gICAgICAgICc8dGQ+PGlucHV0IGNsYXNzPVwiZm9ybS1jb250cm9sXCIgaWQ9XCJkYXRlU3RhbXBzLScgKyB0aGlzLmNvdW50ZXIgKyAnXCIgdHlwZT1cInRleHRcIiBwbGFjZWhvbGRlcj1cIjIwMDEtMDEtMDEsIC4uLlwiPjwvdGQ+JyArXG4gICAgICAgICc8dGQ+PGlucHV0IGNsYXNzPVwiZm9ybS1jb250cm9sXCIgaWQ9XCJzdGFydFRvLScgKyB0aGlzLmNvdW50ZXIgKyAnXCIgdHlwZT1cInRleHRcIiBwbGFjZWhvbGRlcj1cIjEsIDJcIj48L3RkPicgK1xuICAgICAgICAnPHRkPjxpbnB1dCBjbGFzcz1cImZvcm0tY29udHJvbFwiIGlkPVwiZW5kVG8tJyArIHRoaXMuY291bnRlciArICdcIiB0eXBlPVwidGV4dFwiIHBsYWNlaG9sZGVyPVwiMywgNFwiPjwvdGQ+JyArXG4gICAgICAgICc8dGQ+PGlucHV0IGNsYXNzPVwiZm9ybS1jb250cm9sXCIgaWQ9XCJyZWN1ci0nICsgdGhpcy5jb3VudGVyICsgJ1wiIHR5cGU9XCJ0ZXh0XCIgcGxhY2Vob2xkZXI9XCI3XCI+PC90ZD4nICtcbiAgICAgICAgJzx0ZD48YnV0dG9uIGNsYXNzPVwidXAtYnV0dG9uIGJ0biBidG4tZGVmYXVsdFwiIGlkPVwidXAtYnV0dG9uLScgKyB0aGlzLmNvdW50ZXIgKyAnXCI+JnVhcnI7PC9idXR0b24+PC90ZD4nICtcbiAgICAgICAgJzx0ZD48YnV0dG9uIGNsYXNzPVwiZG93bi1idXR0b24gYnRuIGJ0bi1kZWZhdWx0XCIgaWQ9XCJkb3duLWJ1dHRvbi0nICsgdGhpcy5jb3VudGVyICsgJ1wiPiZkYXJyOzwvYnV0dG9uPjwvdGQ+JyArXG4gICAgICAgICc8dGQ+PGJ1dHRvbiBjbGFzcz1cImRlbGV0ZS1idXR0b24gYnRuIGJ0bi1kZWZhdWx0XCIgaWQ9XCJkZWxldGUtYnV0dG9uLScgKyB0aGlzLmNvdW50ZXIgKyAnXCI+JmNyb3NzOzwvYnV0dG9uPjwvdGQ+JyArXG4gICAgICAgICc8L3RyPidcbiAgICAgICAgKTtcbiAgICAkKCcjZGF0ZXBpY2tlci1zdGFydC0nICsgdGhpcy5jb3VudGVyICsgJywjZGF0ZXBpY2tlci1lbmQtJyArIHRoaXMuY291bnRlcikuZGF0ZXBpY2tlcih7Zm9ybWF0OiBcInl5eXktbW0tZGRcIn0pO1xuXG4gICAgaWYgKHNldEZvY3VzKSB7XG4gICAgICAkKCcjZGF0ZXBpY2tlci1zdGFydC0nICsgdGhpcy5jb3VudGVyKS5mb2N1cygpO1xuICAgIH1cblxuICAgIHRoaXMuYWRkVGFibGVCdXR0b25IYW5kbGVycygpO1xuXG4gICAgcmV0dXJuIHRoaXMuY291bnRlcjtcbiAgfTtcblxuICB0aGlzLnNlcmlhbGl6ZSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBvYmogPSB7XG4gICAgICBcInNldHRpbmdzXCI6IHtcblxuICAgICAgfSxcbiAgICAgIFwidGFza3NcIjogW10sXG4gICAgICBcInRoZW1lXCI6IHtcbiAgICAgICAgXCJmcmFtZUJvcmRlckNvbG9yXCI6IFwiI2ZmZmZmZlwiLFxuICAgICAgICBcImZyYW1lRmlsbENvbG9yXCI6IFwiIzg4ODg4OFwiLFxuICAgICAgICBcInN0cmlwZUNvbG9yRGFya1wiOiBcIiNkZGRkZGRcIixcbiAgICAgICAgXCJzdHJpcGVDb2xvckxpZ2h0XCI6IFwiI2VlZWVlZVwiLFxuICAgICAgICBcImdyaWRDb2xvclwiOiBcIiM5OTk5OTlcIlxuICAgICAgfVxuICAgIH07XG5cbiAgICAvL3Rhc2tzXG4gICAgdmFyIHRhc2tzID0gJCgnLnRhc2snKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRhc2tzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgdGFzayA9IHRhc2tzW2ldO1xuICAgICAgdmFyIGlkID0gdGFzay5pZDtcbiAgICAgIHZhciBpZE51bSA9IGlkLnJlcGxhY2UoL150YXNrLS8sIFwiXCIpO1xuXG4gICAgICB2YXIgc3RhcnREYXRlID0gJCgnI2RhdGVwaWNrZXItc3RhcnQtJyArIGlkTnVtKS5kYXRlcGlja2VyKFwiZ2V0Rm9ybWF0dGVkRGF0ZVwiKTtcbiAgICAgIHZhciBlbmREYXRlID0gJCgnI2RhdGVwaWNrZXItZW5kLScgKyBpZE51bSkuZGF0ZXBpY2tlcihcImdldEZvcm1hdHRlZERhdGVcIik7XG4gICAgICB2YXIgZW5kRGF0ZU9uZ29pbmcgPSAkKCcjZGF0ZXBpY2tlci1lbmQtJyArIGlkTnVtICsgJy1vbmdvaW5nJykucHJvcCgnY2hlY2tlZCcpOyBcbiAgICAgIGlmIChlbmREYXRlT25nb2luZykge1xuICAgICAgICBlbmREYXRlID0gXCItXCI7XG4gICAgICB9XG4gICAgICB2YXIgbGFiZWwgPSAkKCcjbGFiZWwtJyArIGlkTnVtKS52YWwoKTtcblxuICAgICAgdmFyIHRhc2tPYmogPSB7fTtcbiAgICAgIHRhc2tPYmouc3RhcnQgPSBzdGFydERhdGU7XG4gICAgICB0YXNrT2JqLmxhYmVsID0gbGFiZWw7XG5cbiAgICAgIC8vZW5kIGlzIG9wdGlvbmFsIC0gbm90IHN1cHBseWluZyBlbmQgaXMgcGVyZmVjdGx5IHZhbGlkXG4gICAgICAvLy0gc2lnbmlmaWVzICd0b2RheScgc28gdHJlYXRpbmcgJ2JsYW5rJyBhcyBzaWduaWZpY2FudCBpcyBoZWxwZnVsIGhlcmVcbiAgICAgIGlmIChlbmREYXRlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgdGFza09iai5lbmQgPSBlbmREYXRlO1xuICAgICAgfVxuXG4gICAgICBvYmoudGFza3MucHVzaCh0YXNrT2JqKTtcbiAgICB9XG5cbiAgICAvL3NldHRpbmdzIC0gZW5mb3JjZSBzYW5lIHZhbHVlc1xuICAgIC8vVE9ETzogdXNlIHNjaGVtYSBsaW1pdHNcbiAgICBvYmouc2V0dGluZ3MuZW5kID0gJCgnI2RhdGVwaWNrZXItZW5kJykuZGF0ZXBpY2tlcihcImdldEZvcm1hdHRlZERhdGVcIik7XG4gICAgdmFyIHNldHRpbmdFbmREYXRlT25nb2luZyA9ICQoJyNkYXRlcGlja2VyLWVuZC1vbmdvaW5nJykucHJvcCgnY2hlY2tlZCcpO1xuICAgIGlmIChzZXR0aW5nRW5kRGF0ZU9uZ29pbmcpIHtcbiAgICAgIG9iai5zZXR0aW5ncy5lbmQgPSBcIi1cIjtcbiAgICB9XG4gICAgdmFyIHpvb21WYWwgPSBOdW1iZXIoJCgnI3pvb20taW5wdXQnKS52YWwoKSk7XG4gICAgb2JqLnNldHRpbmdzLnpvb20gPSAoem9vbVZhbCA+PSA1MCAmJiB6b29tVmFsIDw9IDMwMCkgPyB6b29tVmFsIDogMTUwO1xuICAgIHZhciBoaWRlRGF5c0Zyb21WYWwgPSBOdW1iZXIoJCgnI2hpZGUtZGF5cy1mcm9tLWlucHV0JykudmFsKCkpO1xuICAgIG9iai5zZXR0aW5ncy5oaWRlRGF5c0Zyb20gPSAoaGlkZURheXNGcm9tVmFsID49IDEgJiYgaGlkZURheXNGcm9tVmFsIDw9IDM2NSkgPyBoaWRlRGF5c0Zyb1ZhbCA6IDkwO1xuICAgIHZhciBoaWRlV2Vla3NGcm9tVmFsID0gTnVtYmVyKCQoJyNoaWRlLXdlZWtzLWZyb20taW5wdXQnKS52YWwoKSk7XG4gICAgb2JqLnNldHRpbmdzLmhpZGVXZWVrc0Zyb20gPSAoaGlkZVdlZWtzRnJvbVZhbCA+PSAxICYmIGhpZGVXZWVrc0Zyb21WYWwgPD0gMTQ2MCkgPyBoaWRlV2Vla3NGcm9tVmFsIDogMTgwO1xuXG4gICAgLy90aGVtZVxuICAgIHZhciBjb2xvclNjaGVtZVZhbCA9ICQoJyNjb2xvci1zY2hlbWUtc2VsZWN0JykudmFsKCk7XG4gICAgb2JqLnRoZW1lLmNvbG9yU2NoZW1lID0gKGNvbG9yU2NoZW1lVmFsLmxlbmd0aCA+IDApID8gY29sb3JTY2hlbWVWYWwgOiBcImdyYWRpZW50XCI7XG4gICAgb2JqLnRoZW1lLmJvcmRlckNvbG9yMSA9ICQoJyNjb2xvci1waWNrZXItYm9yZGVyLTEnKS5jb2xvcnBpY2tlcignZ2V0VmFsdWUnLCAnI2ZmZmZmZicpO1xuICAgIG9iai50aGVtZS5maWxsQ29sb3IxID0gJCgnI2NvbG9yLXBpY2tlci1maWxsLTEnKS5jb2xvcnBpY2tlcignZ2V0VmFsdWUnLCAnI2ZmZmZmZicpO1xuICAgIG9iai50aGVtZS5ib3JkZXJDb2xvcjIgPSAkKCcjY29sb3ItcGlja2VyLWJvcmRlci0yJykuY29sb3JwaWNrZXIoJ2dldFZhbHVlJywgJyNmZmZmZmYnKTtcbiAgICBvYmoudGhlbWUuZmlsbENvbG9yMiA9ICQoJyNjb2xvci1waWNrZXItZmlsbC0yJykuY29sb3JwaWNrZXIoJ2dldFZhbHVlJywgJyNmZmZmZmYnKTtcbiAgICBvYmoudGhlbWUuZnJhbWVCb3JkZXJDb2xvciA9ICQoJyNjb2xvci1waWNrZXItZnJhbWUtYm9yZGVyJykuY29sb3JwaWNrZXIoJ2dldFZhbHVlJywgJyNmZmZmZmYnKTtcbiAgICBvYmoudGhlbWUuZnJhbWVGaWxsQ29sb3IgPSAkKCcjY29sb3ItcGlja2VyLWZyYW1lLWZpbGwnKS5jb2xvcnBpY2tlcignZ2V0VmFsdWUnLCAnI2ZmZmZmZicpO1xuICAgIG9iai50aGVtZS5zdHJpcGVDb2xvckRhcmsgPSAkKCcjY29sb3ItcGlja2VyLXN0cmlwZS1kYXJrJykuY29sb3JwaWNrZXIoJ2dldFZhbHVlJywgJyNmZmZmZmYnKTtcbiAgICBvYmoudGhlbWUuc3RyaXBlQ29sb3JMaWdodCA9ICQoJyNjb2xvci1waWNrZXItc3RyaXBlLWxpZ2h0JykuY29sb3JwaWNrZXIoJ2dldFZhbHVlJywgJyNmZmZmZmYnKTtcbiAgICBvYmoudGhlbWUuc3RyaXBlR3JpZENvbG9yID0gJCgnI2NvbG9yLXBpY2tlci1ncmlkJykuY29sb3JwaWNrZXIoJ2dldFZhbHVlJywgJyNmZmZmZmYnKTtcblxuICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShvYmopO1xuICB9XG5cbiAgdGhpcy5wb3N0ID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGpzb24gPSB0aGlzLnNlcmlhbGl6ZSgpO1xuICAgICQucG9zdChcbiAgICAgICAgXCIvdGltZWxpbmVcIixcbiAgICAgICAganNvbixcbiAgICAgICAgZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICQoXCIjcmVzdWx0XCIpLmh0bWwoZGF0YSk7XG5cbiAgICAgICAgICBpZiAoanNvbi5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICQoJyNzb3VyY2UtZGl2JykuY3NzKHtcImRpc3BsYXlcIjogXCJub25lXCJ9KTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgICAgJChcIiNzb3VyY2UtZGl2XCIpLmNzcyh7XCJkaXNwbGF5XCI6IFwiYmxvY2tcIn0pO1xuICAgICAgICAgICQoXCIjc291cmNlXCIpWzBdLnZhbHVlID0ganNvbjtcbiAgICAgICAgfVxuICAgICAgICApO1xuICB9O1xuXG4gIHRoaXMudXAgPSBmdW5jdGlvbihpZCkge1xuICAgIHZhciByb3dJZCA9IGlkLnJlcGxhY2UoL151cC1idXR0b24vLCAnI3Rhc2snKTtcbiAgICAkKHJvd0lkKS5wcmV2KCkuYmVmb3JlKCQocm93SWQpKTtcbiAgICB0aGlzLmFkZFRhYmxlQnV0dG9uSGFuZGxlcnMoKTtcbiAgfTtcblxuICB0aGlzLmRvd24gPSBmdW5jdGlvbihpZCkge1xuICAgIHZhciByb3dJZCA9IGlkLnJlcGxhY2UoL15kb3duLWJ1dHRvbi8sICcjdGFzaycpO1xuICAgICQocm93SWQpLm5leHQoKS5hZnRlcigkKHJvd0lkKSk7XG4gICAgdGhpcy5hZGRUYWJsZUJ1dHRvbkhhbmRsZXJzKCk7XG4gIH07XG5cbiAgdGhpcy5kZWxldGUgPSBmdW5jdGlvbihpZCkge1xuICAgIHZhciByb3dJZCA9IGlkLnJlcGxhY2UoL15kZWxldGUtYnV0dG9uLywgJyN0YXNrJyk7XG4gICAgJChyb3dJZCkucmVtb3ZlKCk7XG4gICAgdGhpcy5hZGRUYWJsZUJ1dHRvbkhhbmRsZXJzKCk7XG4gIH07XG5cbiAgdGhpcy5pbXBvcnQgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgcyA9ICQoJyNtb2RhbC1zb3VyY2UnKVswXS52YWx1ZTtcbiAgICB0cnkge1xuICAgICAgdmFyIG9iaiA9IEpTT04ucGFyc2Uocyk7XG4gICAgfSBjYXRjaChlKSB7XG4gICAgICAkKCcjcmVzdWx0JylbMF0uaW5uZXJIVE1MID0gZS5tZXNzYWdlO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChvYmogPT09IHt9IHx8IG9iaiA9PT0gbnVsbCB8fCB0eXBlb2Yob2JqKSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICQoJyNyZXN1bHQnKVswXS5pbm5lckhUTUwgPSBcIk5vIHRpbWVsaW5lIGRhdGEgZm91bmRcIjtcbiAgICB9XG5cbiAgICB0aGlzLmNsZWFyVGFza3MoKTtcbiAgICBpZiAob2JqLnRhc2tzKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG9iai50YXNrcy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgdGFzayA9IG9iai50YXNrc1tpXVxuICAgICAgICAgIHZhciBjb3VudGVyID0gdGhpcy5hZGRSb3coZmFsc2UpO1xuXG4gICAgICAgICQoJyNkYXRlcGlja2VyLXN0YXJ0LScgKyBjb3VudGVyKS5kYXRlcGlja2VyKCd1cGRhdGUnLCB0YXNrLnN0YXJ0KTtcblxuICAgICAgICB2YXIgb25nb2luZyA9ICh0YXNrLmVuZCA9PT0gXCItXCIpO1xuICAgICAgICAkKCcjZGF0ZXBpY2tlci1lbmQtJyArIGNvdW50ZXIpLmRhdGVwaWNrZXIoJ3VwZGF0ZScsIChvbmdvaW5nKSA/IFwiXCIgOiB0YXNrLmVuZCk7XG4gICAgICAgICQoJyNkYXRlcGlja2VyLWVuZC0nICsgY291bnRlciArICctb25nb2luZycpLnByb3AoJ2NoZWNrZWQnLCBvbmdvaW5nKTtcbiAgICAgICAgJCgnI2xhYmVsLScgKyBjb3VudGVyKS52YWwodGFzay5sYWJlbCk7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChvYmouc2V0dGluZ3MpIHtcbiAgICAgIHZhciBzZXR0aW5ncyA9IG9iai5zZXR0aW5nc1xuICAgICAgICB2YXIgb25nb2luZyA9IChzZXR0aW5ncy5lbmQgPT09IFwiLVwiKTtcbiAgICAgICQoJyNkYXRlcGlja2VyLWVuZCcpLmRhdGVwaWNrZXIoJ3VwZGF0ZScsIChvbmdvaW5nKSA/IFwiXCIgOiBzZXR0aW5ncy5lbmQpO1xuICAgICAgJCgnI2RhdGVwaWNrZXItZW5kLW9uZ29pbmcnKS5wcm9wKCdjaGVja2VkJywgb25nb2luZyk7XG4gICAgICAkKCcjem9vbS1pbnB1dCcpLnZhbChzZXR0aW5ncy56b29tKTtcbiAgICAgICQoJyNoaWRlLWRheXMtZnJvbS1pbnB1dCcpLnZhbChzZXR0aW5ncy5oaWRlRGF5c0Zyb20pO1xuICAgICAgJCgnI2hpZGUtd2Vla3MtZnJvbS1pbnB1dCcpLnZhbChzZXR0aW5ncy5oaWRlV2Vla3NGcm9tKTtcbiAgICB9XG4gICAgaWYgKG9iai50aGVtZSkge1xuICAgICAgdmFyIHRoZW1lID0gb2JqLnRoZW1lO1xuICAgICAgJCgnI2NvbG9yLXNjaGVtZS1zZWxlY3QnKS52YWwodGhlbWUuY29sb3JTY2hlbWUpO1xuICAgICAgJCgnI2NvbG9yLXBpY2tlci1ib3JkZXItMScpLmNvbG9ycGlja2VyKCdzZXRWYWx1ZScsIHRoZW1lLmJvcmRlckNvbG9yMSk7XG4gICAgICAkKCcjY29sb3ItcGlja2VyLWZpbGwtMScpLmNvbG9ycGlja2VyKCdzZXRWYWx1ZScsIHRoZW1lLmZpbGxDb2xvcjEpO1xuICAgICAgJCgnI2NvbG9yLXBpY2tlci1ib3JkZXItMicpLmNvbG9ycGlja2VyKCdzZXRWYWx1ZScsIHRoZW1lLmJvcmRlckNvbG9yMik7XG4gICAgICAkKCcjY29sb3ItcGlja2VyLWZpbGwtMicpLmNvbG9ycGlja2VyKCdzZXRWYWx1ZScsIHRoZW1lLmZpbGxDb2xvcjIpO1xuICAgICAgJCgnI2NvbG9yLXBpY2tlci1mcmFtZS1ib3JkZXInKS5jb2xvcnBpY2tlcignc2V0VmFsdWUnLCB0aGVtZS5mcmFtZUJvcmRlckNvbG9yKTtcbiAgICAgICQoJyNjb2xvci1waWNrZXItZnJhbWUtZmlsbCcpLmNvbG9ycGlja2VyKCdzZXRWYWx1ZScsIHRoZW1lLmZyYW1lRmlsbENvbG9yKTtcbiAgICAgICQoJyNjb2xvci1waWNrZXItc3RyaXBlLWRhcmsnKS5jb2xvcnBpY2tlcignc2V0VmFsdWUnLCB0aGVtZS5zdHJpcGVDb2xvckRhcmspO1xuICAgICAgJCgnI2NvbG9yLXBpY2tlci1zdHJpcGUtbGlnaHQnKS5jb2xvcnBpY2tlcignc2V0VmFsdWUnLCB0aGVtZS5zdHJpcGVDb2xvckxpZ2h0KTtcbiAgICAgICQoJyNjb2xvci1waWNrZXItZ3JpZCcpLmNvbG9ycGlja2VyKCdzZXRWYWx1ZScsIHRoZW1lLmdyaWRDb2xvcik7XG4gICAgfVxuICB9O1xuXG4gIHRoaXMuY2xlYXJUYXNrcyA9IGZ1bmN0aW9uKCkge1xuICAgICQoJyN0YXNrLXRhYmxlLWJvZHknKVswXS5pbm5lckhUTUwgPSAnJztcbiAgfTtcbn07XG5cbmZ1bmN0aW9uIG1haW5GdW5jKCkge1xuICB2YXIgYXBwID0gbmV3IEFwcCgpO1xuICBhcHAuaW5pdCgpO1xufVxuXG53aW5kb3cub25sb2FkID0gbWFpbkZ1bmM7XG4iXX0=
