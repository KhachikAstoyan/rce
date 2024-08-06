package utils

import (
	"strconv"

	"github.com/labstack/echo/v4"
	"gorm.io/gorm"
)

const PAGE_FIELD string = "page"
const PAGE_SIZE_FIELD string = "pageSize"

func Paginate(c *echo.Context) func(db *gorm.DB) *gorm.DB {
	return func(db *gorm.DB) *gorm.DB {
		c := (*c)

		page, pageSize := ValidatePagination(c.QueryParam(PAGE_FIELD), c.QueryParam(PAGE_SIZE_FIELD))

		println(page, pageSize)

		offset := (page - 1) * pageSize
		return db.Offset(offset).Limit(pageSize)
	}
}

func ValidatePagination(p, ps string) (page int, pageSize int) {
	page, _ = strconv.Atoi(p)

	if page <= 0 {
		page = 1
	}

	pageSize, _ = strconv.Atoi(ps)

	switch {
	case pageSize > 100:
		pageSize = 100
	case pageSize <= 0:
		pageSize = 10
	}

	return page, pageSize
}
