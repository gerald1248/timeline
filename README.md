timeline: generator for timelines and Gantt charts
==================================================

![Sample timeline](data/sample.png?raw=true "Sample timeline")
**Fig. 1** Sample timeline

This is a tool for everyone fed up with dragging boxes, arrows and dotted lines across the screen.

The timeline is generated from a simple JSON file.

For example, the timeline in **Fig. 1** above was generated from the following input:
```
{
  "title": "Sample timeline",
  "zoom": "200",
  "layoutSteps": [180, 365],
  "theme": {
    "name": "gradient",
    ... 
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
![Another sample timeline](data/sample_duration.png?raw=true "Another sample timeline")
**Fig. 2** Another sample timeline (colors indicate task duration)
The best place to start is to create a timeline of your own.

The input JSON begins with some preliminary housekeeping info. `zoom` could be set to 100% or 200%, for example, and the `theme` currently takes one of two forms: 'gradient' (the option used here) paints tasks starting with one color and gradually reaching a second; 'duration' uses the first color for the shortest duration and the second for the longest.

The JSON then defines each task to be visualized. Each task has to have a `start` and `end`. The `label` is shown to the left of the task and can be left blank. Each date string is formatted `yyyy-mm-dd`.

Milestones and date stamps can be specified as an array formatted the same way. Milestones are shown as diamond shapes; date stamps are vertical lines with day and month printed below. For milestones with date stamps the two can be combined.

The `startTo` and `endTo` properties convey arrow dependencies. Take the following example:
```
"endTo": [1, 2]
```
This configuration draws two arrows starting at the end of the current task, one pointing to the next task and another to the task after that.

Running `timeline`
------------------
![Unthemed sample timeline](data/sample_unthemed.png?raw=true "Unthemed sample timeline")
**Fig. 3** Unthemed timeline

If there is a *.zip for your operating system under `timeline/dist`, you can download the zip and enter:
```
$ ./timeline path/to/some/datafile.json
```
In this case, `timeline` will parse `path/to/some/datafile.json` and generate a PNG image `path/to/some/datafile.png` from it. Calling `timeline` without parameters will print the usage info:
```
Usage: ./timeline <JSON file> [<JSON file>]
```

Build
-----
Install Go using one of the installers available from `https://golang.org/dl/` and set up your `$GOPATH` as you see fit.

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
            │   ├── sample.png
            │   ├── sample_duration.json
            │   └── sample_duration.png
            ├── data.go
            ├── data_test.go
            ├── dist
            │   └── timeline-0.1.0-darwin.zip
            ├── draw.go
            ├── gulpfile.js
            ├── package.json
            ├── theme.go
            ├── theme_test.go
            └── timeline.go
```

Next, it's worth installing Node.js and entering:
```
$ npm install gulp
$ npm install
```
With that, the workspace is ready. The default task (triggered by `gulp`) compiles `timeline` from source, runs the tests (very sketchy for now, sorry!), checks the source format, generates a sample timeline and writes out a distributable zip for your operating system. (Only tested on MacOS as it's early days.)

You can also run `gulp build`, `gulp test`, etc. individually if you wish.

