package main

import "testing"

func TestProcessBytes(t *testing.T) {
	dataTwoRows := []byte(`{
  "tasks": [
    {
      "start": "2016-01-01",
      "end": "2016-01-25",
      "label": "A"
    },
    {
      "start": "2016-02-01",
      "end": "2016-03-01",
      "label": "B"
    }
  ]
}`)
	dataOneRow := []byte(`{
  "tasks": [
    {
      "start": "2016-01-01",
      "end": "2016-01-25",
      "label": "A"
    }
  ]
}`)
	resultTwoRows := processBytes(dataTwoRows);
	resultOneRow := processBytes(dataOneRow);

	if resultTwoRows.Context == nil || resultOneRow.Context == nil {
		t.Errorf("drawScene() faulty\nTwo rows: %s\nOne row: %s", resultTwoRows.Message, resultOneRow.Message)
		return
	}

	// check that drawScene has worked
	ctxTwoRows := resultTwoRows.Context;
	ctxOneRow := resultOneRow.Context;

	heightTwoRows := ctxTwoRows.Height();
	heightOneRow:= ctxOneRow.Height();

	if heightOneRow >= heightTwoRows {
		t.Errorf("processBytes() faulty: %d should be <= %d", heightTwoRows, heightOneRow)
	}
}
