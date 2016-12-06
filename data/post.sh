#!/bin/sh
curl -X POST -d '{"settings":{"end":"-","zoom":150,"hideDaysFrom":90,"hideWeeksFrom":180},"tasks":[{"start":"2016-01-01","end":"2016-01-25","label":"The houses are haunted","endTo":[1]},{"start":"2016-02-01","end":"-","label":"By white night-gowns"}]}' http://localhost:8000/timeline
