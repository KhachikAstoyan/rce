package utils

import (
	"regexp"
)

var uuidRegex = regexp.MustCompile(`^[a-fA-F0-9-]{36}$`)

func IsUUID(id string) bool {
	return uuidRegex.Match([]byte(id))
}
