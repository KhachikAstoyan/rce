package utils

import (
	"errors"

	"github.com/jackc/pgx/v5/pgconn"
)

func IsErrorCode(err error, errcode string) bool {
	var pgErr *pgconn.PgError

	if errors.As(err, &pgErr) && pgErr.Code == errcode {
		return true
	}

	return false
}
