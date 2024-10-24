package utils

import "testing"

func TestIsUUID(t *testing.T) {
	res := IsUUID("550e8400-e29b-41d4-a716-446655440000")
	if res != true {
		t.Fatalf("Expected true, but got false")
	}

	res2 := IsUUID("something")
	if res2 != false {
		t.Fatalf("Expected false, but got true")
	}
}
