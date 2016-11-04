package main

import "testing"

func TestCalcStep(t *testing.T) {
	first1, second1, length1 := 10, 50, 10
	step1 := calcStep(first1, second1, length1)
	first2, second2, length2 := 50, 10, 10
	step2 := calcStep(first2, second2, length2)
	first3, second3, length3 := 10, 50, 0
	step3 := calcStep(first3, second3, length3)
	first4, second4, length4 := 10, 10, 10
	step4 := calcStep(first4, second4, length4)

	if step1 != 4 || step2 != -4 || step3 != 40 || step4 != 0 {
		t.Errorf("Step calculation faulty: %d, %d, %d, %d", step1, step2, step3, step4)
	}
}
