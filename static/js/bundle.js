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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiXSwibmFtZXMiOlsibWFpbkZ1bmMiLCJhcHAiLCJBcHAiLCJpbml0IiwidGhpcyIsImNvdW50ZXIiLCJzZWxmIiwiYWRkUm93IiwiJCIsIm9uIiwicG9zdCIsImNvbG9ycGlja2VyIiwiZm9ybWF0IiwiZGF0ZXBpY2tlciIsImNzcyIsImRpc3BsYXkiLCJpbXBvcnQiLCJhZGRUYWJsZUJ1dHRvbkhhbmRsZXJzIiwiY2xpcGJvYXJkIiwiQ2xpcGJvYXJkIiwiZSIsImZvY3VzIiwiYXJyIiwiaSIsImxlbmd0aCIsInVuYmluZCIsInVwIiwiaWQiLCJkb3duIiwiZGVsZXRlIiwidG9nZ2xlT25nb2luZyIsInNldEZvY3VzIiwiYXBwZW5kIiwic2VyaWFsaXplIiwib2JqIiwic2V0dGluZ3MiLCJ0YXNrcyIsInRoZW1lIiwiZnJhbWVCb3JkZXJDb2xvciIsImZyYW1lRmlsbENvbG9yIiwic3RyaXBlQ29sb3JEYXJrIiwic3RyaXBlQ29sb3JMaWdodCIsImdyaWRDb2xvciIsInRhc2siLCJpZE51bSIsInJlcGxhY2UiLCJzdGFydERhdGUiLCJlbmREYXRlIiwiZW5kRGF0ZU9uZ29pbmciLCJwcm9wIiwibGFiZWwiLCJ2YWwiLCJ0YXNrT2JqIiwic3RhcnQiLCJlbmQiLCJwdXNoIiwic2V0dGluZ0VuZERhdGVPbmdvaW5nIiwiem9vbVZhbCIsIk51bWJlciIsInpvb20iLCJoaWRlRGF5c0Zyb21WYWwiLCJoaWRlRGF5c0Zyb20iLCJoaWRlRGF5c0Zyb1ZhbCIsImhpZGVXZWVrc0Zyb21WYWwiLCJoaWRlV2Vla3NGcm9tIiwiY29sb3JTY2hlbWVWYWwiLCJjb2xvclNjaGVtZSIsImJvcmRlckNvbG9yMSIsImZpbGxDb2xvcjEiLCJib3JkZXJDb2xvcjIiLCJmaWxsQ29sb3IyIiwic3RyaXBlR3JpZENvbG9yIiwiSlNPTiIsInN0cmluZ2lmeSIsImpzb24iLCJkYXRhIiwiaHRtbCIsInZhbHVlIiwicm93SWQiLCJwcmV2IiwiYmVmb3JlIiwibmV4dCIsImFmdGVyIiwicmVtb3ZlIiwiZGF0ZXBpY2tlcklkIiwicyIsInBhcnNlIiwiaW5uZXJIVE1MIiwibWVzc2FnZSIsImNsZWFyVGFza3MiLCJvbmdvaW5nIiwid2luZG93Iiwib25sb2FkIl0sIm1hcHBpbmdzIjoiQUFrUUEsUUFBQUEsWUFDQSxHQUFBQyxHQUFBLEdBQUFDLElBQ0FELEdBQUFFLE9BcFFBLEdBQUFELEtBQUEsV0FDQUUsS0FBQUMsUUFBQSxFQUNBRCxLQUFBRCxLQUFBLFdBQ0EsR0FBQUcsR0FBQUYsSUFDQUEsTUFBQUcsUUFBQSxHQUNBQyxFQUFBLG9CQUFBQyxHQUFBLFFBQUEsV0FDQUgsRUFBQUMsUUFBQSxLQUVBQyxFQUFBLHlCQUFBQyxHQUFBLFFBQUEsV0FDQUgsRUFBQUksU0FFQUYsRUFBQSwrQ0FBQUcsYUFBQUMsT0FBQSxRQUNBSixFQUFBLCtDQUFBRyxhQUFBQyxPQUFBLFFBQ0FKLEVBQUEsdURBQUFHLGFBQUFDLE9BQUEsUUFDQUosRUFBQSwyRUFBQUcsYUFBQUMsT0FBQSxRQUNBSixFQUFBLG1CQUFBSyxZQUFBRCxPQUFBLGVBQ0FKLEVBQUEsZUFBQU0sS0FBQUMsUUFBQSxTQUNBUCxFQUFBLHdCQUFBQyxHQUFBLFFBQUEsV0FDQUgsRUFBQVUsV0FFQVosS0FBQWEseUJBRUFiLEtBQUFjLFVBQUEsR0FBQUMsV0FBQSxnQkFDQWYsS0FBQWMsVUFBQVQsR0FBQSxRQUFBLFNBQUFXLE1BTUFaLEVBQUEsaUJBQUFDLEdBQUEsaUJBQUEsV0FDQUQsRUFBQSxpQkFBQWEsV0FJQWpCLEtBQUFhLHVCQUFBLFdBR0EsSUFBQSxHQUZBWCxHQUFBRixLQUNBa0IsR0FBQSxZQUFBLGNBQUEsaUJBQ0FDLEVBQUEsRUFBQUEsRUFBQUQsRUFBQUUsT0FBQUQsSUFDQWYsRUFBQSxJQUFBYyxFQUFBQyxJQUFBRSxPQUFBLFFBRUFqQixHQUFBLGNBQUFDLEdBQUEsUUFBQSxXQUNBSCxFQUFBb0IsR0FBQXRCLEtBQUF1QixNQUVBbkIsRUFBQSxnQkFBQUMsR0FBQSxRQUFBLFdBQ0FILEVBQUFz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Y0FDQTNELEVBQUEsd0JBQUFHLFlBQUEsV0FBQTBCLEVBQUErQixZQUNBNUQsRUFBQSwwQkFBQUcsWUFBQSxXQUFBMEIsRUFBQWdDLGNBQ0E3RCxFQUFBLHdCQUFBRyxZQUFBLFdBQUEwQixFQUFBaUMsWUFDQTlELEVBQUEsOEJBQUFHLFlBQUEsV0FBQTBCLEVBQUFDLGtCQUNBOUIsRUFBQSw0QkFBQUcsWUFBQSxXQUFBMEIsRUFBQUUsZ0JBQ0EvQixFQUFBLDZCQUFBRyxZQUFBLFdBQUEwQixFQUFBRyxpQkFDQWhDLEVBQUEsOEJBQUFHLFlBQUEsV0FBQTBCLEVBQUFJLGtCQUNBakMsRUFBQSxzQkFBQUcsWUFBQSxXQUFBMEIsRUFBQUssYUFJQXRDLEtBQUFxRixXQUFBLFdBQ0FqRixFQUFBLG9CQUFBLEdBQUErRSxVQUFBLElBU0FJLFFBQUFDLE9BQUE1RiIsImZpbGUiOiJidW5kbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgQXBwID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuY291bnRlciA9IDA7XG4gIHRoaXMuaW5pdCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB0aGlzLmFkZFJvdyhmYWxzZSk7XG4gICAgJCgnI2FkZC10YXNrLWJ1dHRvbicpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCkge1xuICAgICAgc2VsZi5hZGRSb3codHJ1ZSk7XG4gICAgfSk7XG4gICAgJCgnI3Nob3ctdGltZWxpbmUtYnV0dG9uJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKSB7XG4gICAgICBzZWxmLnBvc3QoKTtcbiAgICB9KTtcbiAgICAkKCcjY29sb3ItcGlja2VyLWJvcmRlci0xLCNjb2xvci1waWNrZXItZmlsbC0xJykuY29sb3JwaWNrZXIoe1wiZm9ybWF0XCI6IFwiaGV4XCJ9KTtcbiAgICAkKCcjY29sb3ItcGlja2VyLWJvcmRlci0yLCNjb2xvci1waWNrZXItZmlsbC0yJykuY29sb3JwaWNrZXIoe1wiZm9ybWF0XCI6IFwiaGV4XCJ9KTtcbiAgICAkKCcjY29sb3ItcGlja2VyLWZyYW1lLWJvcmRlciwjY29sb3ItcGlja2VyLWZyYW1lLWZpbGwnKS5jb2xvcnBpY2tlcih7XCJmb3JtYXRcIjogXCJoZXhcIn0pO1xuICAgICQoJyNjb2xvci1waWNrZXItc3RyaXBlLWRhcmssI2NvbG9yLXBpY2tlci1zdHJpcGUtbGlnaHQsI2NvbG9yLXBpY2tlci1ncmlkJykuY29sb3JwaWNrZXIoe1wiZm9ybWF0XCI6IFwiaGV4XCJ9KTtcbiAgICAkKCcjZGF0ZXBpY2tlci1lbmQnKS5kYXRlcGlja2VyKHtmb3JtYXQ6IFwieXl5eS1tbS1kZFwifSk7XG4gICAgJCgnI3NvdXJjZS1kaXYnKS5jc3Moe1wiZGlzcGxheVwiOiBcIm5vbmVcIn0pO1xuICAgICQoJyNtb2RhbC1hY3Rpb24tYnV0dG9uJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKSB7XG4gICAgICBzZWxmLmltcG9ydCgpO1xuICAgIH0pO1xuICAgIHRoaXMuYWRkVGFibGVCdXR0b25IYW5kbGVycygpO1xuXG4gICAgdGhpcy5jbGlwYm9hcmQgPSBuZXcgQ2xpcGJvYXJkKCcjY29weS1idXR0b24nKTtcbiAgICB0aGlzLmNsaXBib2FyZC5vbignZXJyb3InLCBmdW5jdGlvbihlKSB7XG4gICAgICAvL1RPRE86IEN0cmwrQyBtZXNzYWdlIGZhbGxiYWNrXG4gICAgfSk7XG5cbiAgICAvL2tleWJvYXJkIGZvY3VzIG9uIHRleHRhcmVhIGZvciBxdWljayBwYXN0ZSBhY3Rpb25cbiAgICAvL25vdCBhbGxvd2VkIHRvIHJlYWQgZnJvbSBjbGlwYm9hcmRcbiAgICAkKCcjaW1wb3J0LW1vZGFsJykub24oJ3Nob3duLmJzLm1vZGFsJywgZnVuY3Rpb24oKSB7XG4gICAgICAkKCcjbW9kYWwtc291cmNlJykuZm9jdXMoKTtcbiAgICB9KTtcbiAgfTtcblxuICB0aGlzLmFkZFRhYmxlQnV0dG9uSGFuZGxlcnMgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdmFyIGFyciA9IFsndXAtYnV0dG9uJywgJ2Rvd24tYnV0dG9uJywgJ2RlbGV0ZS1idXR0b24nXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyci5sZW5ndGg7IGkrKykge1xuICAgICAgJCgnLicgKyBhcnJbaV0pLnVuYmluZCgnY2xpY2snKTtcbiAgICB9XG4gICAgJCgnLnVwLWJ1dHRvbicpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCkge1xuICAgICAgc2VsZi51cCh0aGlzLmlkKTtcbiAgICB9KTtcbiAgICAkKCcuZG93bi1idXR0b24nKS5vbignY2xpY2snLCBmdW5jdGlvbigpIHtcbiAgICAgIHNlbGYuZG93bih0aGlzLmlkKTtcbiAgICB9KTtcbiAgICAkKCcuZGVsZXRlLWJ1dHRvbicpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCkge1xuICAgICAgc2VsZi5kZWxldGUodGhpcy5pZCk7XG4gICAgfSk7XG4gICAgJCgnLm9uZ29pbmctY2hlY2tib3gnKS5vbignY2xpY2snLCBmdW5jdGlvbigpIHtcbiAgICAgIHNlbGYudG9nZ2xlT25nb2luZyh0aGlzLmlkKTtcbiAgICB9KVxuICB9O1xuXG4gIHRoaXMuYWRkUm93ID0gZnVuY3Rpb24oc2V0Rm9jdXMpIHtcbiAgICB0aGlzLmNvdW50ZXIrKztcbiAgICAkKCcjdGFzay10YWJsZS1ib2R5JykuYXBwZW5kKFxuICAgICAgICAnPHRyIGNsYXNzPVwidGFza1wiIGlkPVwidGFzay0nICsgdGhpcy5jb3VudGVyICsgJ1wiPicgK1xuICAgICAgICAnPHRkPjxkaXYgY2xhc3M9XCJpbnB1dC1hcHBlbmQgZGF0ZVwiPjxpbnB1dCBjbGFzcz1cImZvcm0tY29udHJvbFwiIGlkPVwiZGF0ZXBpY2tlci1zdGFydC0nICsgdGhpcy5jb3VudGVyICsgJ1wiIHNpemU9XCIxNlwiIHR5cGU9XCJ0ZXh0XCIgcmVhZG9ubHk+PHNwYW4gY2xhc3M9XCJhZGQtb25cIj48aSBjbGFzcz1cImljb24tdGhcIj48L2k+PC9zcGFuPjwvZGl2PjwvdGQ+JyArXG4gICAgICAgICc8dGQ+PGRpdiBjbGFzcz1cImlucHV0LWFwcGVuZCBkYXRlXCI+PGlucHV0IGNsYXNzPVwiZm9ybS1jb250cm9sXCIgaWQ9XCJkYXRlcGlja2VyLWVuZC0nICsgdGhpcy5jb3VudGVyICsgJ1wiIHNpemU9XCIxNlwiIHR5cGU9XCJ0ZXh0XCIgcmVhZG9ubHk+PHNwYW4gY2xhc3M9XCJhZGQtb25cIj48aSBjbGFzcz1cImljb24tdGhcIj48L2k+PC9zcGFuPjwvdGQ+JyArXG4gICAgICAgICc8dGQ+PGRpdiBjbGFzcz1cImNoZWNrYm94XCI+PGxhYmVsPjxpbnB1dCBjbGFzcz1cIm9uZ29pbmctY2hlY2tib3hcIiBpZD1cImRhdGVwaWNrZXItZW5kLScgKyB0aGlzLmNvdW50ZXIgKyAnLW9uZ29pbmdcIiB0eXBlPVwiY2hlY2tib3hcIj4mbmJzcDtPbmdvaW5nPC9sYWJlbD48L2Rpdj48L3RkPicgK1xuICAgICAgICAnPHRkPjxpbnB1dCBjbGFzcz1cImZvcm0tY29udHJvbFwiIGlkPVwibGFiZWwtJyArIHRoaXMuY291bnRlciArICdcIiB0eXBlPVwidGV4dFwiPjwvdGQ+JyArXG4gICAgICAgICc8dGQ+PGlucHV0IGNsYXNzPVwiZm9ybS1jb250cm9sXCIgaWQ9XCJtaWxlc3RvbmVzLScgKyB0aGlzLmNvdW50ZXIgKyAnXCIgdHlwZT1cInRleHRcIiBwbGFjZWhvbGRlcj1cIjIwMDEtMDEtMDEsIC4uLlwiPjwvdGQ+JyArXG4gICAgICAgICc8dGQ+PGlucHV0IGNsYXNzPVwiZm9ybS1jb250cm9sXCIgaWQ9XCJkYXRlU3RhbXBzLScgKyB0aGlzLmNvdW50ZXIgKyAnXCIgdHlwZT1cInRleHRcIiBwbGFjZWhvbGRlcj1cIjIwMDEtMDEtMDEsIC4uLlwiPjwvdGQ+JyArXG4gICAgICAgICc8dGQ+PGlucHV0IGNsYXNzPVwiZm9ybS1jb250cm9sXCIgaWQ9XCJzdGFydFRvLScgKyB0aGlzLmNvdW50ZXIgKyAnXCIgdHlwZT1cInRleHRcIiBwbGFjZWhvbGRlcj1cIjEsIDJcIj48L3RkPicgK1xuICAgICAgICAnPHRkPjxpbnB1dCBjbGFzcz1cImZvcm0tY29udHJvbFwiIGlkPVwiZW5kVG8tJyArIHRoaXMuY291bnRlciArICdcIiB0eXBlPVwidGV4dFwiIHBsYWNlaG9sZGVyPVwiMywgNFwiPjwvdGQ+JyArXG4gICAgICAgICc8dGQ+PGlucHV0IGNsYXNzPVwiZm9ybS1jb250cm9sXCIgaWQ9XCJyZWN1ci0nICsgdGhpcy5jb3VudGVyICsgJ1wiIHR5cGU9XCJ0ZXh0XCIgcGxhY2Vob2xkZXI9XCI3XCI+PC90ZD4nICtcbiAgICAgICAgJzx0ZD48YnV0dG9uIGNsYXNzPVwidXAtYnV0dG9uIGJ0biBidG4tZGVmYXVsdFwiIGlkPVwidXAtYnV0dG9uLScgKyB0aGlzLmNvdW50ZXIgKyAnXCI+JnVhcnI7PC9idXR0b24+PC90ZD4nICtcbiAgICAgICAgJzx0ZD48YnV0dG9uIGNsYXNzPVwiZG93bi1idXR0b24gYnRuIGJ0bi1kZWZhdWx0XCIgaWQ9XCJkb3duLWJ1dHRvbi0nICsgdGhpcy5jb3VudGVyICsgJ1wiPiZkYXJyOzwvYnV0dG9uPjwvdGQ+JyArXG4gICAgICAgICc8dGQ+PGJ1dHRvbiBjbGFzcz1cImRlbGV0ZS1idXR0b24gYnRuIGJ0bi1kZWZhdWx0XCIgaWQ9XCJkZWxldGUtYnV0dG9uLScgKyB0aGlzLmNvdW50ZXIgKyAnXCI+JmNyb3NzOzwvYnV0dG9uPjwvdGQ+JyArXG4gICAgICAgICc8L3RyPidcbiAgICAgICAgKTtcbiAgICAkKCcjZGF0ZXBpY2tlci1zdGFydC0nICsgdGhpcy5jb3VudGVyICsgJywjZGF0ZXBpY2tlci1lbmQtJyArIHRoaXMuY291bnRlcikuZGF0ZXBpY2tlcih7Zm9ybWF0OiBcInl5eXktbW0tZGRcIn0pO1xuXG4gICAgaWYgKHNldEZvY3VzKSB7XG4gICAgICAkKCcjZGF0ZXBpY2tlci1zdGFydC0nICsgdGhpcy5jb3VudGVyKS5mb2N1cygpO1xuICAgIH1cblxuICAgIHRoaXMuYWRkVGFibGVCdXR0b25IYW5kbGVycygpO1xuXG4gICAgcmV0dXJuIHRoaXMuY291bnRlcjtcbiAgfTtcblxuICB0aGlzLnNlcmlhbGl6ZSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBvYmogPSB7XG4gICAgICBcInNldHRpbmdzXCI6IHtcblxuICAgICAgfSxcbiAgICAgIFwidGFza3NcIjogW10sXG4gICAgICBcInRoZW1lXCI6IHtcbiAgICAgICAgXCJmcmFtZUJvcmRlckNvbG9yXCI6IFwiI2ZmZmZmZlwiLFxuICAgICAgICBcImZyYW1lRmlsbENvbG9yXCI6IFwiIzg4ODg4OFwiLFxuICAgICAgICBcInN0cmlwZUNvbG9yRGFya1wiOiBcIiNkZGRkZGRcIixcbiAgICAgICAgXCJzdHJpcGVDb2xvckxpZ2h0XCI6IFwiI2VlZWVlZVwiLFxuICAgICAgICBcImdyaWRDb2xvclwiOiBcIiM5OTk5OTlcIlxuICAgICAgfVxuICAgIH07XG5cbiAgICAvL3Rhc2tzXG4gICAgdmFyIHRhc2tzID0gJCgnLnRhc2snKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRhc2tzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgdGFzayA9IHRhc2tzW2ldO1xuICAgICAgdmFyIGlkID0gdGFzay5pZDtcbiAgICAgIHZhciBpZE51bSA9IGlkLnJlcGxhY2UoL150YXNrLS8sIFwiXCIpO1xuXG4gICAgICB2YXIgc3RhcnREYXRlID0gJCgnI2RhdGVwaWNrZXItc3RhcnQtJyArIGlkTnVtKS5kYXRlcGlja2VyKFwiZ2V0Rm9ybWF0dGVkRGF0ZVwiKTtcbiAgICAgIHZhciBlbmREYXRlID0gJCgnI2RhdGVwaWNrZXItZW5kLScgKyBpZE51bSkuZGF0ZXBpY2tlcihcImdldEZvcm1hdHRlZERhdGVcIik7XG4gICAgICB2YXIgZW5kRGF0ZU9uZ29pbmcgPSAkKCcjZGF0ZXBpY2tlci1lbmQtJyArIGlkTnVtICsgJy1vbmdvaW5nJykucHJvcCgnY2hlY2tlZCcpOyBcbiAgICAgIGlmIChlbmREYXRlT25nb2luZykge1xuICAgICAgICBlbmREYXRlID0gXCItXCI7XG4gICAgICB9XG4gICAgICB2YXIgbGFiZWwgPSAkKCcjbGFiZWwtJyArIGlkTnVtKS52YWwoKTtcblxuICAgICAgdmFyIHRhc2tPYmogPSB7fTtcbiAgICAgIHRhc2tPYmouc3RhcnQgPSBzdGFydERhdGU7XG4gICAgICB0YXNrT2JqLmxhYmVsID0gbGFiZWw7XG5cbiAgICAgIC8vZW5kIGlzIG9wdGlvbmFsIC0gbm90IHN1cHBseWluZyBlbmQgaXMgcGVyZmVjdGx5IHZhbGlkXG4gICAgICAvLy0gc2lnbmlmaWVzICd0b2RheScgc28gdHJlYXRpbmcgJ2JsYW5rJyBhcyBzaWduaWZpY2FudCBpcyBoZWxwZnVsIGhlcmVcbiAgICAgIGlmIChlbmREYXRlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgdGFza09iai5lbmQgPSBlbmREYXRlO1xuICAgICAgfVxuXG4gICAgICBvYmoudGFza3MucHVzaCh0YXNrT2JqKTtcbiAgICB9XG5cbiAgICAvL3NldHRpbmdzIC0gZW5mb3JjZSBzYW5lIHZhbHVlc1xuICAgIC8vVE9ETzogdXNlIHNjaGVtYSBsaW1pdHNcbiAgICBvYmouc2V0dGluZ3MuZW5kID0gJCgnI2RhdGVwaWNrZXItZW5kJykuZGF0ZXBpY2tlcihcImdldEZvcm1hdHRlZERhdGVcIik7XG4gICAgdmFyIHNldHRpbmdFbmREYXRlT25nb2luZyA9ICQoJyNkYXRlcGlja2VyLWVuZC1vbmdvaW5nJykucHJvcCgnY2hlY2tlZCcpO1xuICAgIGlmIChzZXR0aW5nRW5kRGF0ZU9uZ29pbmcpIHtcbiAgICAgIG9iai5zZXR0aW5ncy5lbmQgPSBcIi1cIjtcbiAgICB9XG4gICAgdmFyIHpvb21WYWwgPSBOdW1iZXIoJCgnI3pvb20taW5wdXQnKS52YWwoKSk7XG4gICAgb2JqLnNldHRpbmdzLnpvb20gPSAoem9vbVZhbCA+PSA1MCAmJiB6b29tVmFsIDw9IDMwMCkgPyB6b29tVmFsIDogMTUwO1xuICAgIHZhciBoaWRlRGF5c0Zyb21WYWwgPSBOdW1iZXIoJCgnI2hpZGUtZGF5cy1mcm9tLWlucHV0JykudmFsKCkpO1xuICAgIG9iai5zZXR0aW5ncy5oaWRlRGF5c0Zyb20gPSAoaGlkZURheXNGcm9tVmFsID49IDEgJiYgaGlkZURheXNGcm9tVmFsIDw9IDM2NSkgPyBoaWRlRGF5c0Zyb1ZhbCA6IDkwO1xuICAgIHZhciBoaWRlV2Vla3NGcm9tVmFsID0gTnVtYmVyKCQoJyNoaWRlLXdlZWtzLWZyb20taW5wdXQnKS52YWwoKSk7XG4gICAgb2JqLnNldHRpbmdzLmhpZGVXZWVrc0Zyb20gPSAoaGlkZVdlZWtzRnJvbVZhbCA+PSAxICYmIGhpZGVXZWVrc0Zyb21WYWwgPD0gMTQ2MCkgPyBoaWRlV2Vla3NGcm9tVmFsIDogMTgwO1xuXG4gICAgLy90aGVtZVxuICAgIHZhciBjb2xvclNjaGVtZVZhbCA9ICQoJyNjb2xvci1zY2hlbWUtc2VsZWN0JykudmFsKCk7XG4gICAgb2JqLnRoZW1lLmNvbG9yU2NoZW1lID0gKGNvbG9yU2NoZW1lVmFsLmxlbmd0aCA+IDApID8gY29sb3JTY2hlbWVWYWwgOiBcImdyYWRpZW50XCI7XG4gICAgb2JqLnRoZW1lLmJvcmRlckNvbG9yMSA9ICQoJyNjb2xvci1waWNrZXItYm9yZGVyLTEnKS5jb2xvcnBpY2tlcignZ2V0VmFsdWUnLCAnI2ZmZmZmZicpO1xuICAgIG9iai50aGVtZS5maWxsQ29sb3IxID0gJCgnI2NvbG9yLXBpY2tlci1maWxsLTEnKS5jb2xvcnBpY2tlcignZ2V0VmFsdWUnLCAnI2ZmZmZmZicpO1xuICAgIG9iai50aGVtZS5ib3JkZXJDb2xvcjIgPSAkKCcjY29sb3ItcGlja2VyLWJvcmRlci0yJykuY29sb3JwaWNrZXIoJ2dldFZhbHVlJywgJyNmZmZmZmYnKTtcbiAgICBvYmoudGhlbWUuZmlsbENvbG9yMiA9ICQoJyNjb2xvci1waWNrZXItZmlsbC0yJykuY29sb3JwaWNrZXIoJ2dldFZhbHVlJywgJyNmZmZmZmYnKTtcbiAgICBvYmoudGhlbWUuZnJhbWVCb3JkZXJDb2xvciA9ICQoJyNjb2xvci1waWNrZXItZnJhbWUtYm9yZGVyJykuY29sb3JwaWNrZXIoJ2dldFZhbHVlJywgJyNmZmZmZmYnKTtcbiAgICBvYmoudGhlbWUuZnJhbWVGaWxsQ29sb3IgPSAkKCcjY29sb3ItcGlja2VyLWZyYW1lLWZpbGwnKS5jb2xvcnBpY2tlcignZ2V0VmFsdWUnLCAnI2ZmZmZmZicpO1xuICAgIG9iai50aGVtZS5zdHJpcGVDb2xvckRhcmsgPSAkKCcjY29sb3ItcGlja2VyLXN0cmlwZS1kYXJrJykuY29sb3JwaWNrZXIoJ2dldFZhbHVlJywgJyNmZmZmZmYnKTtcbiAgICBvYmoudGhlbWUuc3RyaXBlQ29sb3JMaWdodCA9ICQoJyNjb2xvci1waWNrZXItc3RyaXBlLWxpZ2h0JykuY29sb3JwaWNrZXIoJ2dldFZhbHVlJywgJyNmZmZmZmYnKTtcbiAgICBvYmoudGhlbWUuc3RyaXBlR3JpZENvbG9yID0gJCgnI2NvbG9yLXBpY2tlci1ncmlkJykuY29sb3JwaWNrZXIoJ2dldFZhbHVlJywgJyNmZmZmZmYnKTtcblxuICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShvYmopO1xuICB9XG5cbiAgdGhpcy5wb3N0ID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGpzb24gPSB0aGlzLnNlcmlhbGl6ZSgpO1xuICAgICQucG9zdChcbiAgICAgICAgXCIvdGltZWxpbmVcIixcbiAgICAgICAganNvbixcbiAgICAgICAgZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICQoXCIjcmVzdWx0XCIpLmh0bWwoZGF0YSk7XG5cbiAgICAgICAgICBpZiAoanNvbi5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICQoJyNzb3VyY2UtZGl2JykuY3NzKHtcImRpc3BsYXlcIjogXCJub25lXCJ9KTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgICAgJChcIiNzb3VyY2UtZGl2XCIpLmNzcyh7XCJkaXNwbGF5XCI6IFwiYmxvY2tcIn0pO1xuICAgICAgICAgICQoXCIjc291cmNlXCIpWzBdLnZhbHVlID0ganNvbjtcbiAgICAgICAgfVxuICAgICAgICApO1xuICB9O1xuXG4gIHRoaXMudXAgPSBmdW5jdGlvbihpZCkge1xuICAgIHZhciByb3dJZCA9IGlkLnJlcGxhY2UoL151cC1idXR0b24vLCAnI3Rhc2snKTtcbiAgICAkKHJvd0lkKS5wcmV2KCkuYmVmb3JlKCQocm93SWQpKTtcbiAgICB0aGlzLmFkZFRhYmxlQnV0dG9uSGFuZGxlcnMoKTtcbiAgfTtcblxuICB0aGlzLmRvd24gPSBmdW5jdGlvbihpZCkge1xuICAgIHZhciByb3dJZCA9IGlkLnJlcGxhY2UoL15kb3duLWJ1dHRvbi8sICcjdGFzaycpO1xuICAgICQocm93SWQpLm5leHQoKS5hZnRlcigkKHJvd0lkKSk7XG4gICAgdGhpcy5hZGRUYWJsZUJ1dHRvbkhhbmRsZXJzKCk7XG4gIH07XG5cbiAgdGhpcy5kZWxldGUgPSBmdW5jdGlvbihpZCkge1xuICAgIHZhciByb3dJZCA9IGlkLnJlcGxhY2UoL15kZWxldGUtYnV0dG9uLywgJyN0YXNrJyk7XG4gICAgJChyb3dJZCkucmVtb3ZlKCk7XG4gICAgdGhpcy5hZGRUYWJsZUJ1dHRvbkhhbmRsZXJzKCk7XG4gIH07XG5cbiAgdGhpcy50b2dnbGVPbmdvaW5nID0gZnVuY3Rpb24oaWQpIHtcbiAgICB2YXIgZGF0ZXBpY2tlcklkID0gaWQucmVwbGFjZSgvLW9uZ29pbmckLywgJycpO1xuICAgIFxuICAgIC8vcmVzZXQgZmllbGQgaWYgb25nb2luZyBpcyBkZXNlbGVjdGVkXG4gICAgLy9vdGhlcndpc2UgdGhlcmUgd291bGQgYmUgbm8gd2F5IHRvIGNsZWFyIHRoZSBmaWVsZFxuICAgIGlmICgkKCcjJyArIGlkKS5wcm9wKCdjaGVja2VkJykgPT09IGZhbHNlKSB7XG4gICAgICAkKCcjJyArIGRhdGVwaWNrZXJJZCkuZGF0ZXBpY2tlcigndXBkYXRlJywgJycpO1xuICAgIH1cbiAgfVxuXG4gIHRoaXMuaW1wb3J0ID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHMgPSAkKCcjbW9kYWwtc291cmNlJylbMF0udmFsdWU7XG4gICAgdHJ5IHtcbiAgICAgIHZhciBvYmogPSBKU09OLnBhcnNlKHMpO1xuICAgIH0gY2F0Y2goZSkge1xuICAgICAgJCgnI3Jlc3VsdCcpWzBdLmlubmVySFRNTCA9IGUubWVzc2FnZTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAob2JqID09PSB7fSB8fCBvYmogPT09IG51bGwgfHwgdHlwZW9mKG9iaikgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAkKCcjcmVzdWx0JylbMF0uaW5uZXJIVE1MID0gXCJObyB0aW1lbGluZSBkYXRhIGZvdW5kXCI7XG4gICAgfVxuXG4gICAgdGhpcy5jbGVhclRhc2tzKCk7XG4gICAgaWYgKG9iai50YXNrcykge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBvYmoudGFza3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIHRhc2sgPSBvYmoudGFza3NbaV1cbiAgICAgICAgICB2YXIgY291bnRlciA9IHRoaXMuYWRkUm93KGZhbHNlKTtcblxuICAgICAgICAkKCcjZGF0ZXBpY2tlci1zdGFydC0nICsgY291bnRlcikuZGF0ZXBpY2tlcigndXBkYXRlJywgdGFzay5zdGFydCk7XG5cbiAgICAgICAgdmFyIG9uZ29pbmcgPSAodGFzay5lbmQgPT09IFwiLVwiKTtcbiAgICAgICAgJCgnI2RhdGVwaWNrZXItZW5kLScgKyBjb3VudGVyKS5kYXRlcGlja2VyKCd1cGRhdGUnLCAob25nb2luZykgPyBcIlwiIDogdGFzay5lbmQpO1xuICAgICAgICAkKCcjZGF0ZXBpY2tlci1lbmQtJyArIGNvdW50ZXIgKyAnLW9uZ29pbmcnKS5wcm9wKCdjaGVja2VkJywgb25nb2luZyk7XG4gICAgICAgICQoJyNsYWJlbC0nICsgY291bnRlcikudmFsKHRhc2subGFiZWwpO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAob2JqLnNldHRpbmdzKSB7XG4gICAgICB2YXIgc2V0dGluZ3MgPSBvYmouc2V0dGluZ3NcbiAgICAgICAgdmFyIG9uZ29pbmcgPSAoc2V0dGluZ3MuZW5kID09PSBcIi1cIik7XG4gICAgICAkKCcjZGF0ZXBpY2tlci1lbmQnKS5kYXRlcGlja2VyKCd1cGRhdGUnLCAob25nb2luZykgPyBcIlwiIDogc2V0dGluZ3MuZW5kKTtcbiAgICAgICQoJyNkYXRlcGlja2VyLWVuZC1vbmdvaW5nJykucHJvcCgnY2hlY2tlZCcsIG9uZ29pbmcpO1xuICAgICAgJCgnI3pvb20taW5wdXQnKS52YWwoc2V0dGluZ3Muem9vbSk7XG4gICAgICAkKCcjaGlkZS1kYXlzLWZyb20taW5wdXQnKS52YWwoc2V0dGluZ3MuaGlkZURheXNGcm9tKTtcbiAgICAgICQoJyNoaWRlLXdlZWtzLWZyb20taW5wdXQnKS52YWwoc2V0dGluZ3MuaGlkZVdlZWtzRnJvbSk7XG4gICAgfVxuICAgIGlmIChvYmoudGhlbWUpIHtcbiAgICAgIHZhciB0aGVtZSA9IG9iai50aGVtZTtcbiAgICAgICQoJyNjb2xvci1zY2hlbWUtc2VsZWN0JykudmFsKHRoZW1lLmNvbG9yU2NoZW1lKTtcbiAgICAgICQoJyNjb2xvci1waWNrZXItYm9yZGVyLTEnKS5jb2xvcnBpY2tlcignc2V0VmFsdWUnLCB0aGVtZS5ib3JkZXJDb2xvcjEpO1xuICAgICAgJCgnI2NvbG9yLXBpY2tlci1maWxsLTEnKS5jb2xvcnBpY2tlcignc2V0VmFsdWUnLCB0aGVtZS5maWxsQ29sb3IxKTtcbiAgICAgICQoJyNjb2xvci1waWNrZXItYm9yZGVyLTInKS5jb2xvcnBpY2tlcignc2V0VmFsdWUnLCB0aGVtZS5ib3JkZXJDb2xvcjIpO1xuICAgICAgJCgnI2NvbG9yLXBpY2tlci1maWxsLTInKS5jb2xvcnBpY2tlcignc2V0VmFsdWUnLCB0aGVtZS5maWxsQ29sb3IyKTtcbiAgICAgICQoJyNjb2xvci1waWNrZXItZnJhbWUtYm9yZGVyJykuY29sb3JwaWNrZXIoJ3NldFZhbHVlJywgdGhlbWUuZnJhbWVCb3JkZXJDb2xvcik7XG4gICAgICAkKCcjY29sb3ItcGlja2VyLWZyYW1lLWZpbGwnKS5jb2xvcnBpY2tlcignc2V0VmFsdWUnLCB0aGVtZS5mcmFtZUZpbGxDb2xvcik7XG4gICAgICAkKCcjY29sb3ItcGlja2VyLXN0cmlwZS1kYXJrJykuY29sb3JwaWNrZXIoJ3NldFZhbHVlJywgdGhlbWUuc3RyaXBlQ29sb3JEYXJrKTtcbiAgICAgICQoJyNjb2xvci1waWNrZXItc3RyaXBlLWxpZ2h0JykuY29sb3JwaWNrZXIoJ3NldFZhbHVlJywgdGhlbWUuc3RyaXBlQ29sb3JMaWdodCk7XG4gICAgICAkKCcjY29sb3ItcGlja2VyLWdyaWQnKS5jb2xvcnBpY2tlcignc2V0VmFsdWUnLCB0aGVtZS5ncmlkQ29sb3IpO1xuICAgIH1cbiAgfTtcblxuICB0aGlzLmNsZWFyVGFza3MgPSBmdW5jdGlvbigpIHtcbiAgICAkKCcjdGFzay10YWJsZS1ib2R5JylbMF0uaW5uZXJIVE1MID0gJyc7XG4gIH07XG59O1xuXG5mdW5jdGlvbiBtYWluRnVuYygpIHtcbiAgdmFyIGFwcCA9IG5ldyBBcHAoKTtcbiAgYXBwLmluaXQoKTtcbn1cblxud2luZG93Lm9ubG9hZCA9IG1haW5GdW5jO1xuIl19
