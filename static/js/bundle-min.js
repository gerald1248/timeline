function mainFunc(){var t=new App;t.init()}var App=function(){this.counter=0,this.init=function(){var t=this;this.addRow(),$("#add-task-button").on("click",function(){t.addRow()}),$("#show-timeline-button").on("click",function(){t.post()}),$("#color-picker-border-1,#color-picker-fill-1").colorpicker({format:"hex"}),$("#color-picker-border-2,#color-picker-fill-2").colorpicker({format:"hex"}),$("#datepicker-end").datepicker({format:"yyyy-mm-dd"}),$("#source").css({display:"none"})},this.addRow=function(){this.counter++,$("#task-table-body").append('<tr class="task" id="task-'+this.counter+'"><td><div class="input-append date"><input id="datepicker-start-'+this.counter+'" size="16" type="text" readonly><span class="add-on"><i class="icon-th"></i></span></div></td><td><div class="input-append date"><input id="datepicker-end-'+this.counter+'" size="16" type="text" readonly><span class="add-on"><i class="icon-th"></i></span>&nbsp;<input id="datepicker-end-'+this.counter+'-ongoing" type="checkbox">&nbsp;Ongoing</div></td><td><input id="label-'+this.counter+'" type="text"></td></tr>'),$("#datepicker-start-"+this.counter+",#datepicker-end-"+this.counter).datepicker({format:"yyyy-mm-dd"})},this.serialize=function(){for(var t={zoom:"100",layoutSteps:[180,365],tasks:[]},e=$(".task"),i=0;i<e.length;i++){var n=e[i],o=n.id,a=o.replace(/^task-/,""),s=$("#datepicker-start-"+a).datepicker("getFormattedDate"),r=$("#datepicker-end-"+a).datepicker("getFormattedDate"),c=$("#datepicker-end-"+a+"-ongoing").prop("checked");c&&(r="-");var d=$("#label-"+a).val(),p={};p.start=s,p.end=r,p.label=d,t.tasks.push(p)}return JSON.stringify(t)},this.post=function(){var t=this.serialize();console.log("attempting to post: "+t),$.post("/timeline",t,function(e){return $("#result").html(e),0===t.length?void $("#source").css({display:"none"}):($("#source").css({display:"block"}),void $("#source").html(t))})}};window.onload=mainFunc;