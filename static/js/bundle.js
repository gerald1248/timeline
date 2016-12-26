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
    $('.ongoing-checkbox').on('click', function() {
      self.toggleOngoing(this.id);
    })
  };

  this.addRow = function(setFocus) {
    this.counter++;
    $('#task-table-body').append(
        '<tr class="task" id="task-' + this.counter + '">' +
        '<td><div class="input-append date"><input class="form-control" id="datepicker-start-' + this.counter + '" size="16" type="text" readonly><span class="add-on"><i class="icon-th"></i></span></div></td>' +
        '<td><div class="input-append date"><input class="form-control" id="datepicker-end-' + this.counter + '" size="16" type="text" readonly><span class="add-on"><i class="icon-th"></i></span></td>' +
        '<td><div class="checkbox"><label><input class="ongoing-checkbox" id="datepicker-end-' + this.counter + '-ongoing" type="checkbox">&nbsp;Ongoing</label></div></td>' +
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

  this.toggleOngoing = function(id) {
    var datepickerId = id.replace(/-ongoing$/, '');
    
    //reset field if ongoing is deselected
    //otherwise there would be no way to clear the field
    if ($('#' + id).prop('checked') === false) {
      $('#' + datepickerId).datepicker('update', '');
    }
  }

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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiXSwibmFtZXMiOlsibWFpbkZ1bmMiLCJhcHAiLCJBcHAiLCJpbml0IiwidGhpcyIsImNvdW50ZXIiLCJzZWxmIiwiYWRkUm93IiwiJCIsIm9uIiwicG9zdCIsImNvbG9ycGlja2VyIiwiZm9ybWF0IiwiZGF0ZXBpY2tlciIsImNzcyIsImRpc3BsYXkiLCJpbXBvcnQiLCJhZGRUYWJsZUJ1dHRvbkhhbmRsZXJzIiwiY2xpcGJvYXJkIiwiQ2xpcGJvYXJkIiwiZSIsImZvY3VzIiwiYXJyIiwiaSIsImxlbmd0aCIsInVuYmluZCIsInVwIiwiaWQiLCJkb3duIiwiZGVsZXRlIiwidG9nZ2xlT25nb2luZyIsInNldEZvY3VzIiwiYXBwZW5kIiwic2VyaWFsaXplIiwib2JqIiwic2V0dGluZ3MiLCJ0YXNrcyIsInRoZW1lIiwiZnJhbWVCb3JkZXJDb2xvciIsImZyYW1lRmlsbENvbG9yIiwic3RyaXBlQ29sb3JEYXJrIiwic3RyaXBlQ29sb3JMaWdodCIsImdyaWRDb2xvciIsInRhc2siLCJpZE51bSIsInJlcGxhY2UiLCJzdGFydERhdGUiLCJlbmREYXRlIiwiZW5kRGF0ZU9uZ29pbmciLCJwcm9wIiwibGFiZWwiLCJ2YWwiLCJ0YXNrT2JqIiwic3RhcnQiLCJlbmQiLCJwdXNoIiwic2V0dGluZ0VuZERhdGVPbmdvaW5nIiwiem9vbVZhbCIsIk51bWJlciIsInpvb20iLCJoaWRlRGF5c0Zyb21WYWwiLCJoaWRlRGF5c0Zyb20iLCJoaWRlRGF5c0Zyb1ZhbCIsImhpZGVXZWVrc0Zyb21WYWwiLCJoaWRlV2Vla3NGcm9tIiwiY29sb3JTY2hlbWVWYWwiLCJjb2xvclNjaGVtZSIsImJvcmRlckNvbG9yMSIsImZpbGxDb2xvcjEiLCJib3JkZXJDb2xvcjIiLCJmaWxsQ29sb3IyIiwic3RyaXBlR3JpZENvbG9yIiwiSlNPTiIsInN0cmluZ2lmeSIsImpzb24iLCJkYXRhIiwiaHRtbCIsInZhbHVlIiwicm93SWQiLCJwcmV2IiwiYmVmb3JlIiwibmV4dCIsImFmdGVyIiwicmVtb3ZlIiwiZGF0ZXBpY2tlcklkIiwicyIsInBhcnNlIiwiaW5uZXJIVE1MIiwibWVzc2FnZSIsImNsZWFyVGFza3MiLCJvbmdvaW5nIiwid2luZG93Iiwib25sb2FkIl0sIm1hcHBpbmdzIjoiQUFrUUEsUUFBQUEsWUFDQSxHQUFBQyxHQUFBLEdBQUFDLElBQ0FELEdBQUFFLE9BcFFBLEdBQUFELEtBQUEsV0FDQUUsS0FBQUMsUUFBQSxFQUNBRCxLQUFBRCxLQUFBLFdBQ0EsR0FBQUcsR0FBQUYsSUFDQUEsTUFBQUcsUUFBQSxHQUNBQyxFQUFBLG9CQUFBQyxHQUFBLFFBQUEsV0FDQUgsRUFBQUMsUUFBQSxLQUVBQyxFQUFBLHlCQUFBQyxHQUFBLFFBQUEsV0FDQUgsRUFBQUksU0FFQUYsRUFBQSwrQ0FBQUcsYUFBQUMsT0FBQSxRQUNBSixFQUFBLCtDQUFBRyxhQUFBQyxPQUFBLFFBQ0FKLEVBQUEsdURBQUFHLGFBQUFDLE9BQUEsUUFDQUosRUFBQSwyRUFBQUcsYUFBQUMsT0FBQSxRQUNBSixFQUFBLG1CQUFBSyxZQUFBRCxPQUFBLGVBQ0FKLEVBQUEsZUFBQU0sS0FBQUMsUUFBQSxTQUNBUCxFQUFBLHdCQUFBQyxHQUFBLFFBQUEsV0FDQUgsRUFBQVUsV0FFQVosS0FBQWEseUJBRUFiLEtBQUFjLFVBQUEsR0FBQUMsV0FBQSxnQkFDQWYsS0FBQWMsVUFBQVQsR0FBQSxRQUFBLFNBQUFXLE1BTUFaLEVBQUEsaUJBQUFDLEdBQUEsaUJBQUEsV0FDQUQsRUFBQSxpQkFBQWEsV0FJQWpCLEtBQUFhLHVCQUFBLFdBR0EsSUFBQSxHQUZBWCxHQUFBRixLQUNBa0IsR0FBQSxZQUFBLGNBQUEsaUJBQ0FDLEVBQUEsRUFBQUEsRUFBQUQsRUFBQUUsT0FBQUQsSUFDQWYsRUFBQSxJQUFBYyxFQUFBQyxJQUFBRSxPQUFBLFFBRUFqQixHQUFBLGNBQUFDLEdBQUEsUUFBQSxXQUNBSCxFQUFBb0IsR0FBQXRCLEtBQUF1QixNQUVBbkIsRUFBQSxnQkFBQUMsR0FBQSxRQUFBLFdBQ0FILEVBQUFz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Y0FDQTNELEVBQUEsd0JBQUFHLFlBQUEsV0FBQTBCLEVBQUErQixZQUNBNUQsRUFBQSwwQkFBQUcsWUFBQSxXQUFBMEIsRUFBQWdDLGNBQ0E3RCxFQUFBLHdCQUFBRyxZQUFBLFdBQUEwQixFQUFBaUMsWUFDQTlELEVBQUEsOEJBQUFHLFlBQUEsV0FBQTBCLEVBQUFDLGtCQUNBOUIsRUFBQSw0QkFBQUcsWUFBQSxXQUFBMEIsRUFBQUUsZ0JBQ0EvQixFQUFBLDZCQUFBRyxZQUFBLFdBQUEwQixFQUFBRyxpQkFDQWhDLEVBQUEsOEJBQUFHLFlBQUEsV0FBQTBCLEVBQUFJLGtCQUNBakMsRUFBQSxzQkFBQUcsWUFBQSxXQUFBMEIsRUFBQUssYUFJQXRDLEtBQUFxRixXQUFBLFdBQ0FqRixFQUFBLG9CQUFBLEdBQUErRSxVQUFBLElBU0FJLFFBQUFDLE9BQUE1RiIsImZpbGUiOiJidW5kbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgQXBwID0gZnVuY3Rpb24oKSB7XHJcbiAgdGhpcy5jb3VudGVyID0gMDtcclxuICB0aGlzLmluaXQgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBzZWxmID0gdGhpcztcclxuICAgIHRoaXMuYWRkUm93KGZhbHNlKTtcclxuICAgICQoJyNhZGQtdGFzay1idXR0b24nKS5vbignY2xpY2snLCBmdW5jdGlvbigpIHtcclxuICAgICAgc2VsZi5hZGRSb3codHJ1ZSk7XHJcbiAgICB9KTtcclxuICAgICQoJyNzaG93LXRpbWVsaW5lLWJ1dHRvbicpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCkge1xyXG4gICAgICBzZWxmLnBvc3QoKTtcclxuICAgIH0pO1xyXG4gICAgJCgnI2NvbG9yLXBpY2tlci1ib3JkZXItMSwjY29sb3ItcGlja2VyLWZpbGwtMScpLmNvbG9ycGlja2VyKHtcImZvcm1hdFwiOiBcImhleFwifSk7XHJcbiAgICAkKCcjY29sb3ItcGlja2VyLWJvcmRlci0yLCNjb2xvci1waWNrZXItZmlsbC0yJykuY29sb3JwaWNrZXIoe1wiZm9ybWF0XCI6IFwiaGV4XCJ9KTtcclxuICAgICQoJyNjb2xvci1waWNrZXItZnJhbWUtYm9yZGVyLCNjb2xvci1waWNrZXItZnJhbWUtZmlsbCcpLmNvbG9ycGlja2VyKHtcImZvcm1hdFwiOiBcImhleFwifSk7XHJcbiAgICAkKCcjY29sb3ItcGlja2VyLXN0cmlwZS1kYXJrLCNjb2xvci1waWNrZXItc3RyaXBlLWxpZ2h0LCNjb2xvci1waWNrZXItZ3JpZCcpLmNvbG9ycGlja2VyKHtcImZvcm1hdFwiOiBcImhleFwifSk7XHJcbiAgICAkKCcjZGF0ZXBpY2tlci1lbmQnKS5kYXRlcGlja2VyKHtmb3JtYXQ6IFwieXl5eS1tbS1kZFwifSk7XHJcbiAgICAkKCcjc291cmNlLWRpdicpLmNzcyh7XCJkaXNwbGF5XCI6IFwibm9uZVwifSk7XHJcbiAgICAkKCcjbW9kYWwtYWN0aW9uLWJ1dHRvbicpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCkge1xyXG4gICAgICBzZWxmLmltcG9ydCgpO1xyXG4gICAgfSk7XHJcbiAgICB0aGlzLmFkZFRhYmxlQnV0dG9uSGFuZGxlcnMoKTtcclxuXHJcbiAgICB0aGlzLmNsaXBib2FyZCA9IG5ldyBDbGlwYm9hcmQoJyNjb3B5LWJ1dHRvbicpO1xyXG4gICAgdGhpcy5jbGlwYm9hcmQub24oJ2Vycm9yJywgZnVuY3Rpb24oZSkge1xyXG4gICAgICAvL1RPRE86IEN0cmwrQyBtZXNzYWdlIGZhbGxiYWNrXHJcbiAgICB9KTtcclxuXHJcbiAgICAvL2tleWJvYXJkIGZvY3VzIG9uIHRleHRhcmVhIGZvciBxdWljayBwYXN0ZSBhY3Rpb25cclxuICAgIC8vbm90IGFsbG93ZWQgdG8gcmVhZCBmcm9tIGNsaXBib2FyZFxyXG4gICAgJCgnI2ltcG9ydC1tb2RhbCcpLm9uKCdzaG93bi5icy5tb2RhbCcsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAkKCcjbW9kYWwtc291cmNlJykuZm9jdXMoKTtcclxuICAgIH0pO1xyXG4gIH07XHJcblxyXG4gIHRoaXMuYWRkVGFibGVCdXR0b25IYW5kbGVycyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xyXG4gICAgdmFyIGFyciA9IFsndXAtYnV0dG9uJywgJ2Rvd24tYnV0dG9uJywgJ2RlbGV0ZS1idXR0b24nXTtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJyLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICQoJy4nICsgYXJyW2ldKS51bmJpbmQoJ2NsaWNrJyk7XHJcbiAgICB9XHJcbiAgICAkKCcudXAtYnV0dG9uJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgIHNlbGYudXAodGhpcy5pZCk7XHJcbiAgICB9KTtcclxuICAgICQoJy5kb3duLWJ1dHRvbicpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCkge1xyXG4gICAgICBzZWxmLmRvd24odGhpcy5pZCk7XHJcbiAgICB9KTtcclxuICAgICQoJy5kZWxldGUtYnV0dG9uJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgIHNlbGYuZGVsZXRlKHRoaXMuaWQpO1xyXG4gICAgfSk7XHJcbiAgICAkKCcub25nb2luZy1jaGVja2JveCcpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCkge1xyXG4gICAgICBzZWxmLnRvZ2dsZU9uZ29pbmcodGhpcy5pZCk7XHJcbiAgICB9KVxyXG4gIH07XHJcblxyXG4gIHRoaXMuYWRkUm93ID0gZnVuY3Rpb24oc2V0Rm9jdXMpIHtcclxuICAgIHRoaXMuY291bnRlcisrO1xyXG4gICAgJCgnI3Rhc2stdGFibGUtYm9keScpLmFwcGVuZChcclxuICAgICAgICAnPHRyIGNsYXNzPVwidGFza1wiIGlkPVwidGFzay0nICsgdGhpcy5jb3VudGVyICsgJ1wiPicgK1xyXG4gICAgICAgICc8dGQ+PGRpdiBjbGFzcz1cImlucHV0LWFwcGVuZCBkYXRlXCI+PGlucHV0IGNsYXNzPVwiZm9ybS1jb250cm9sXCIgaWQ9XCJkYXRlcGlja2VyLXN0YXJ0LScgKyB0aGlzLmNvdW50ZXIgKyAnXCIgc2l6ZT1cIjE2XCIgdHlwZT1cInRleHRcIiByZWFkb25seT48c3BhbiBjbGFzcz1cImFkZC1vblwiPjxpIGNsYXNzPVwiaWNvbi10aFwiPjwvaT48L3NwYW4+PC9kaXY+PC90ZD4nICtcclxuICAgICAgICAnPHRkPjxkaXYgY2xhc3M9XCJpbnB1dC1hcHBlbmQgZGF0ZVwiPjxpbnB1dCBjbGFzcz1cImZvcm0tY29udHJvbFwiIGlkPVwiZGF0ZXBpY2tlci1lbmQtJyArIHRoaXMuY291bnRlciArICdcIiBzaXplPVwiMTZcIiB0eXBlPVwidGV4dFwiIHJlYWRvbmx5PjxzcGFuIGNsYXNzPVwiYWRkLW9uXCI+PGkgY2xhc3M9XCJpY29uLXRoXCI+PC9pPjwvc3Bhbj48L3RkPicgK1xyXG4gICAgICAgICc8dGQ+PGRpdiBjbGFzcz1cImNoZWNrYm94XCI+PGxhYmVsPjxpbnB1dCBjbGFzcz1cIm9uZ29pbmctY2hlY2tib3hcIiBpZD1cImRhdGVwaWNrZXItZW5kLScgKyB0aGlzLmNvdW50ZXIgKyAnLW9uZ29pbmdcIiB0eXBlPVwiY2hlY2tib3hcIj4mbmJzcDtPbmdvaW5nPC9sYWJlbD48L2Rpdj48L3RkPicgK1xyXG4gICAgICAgICc8dGQ+PGlucHV0IGNsYXNzPVwiZm9ybS1jb250cm9sXCIgaWQ9XCJsYWJlbC0nICsgdGhpcy5jb3VudGVyICsgJ1wiIHR5cGU9XCJ0ZXh0XCI+PC90ZD4nICtcclxuICAgICAgICAnPHRkPjxpbnB1dCBjbGFzcz1cImZvcm0tY29udHJvbFwiIGlkPVwibWlsZXN0b25lcy0nICsgdGhpcy5jb3VudGVyICsgJ1wiIHR5cGU9XCJ0ZXh0XCIgcGxhY2Vob2xkZXI9XCIyMDAxLTAxLTAxLCAuLi5cIj48L3RkPicgK1xyXG4gICAgICAgICc8dGQ+PGlucHV0IGNsYXNzPVwiZm9ybS1jb250cm9sXCIgaWQ9XCJkYXRlU3RhbXBzLScgKyB0aGlzLmNvdW50ZXIgKyAnXCIgdHlwZT1cInRleHRcIiBwbGFjZWhvbGRlcj1cIjIwMDEtMDEtMDEsIC4uLlwiPjwvdGQ+JyArXHJcbiAgICAgICAgJzx0ZD48aW5wdXQgY2xhc3M9XCJmb3JtLWNvbnRyb2xcIiBpZD1cInN0YXJ0VG8tJyArIHRoaXMuY291bnRlciArICdcIiB0eXBlPVwidGV4dFwiIHBsYWNlaG9sZGVyPVwiMSwgMlwiPjwvdGQ+JyArXHJcbiAgICAgICAgJzx0ZD48aW5wdXQgY2xhc3M9XCJmb3JtLWNvbnRyb2xcIiBpZD1cImVuZFRvLScgKyB0aGlzLmNvdW50ZXIgKyAnXCIgdHlwZT1cInRleHRcIiBwbGFjZWhvbGRlcj1cIjMsIDRcIj48L3RkPicgK1xyXG4gICAgICAgICc8dGQ+PGlucHV0IGNsYXNzPVwiZm9ybS1jb250cm9sXCIgaWQ9XCJyZWN1ci0nICsgdGhpcy5jb3VudGVyICsgJ1wiIHR5cGU9XCJ0ZXh0XCIgcGxhY2Vob2xkZXI9XCI3XCI+PC90ZD4nICtcclxuICAgICAgICAnPHRkPjxidXR0b24gY2xhc3M9XCJ1cC1idXR0b24gYnRuIGJ0bi1kZWZhdWx0XCIgaWQ9XCJ1cC1idXR0b24tJyArIHRoaXMuY291bnRlciArICdcIj4mdWFycjs8L2J1dHRvbj48L3RkPicgK1xyXG4gICAgICAgICc8dGQ+PGJ1dHRvbiBjbGFzcz1cImRvd24tYnV0dG9uIGJ0biBidG4tZGVmYXVsdFwiIGlkPVwiZG93bi1idXR0b24tJyArIHRoaXMuY291bnRlciArICdcIj4mZGFycjs8L2J1dHRvbj48L3RkPicgK1xyXG4gICAgICAgICc8dGQ+PGJ1dHRvbiBjbGFzcz1cImRlbGV0ZS1idXR0b24gYnRuIGJ0bi1kZWZhdWx0XCIgaWQ9XCJkZWxldGUtYnV0dG9uLScgKyB0aGlzLmNvdW50ZXIgKyAnXCI+JmNyb3NzOzwvYnV0dG9uPjwvdGQ+JyArXHJcbiAgICAgICAgJzwvdHI+J1xyXG4gICAgICAgICk7XHJcbiAgICAkKCcjZGF0ZXBpY2tlci1zdGFydC0nICsgdGhpcy5jb3VudGVyICsgJywjZGF0ZXBpY2tlci1lbmQtJyArIHRoaXMuY291bnRlcikuZGF0ZXBpY2tlcih7Zm9ybWF0OiBcInl5eXktbW0tZGRcIn0pO1xyXG5cclxuICAgIGlmIChzZXRGb2N1cykge1xyXG4gICAgICAkKCcjZGF0ZXBpY2tlci1zdGFydC0nICsgdGhpcy5jb3VudGVyKS5mb2N1cygpO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuYWRkVGFibGVCdXR0b25IYW5kbGVycygpO1xyXG5cclxuICAgIHJldHVybiB0aGlzLmNvdW50ZXI7XHJcbiAgfTtcclxuXHJcbiAgdGhpcy5zZXJpYWxpemUgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBvYmogPSB7XHJcbiAgICAgIFwic2V0dGluZ3NcIjoge1xyXG5cclxuICAgICAgfSxcclxuICAgICAgXCJ0YXNrc1wiOiBbXSxcclxuICAgICAgXCJ0aGVtZVwiOiB7XHJcbiAgICAgICAgXCJmcmFtZUJvcmRlckNvbG9yXCI6IFwiI2ZmZmZmZlwiLFxyXG4gICAgICAgIFwiZnJhbWVGaWxsQ29sb3JcIjogXCIjODg4ODg4XCIsXHJcbiAgICAgICAgXCJzdHJpcGVDb2xvckRhcmtcIjogXCIjZGRkZGRkXCIsXHJcbiAgICAgICAgXCJzdHJpcGVDb2xvckxpZ2h0XCI6IFwiI2VlZWVlZVwiLFxyXG4gICAgICAgIFwiZ3JpZENvbG9yXCI6IFwiIzk5OTk5OVwiXHJcbiAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgLy90YXNrc1xyXG4gICAgdmFyIHRhc2tzID0gJCgnLnRhc2snKTtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGFza3MubGVuZ3RoOyBpKyspIHtcclxuICAgICAgdmFyIHRhc2sgPSB0YXNrc1tpXTtcclxuICAgICAgdmFyIGlkID0gdGFzay5pZDtcclxuICAgICAgdmFyIGlkTnVtID0gaWQucmVwbGFjZSgvXnRhc2stLywgXCJcIik7XHJcblxyXG4gICAgICB2YXIgc3RhcnREYXRlID0gJCgnI2RhdGVwaWNrZXItc3RhcnQtJyArIGlkTnVtKS5kYXRlcGlja2VyKFwiZ2V0Rm9ybWF0dGVkRGF0ZVwiKTtcclxuICAgICAgdmFyIGVuZERhdGUgPSAkKCcjZGF0ZXBpY2tlci1lbmQtJyArIGlkTnVtKS5kYXRlcGlja2VyKFwiZ2V0Rm9ybWF0dGVkRGF0ZVwiKTtcclxuICAgICAgdmFyIGVuZERhdGVPbmdvaW5nID0gJCgnI2RhdGVwaWNrZXItZW5kLScgKyBpZE51bSArICctb25nb2luZycpLnByb3AoJ2NoZWNrZWQnKTsgXHJcbiAgICAgIGlmIChlbmREYXRlT25nb2luZykge1xyXG4gICAgICAgIGVuZERhdGUgPSBcIi1cIjtcclxuICAgICAgfVxyXG4gICAgICB2YXIgbGFiZWwgPSAkKCcjbGFiZWwtJyArIGlkTnVtKS52YWwoKTtcclxuXHJcbiAgICAgIHZhciB0YXNrT2JqID0ge307XHJcbiAgICAgIHRhc2tPYmouc3RhcnQgPSBzdGFydERhdGU7XHJcbiAgICAgIHRhc2tPYmoubGFiZWwgPSBsYWJlbDtcclxuXHJcbiAgICAgIC8vZW5kIGlzIG9wdGlvbmFsIC0gbm90IHN1cHBseWluZyBlbmQgaXMgcGVyZmVjdGx5IHZhbGlkXHJcbiAgICAgIC8vLSBzaWduaWZpZXMgJ3RvZGF5JyBzbyB0cmVhdGluZyAnYmxhbmsnIGFzIHNpZ25pZmljYW50IGlzIGhlbHBmdWwgaGVyZVxyXG4gICAgICBpZiAoZW5kRGF0ZS5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgdGFza09iai5lbmQgPSBlbmREYXRlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBvYmoudGFza3MucHVzaCh0YXNrT2JqKTtcclxuICAgIH1cclxuXHJcbiAgICAvL3NldHRpbmdzIC0gZW5mb3JjZSBzYW5lIHZhbHVlc1xyXG4gICAgLy9UT0RPOiB1c2Ugc2NoZW1hIGxpbWl0c1xyXG4gICAgb2JqLnNldHRpbmdzLmVuZCA9ICQoJyNkYXRlcGlja2VyLWVuZCcpLmRhdGVwaWNrZXIoXCJnZXRGb3JtYXR0ZWREYXRlXCIpO1xyXG4gICAgdmFyIHNldHRpbmdFbmREYXRlT25nb2luZyA9ICQoJyNkYXRlcGlja2VyLWVuZC1vbmdvaW5nJykucHJvcCgnY2hlY2tlZCcpO1xyXG4gICAgaWYgKHNldHRpbmdFbmREYXRlT25nb2luZykge1xyXG4gICAgICBvYmouc2V0dGluZ3MuZW5kID0gXCItXCI7XHJcbiAgICB9XHJcbiAgICB2YXIgem9vbVZhbCA9IE51bWJlcigkKCcjem9vbS1pbnB1dCcpLnZhbCgpKTtcclxuICAgIG9iai5zZXR0aW5ncy56b29tID0gKHpvb21WYWwgPj0gNTAgJiYgem9vbVZhbCA8PSAzMDApID8gem9vbVZhbCA6IDE1MDtcclxuICAgIHZhciBoaWRlRGF5c0Zyb21WYWwgPSBOdW1iZXIoJCgnI2hpZGUtZGF5cy1mcm9tLWlucHV0JykudmFsKCkpO1xyXG4gICAgb2JqLnNldHRpbmdzLmhpZGVEYXlzRnJvbSA9IChoaWRlRGF5c0Zyb21WYWwgPj0gMSAmJiBoaWRlRGF5c0Zyb21WYWwgPD0gMzY1KSA/IGhpZGVEYXlzRnJvVmFsIDogOTA7XHJcbiAgICB2YXIgaGlkZVdlZWtzRnJvbVZhbCA9IE51bWJlcigkKCcjaGlkZS13ZWVrcy1mcm9tLWlucHV0JykudmFsKCkpO1xyXG4gICAgb2JqLnNldHRpbmdzLmhpZGVXZWVrc0Zyb20gPSAoaGlkZVdlZWtzRnJvbVZhbCA+PSAxICYmIGhpZGVXZWVrc0Zyb21WYWwgPD0gMTQ2MCkgPyBoaWRlV2Vla3NGcm9tVmFsIDogMTgwO1xyXG5cclxuICAgIC8vdGhlbWVcclxuICAgIHZhciBjb2xvclNjaGVtZVZhbCA9ICQoJyNjb2xvci1zY2hlbWUtc2VsZWN0JykudmFsKCk7XHJcbiAgICBvYmoudGhlbWUuY29sb3JTY2hlbWUgPSAoY29sb3JTY2hlbWVWYWwubGVuZ3RoID4gMCkgPyBjb2xvclNjaGVtZVZhbCA6IFwiZ3JhZGllbnRcIjtcclxuICAgIG9iai50aGVtZS5ib3JkZXJDb2xvcjEgPSAkKCcjY29sb3ItcGlja2VyLWJvcmRlci0xJykuY29sb3JwaWNrZXIoJ2dldFZhbHVlJywgJyNmZmZmZmYnKTtcclxuICAgIG9iai50aGVtZS5maWxsQ29sb3IxID0gJCgnI2NvbG9yLXBpY2tlci1maWxsLTEnKS5jb2xvcnBpY2tlcignZ2V0VmFsdWUnLCAnI2ZmZmZmZicpO1xyXG4gICAgb2JqLnRoZW1lLmJvcmRlckNvbG9yMiA9ICQoJyNjb2xvci1waWNrZXItYm9yZGVyLTInKS5jb2xvcnBpY2tlcignZ2V0VmFsdWUnLCAnI2ZmZmZmZicpO1xyXG4gICAgb2JqLnRoZW1lLmZpbGxDb2xvcjIgPSAkKCcjY29sb3ItcGlja2VyLWZpbGwtMicpLmNvbG9ycGlja2VyKCdnZXRWYWx1ZScsICcjZmZmZmZmJyk7XHJcbiAgICBvYmoudGhlbWUuZnJhbWVCb3JkZXJDb2xvciA9ICQoJyNjb2xvci1waWNrZXItZnJhbWUtYm9yZGVyJykuY29sb3JwaWNrZXIoJ2dldFZhbHVlJywgJyNmZmZmZmYnKTtcclxuICAgIG9iai50aGVtZS5mcmFtZUZpbGxDb2xvciA9ICQoJyNjb2xvci1waWNrZXItZnJhbWUtZmlsbCcpLmNvbG9ycGlja2VyKCdnZXRWYWx1ZScsICcjZmZmZmZmJyk7XHJcbiAgICBvYmoudGhlbWUuc3RyaXBlQ29sb3JEYXJrID0gJCgnI2NvbG9yLXBpY2tlci1zdHJpcGUtZGFyaycpLmNvbG9ycGlja2VyKCdnZXRWYWx1ZScsICcjZmZmZmZmJyk7XHJcbiAgICBvYmoudGhlbWUuc3RyaXBlQ29sb3JMaWdodCA9ICQoJyNjb2xvci1waWNrZXItc3RyaXBlLWxpZ2h0JykuY29sb3JwaWNrZXIoJ2dldFZhbHVlJywgJyNmZmZmZmYnKTtcclxuICAgIG9iai50aGVtZS5zdHJpcGVHcmlkQ29sb3IgPSAkKCcjY29sb3ItcGlja2VyLWdyaWQnKS5jb2xvcnBpY2tlcignZ2V0VmFsdWUnLCAnI2ZmZmZmZicpO1xyXG5cclxuICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShvYmopO1xyXG4gIH1cclxuXHJcbiAgdGhpcy5wb3N0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIganNvbiA9IHRoaXMuc2VyaWFsaXplKCk7XHJcbiAgICAkLnBvc3QoXHJcbiAgICAgICAgXCIvdGltZWxpbmVcIixcclxuICAgICAgICBqc29uLFxyXG4gICAgICAgIGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgICAgICAgICQoXCIjcmVzdWx0XCIpLmh0bWwoZGF0YSk7XHJcblxyXG4gICAgICAgICAgaWYgKGpzb24ubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICQoJyNzb3VyY2UtZGl2JykuY3NzKHtcImRpc3BsYXlcIjogXCJub25lXCJ9KTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgJChcIiNzb3VyY2UtZGl2XCIpLmNzcyh7XCJkaXNwbGF5XCI6IFwiYmxvY2tcIn0pO1xyXG4gICAgICAgICAgJChcIiNzb3VyY2VcIilbMF0udmFsdWUgPSBqc29uO1xyXG4gICAgICAgIH1cclxuICAgICAgICApO1xyXG4gIH07XHJcblxyXG4gIHRoaXMudXAgPSBmdW5jdGlvbihpZCkge1xyXG4gICAgdmFyIHJvd0lkID0gaWQucmVwbGFjZSgvXnVwLWJ1dHRvbi8sICcjdGFzaycpO1xyXG4gICAgJChyb3dJZCkucHJldigpLmJlZm9yZSgkKHJvd0lkKSk7XHJcbiAgICB0aGlzLmFkZFRhYmxlQnV0dG9uSGFuZGxlcnMoKTtcclxuICB9O1xyXG5cclxuICB0aGlzLmRvd24gPSBmdW5jdGlvbihpZCkge1xyXG4gICAgdmFyIHJvd0lkID0gaWQucmVwbGFjZSgvXmRvd24tYnV0dG9uLywgJyN0YXNrJyk7XHJcbiAgICAkKHJvd0lkKS5uZXh0KCkuYWZ0ZXIoJChyb3dJZCkpO1xyXG4gICAgdGhpcy5hZGRUYWJsZUJ1dHRvbkhhbmRsZXJzKCk7XHJcbiAgfTtcclxuXHJcbiAgdGhpcy5kZWxldGUgPSBmdW5jdGlvbihpZCkge1xyXG4gICAgdmFyIHJvd0lkID0gaWQucmVwbGFjZSgvXmRlbGV0ZS1idXR0b24vLCAnI3Rhc2snKTtcclxuICAgICQocm93SWQpLnJlbW92ZSgpO1xyXG4gICAgdGhpcy5hZGRUYWJsZUJ1dHRvbkhhbmRsZXJzKCk7XHJcbiAgfTtcclxuXHJcbiAgdGhpcy50b2dnbGVPbmdvaW5nID0gZnVuY3Rpb24oaWQpIHtcclxuICAgIHZhciBkYXRlcGlja2VySWQgPSBpZC5yZXBsYWNlKC8tb25nb2luZyQvLCAnJyk7XHJcbiAgICBcclxuICAgIC8vcmVzZXQgZmllbGQgaWYgb25nb2luZyBpcyBkZXNlbGVjdGVkXHJcbiAgICAvL290aGVyd2lzZSB0aGVyZSB3b3VsZCBiZSBubyB3YXkgdG8gY2xlYXIgdGhlIGZpZWxkXHJcbiAgICBpZiAoJCgnIycgKyBpZCkucHJvcCgnY2hlY2tlZCcpID09PSBmYWxzZSkge1xyXG4gICAgICAkKCcjJyArIGRhdGVwaWNrZXJJZCkuZGF0ZXBpY2tlcigndXBkYXRlJywgJycpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgdGhpcy5pbXBvcnQgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBzID0gJCgnI21vZGFsLXNvdXJjZScpWzBdLnZhbHVlO1xyXG4gICAgdHJ5IHtcclxuICAgICAgdmFyIG9iaiA9IEpTT04ucGFyc2Uocyk7XHJcbiAgICB9IGNhdGNoKGUpIHtcclxuICAgICAgJCgnI3Jlc3VsdCcpWzBdLmlubmVySFRNTCA9IGUubWVzc2FnZTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChvYmogPT09IHt9IHx8IG9iaiA9PT0gbnVsbCB8fCB0eXBlb2Yob2JqKSA9PT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgJCgnI3Jlc3VsdCcpWzBdLmlubmVySFRNTCA9IFwiTm8gdGltZWxpbmUgZGF0YSBmb3VuZFwiO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuY2xlYXJUYXNrcygpO1xyXG4gICAgaWYgKG9iai50YXNrcykge1xyXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG9iai50YXNrcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIHZhciB0YXNrID0gb2JqLnRhc2tzW2ldXHJcbiAgICAgICAgICB2YXIgY291bnRlciA9IHRoaXMuYWRkUm93KGZhbHNlKTtcclxuXHJcbiAgICAgICAgJCgnI2RhdGVwaWNrZXItc3RhcnQtJyArIGNvdW50ZXIpLmRhdGVwaWNrZXIoJ3VwZGF0ZScsIHRhc2suc3RhcnQpO1xyXG5cclxuICAgICAgICB2YXIgb25nb2luZyA9ICh0YXNrLmVuZCA9PT0gXCItXCIpO1xyXG4gICAgICAgICQoJyNkYXRlcGlja2VyLWVuZC0nICsgY291bnRlcikuZGF0ZXBpY2tlcigndXBkYXRlJywgKG9uZ29pbmcpID8gXCJcIiA6IHRhc2suZW5kKTtcclxuICAgICAgICAkKCcjZGF0ZXBpY2tlci1lbmQtJyArIGNvdW50ZXIgKyAnLW9uZ29pbmcnKS5wcm9wKCdjaGVja2VkJywgb25nb2luZyk7XHJcbiAgICAgICAgJCgnI2xhYmVsLScgKyBjb3VudGVyKS52YWwodGFzay5sYWJlbCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGlmIChvYmouc2V0dGluZ3MpIHtcclxuICAgICAgdmFyIHNldHRpbmdzID0gb2JqLnNldHRpbmdzXHJcbiAgICAgICAgdmFyIG9uZ29pbmcgPSAoc2V0dGluZ3MuZW5kID09PSBcIi1cIik7XHJcbiAgICAgICQoJyNkYXRlcGlja2VyLWVuZCcpLmRhdGVwaWNrZXIoJ3VwZGF0ZScsIChvbmdvaW5nKSA/IFwiXCIgOiBzZXR0aW5ncy5lbmQpO1xyXG4gICAgICAkKCcjZGF0ZXBpY2tlci1lbmQtb25nb2luZycpLnByb3AoJ2NoZWNrZWQnLCBvbmdvaW5nKTtcclxuICAgICAgJCgnI3pvb20taW5wdXQnKS52YWwoc2V0dGluZ3Muem9vbSk7XHJcbiAgICAgICQoJyNoaWRlLWRheXMtZnJvbS1pbnB1dCcpLnZhbChzZXR0aW5ncy5oaWRlRGF5c0Zyb20pO1xyXG4gICAgICAkKCcjaGlkZS13ZWVrcy1mcm9tLWlucHV0JykudmFsKHNldHRpbmdzLmhpZGVXZWVrc0Zyb20pO1xyXG4gICAgfVxyXG4gICAgaWYgKG9iai50aGVtZSkge1xyXG4gICAgICB2YXIgdGhlbWUgPSBvYmoudGhlbWU7XHJcbiAgICAgICQoJyNjb2xvci1zY2hlbWUtc2VsZWN0JykudmFsKHRoZW1lLmNvbG9yU2NoZW1lKTtcclxuICAgICAgJCgnI2NvbG9yLXBpY2tlci1ib3JkZXItMScpLmNvbG9ycGlja2VyKCdzZXRWYWx1ZScsIHRoZW1lLmJvcmRlckNvbG9yMSk7XHJcbiAgICAgICQoJyNjb2xvci1waWNrZXItZmlsbC0xJykuY29sb3JwaWNrZXIoJ3NldFZhbHVlJywgdGhlbWUuZmlsbENvbG9yMSk7XHJcbiAgICAgICQoJyNjb2xvci1waWNrZXItYm9yZGVyLTInKS5jb2xvcnBpY2tlcignc2V0VmFsdWUnLCB0aGVtZS5ib3JkZXJDb2xvcjIpO1xyXG4gICAgICAkKCcjY29sb3ItcGlja2VyLWZpbGwtMicpLmNvbG9ycGlja2VyKCdzZXRWYWx1ZScsIHRoZW1lLmZpbGxDb2xvcjIpO1xyXG4gICAgICAkKCcjY29sb3ItcGlja2VyLWZyYW1lLWJvcmRlcicpLmNvbG9ycGlja2VyKCdzZXRWYWx1ZScsIHRoZW1lLmZyYW1lQm9yZGVyQ29sb3IpO1xyXG4gICAgICAkKCcjY29sb3ItcGlja2VyLWZyYW1lLWZpbGwnKS5jb2xvcnBpY2tlcignc2V0VmFsdWUnLCB0aGVtZS5mcmFtZUZpbGxDb2xvcik7XHJcbiAgICAgICQoJyNjb2xvci1waWNrZXItc3RyaXBlLWRhcmsnKS5jb2xvcnBpY2tlcignc2V0VmFsdWUnLCB0aGVtZS5zdHJpcGVDb2xvckRhcmspO1xyXG4gICAgICAkKCcjY29sb3ItcGlja2VyLXN0cmlwZS1saWdodCcpLmNvbG9ycGlja2VyKCdzZXRWYWx1ZScsIHRoZW1lLnN0cmlwZUNvbG9yTGlnaHQpO1xyXG4gICAgICAkKCcjY29sb3ItcGlja2VyLWdyaWQnKS5jb2xvcnBpY2tlcignc2V0VmFsdWUnLCB0aGVtZS5ncmlkQ29sb3IpO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIHRoaXMuY2xlYXJUYXNrcyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgJCgnI3Rhc2stdGFibGUtYm9keScpWzBdLmlubmVySFRNTCA9ICcnO1xyXG4gIH07XHJcbn07XHJcblxyXG5mdW5jdGlvbiBtYWluRnVuYygpIHtcclxuICB2YXIgYXBwID0gbmV3IEFwcCgpO1xyXG4gIGFwcC5pbml0KCk7XHJcbn1cclxuXHJcbndpbmRvdy5vbmxvYWQgPSBtYWluRnVuYztcclxuIl19
