timeline: generator for timelines and Gantt charts
==================================================

![Sample timeline](data/sample.png?raw=true "Sample timeline")

This is a tool for everyone fed up with dragging boxes, arrows and dotted lines across the screen.

The timeline is generated from a simple JSON file.

For example, the timeline above was generated from the following input:
```
{
  "title": "Sample timeline",
  "zoom": "200",
  "layoutSteps": [180, 365],
  "theme": {
    "name": "gradient"
    ...boring list of colors...
  },
  "tasks": [
    {
      "start": "2016-01-01",
      "end": "2016-01-10",
      "label": "Do I",
      "endTo": [2]
    },
		{
			"start": "2016-02-12",
			"end": "2016-02-13",
			"label": "Dare",
			"recur": "14"
		},
		{
			"start": "2016-02-25",
			"end": "2016-04-10",
			"label": "Disturb",
			"milestones": ["2016-02-25"],
			"startTo": [1]
		},
		{
			"start": "2016-04-01",
			"end": "2016-05-03",
			"label": "The universe?",
	  	"milestones": ["2016-05-01"],
	  	"dateStamps": ["2016-04-01", "2016-05-01"]
		}
	]
}
```

Where do I start?
-----------------
The best place to start is to create a timeline of your own.

The input JSON begins with some preliminary housekeeping info. `zoom` could be set to 100% or 200%, for example, and the `theme` property currently take one of two forms: 'gradient' (the option used here) paints tasks starting with one color and gradually reaching a second; 'duration' uses the first color for the shortest duration and the second for the longest.

The JSON then defines each task to be visualized. Each task has to have a `start` and `end`. The `label` is shown to the left of the task and can be left blank. Each date string is formatted `yyyy-mm-dd`.

Milestones and date stamps can be specified as an array formatted the same way. Milestones are shown as diamond shapes; date stamps are vertical lines with day and month printed below. For milestones with date stamps the two can be combined.

The `startTo` and `endTo` properties convey arrow dependencies. For example...
```
"endTo": [1, 2]
```
...draws two arrows starting at the end of the task, one pointing to the next task and another to the task after that.

Build
-----
Install Go using one of the installers available from `https://golang.org/dl/` and set up your $GOPATH as you see fit.

That done, install `draw2d`:

```
$ go get -u github.com/llgcode/draw2d
```

Now it's time to clone `github.com/gerald1248/timeline`. The folder structure below `$GOPATH` could look as follows:
```
src
└── github.com
    └── gerald1248
        └── timeline
            ├── README.md
            ├── calendar.go
            ├── calendar_test.go
            ├── contributors.txt
            ├── data
            │   ├── sample.json
            │   └── sample.png
            ├── data.go
            ├── data_test.go
            ├── dist
            │   └── timeline-0.1.0.zip
            ├── draw.go
            ├── exclude -> /Users/tc/git/tc/documents/developers/src/timelines
            └── gulpfile.js
```

Next, it's worth installing `npm` and `gulp` as the default task...
```
$ gulp
```
...will compile `timeline` from source, run the tests (very sketchy for now, sorry!), check the source format and write out a distributable zip for your operating system. (Only tested on MacOS for now as it's very early days.)

You can also run `gulp build`, `gulp test`, etc. individually if you wish.

