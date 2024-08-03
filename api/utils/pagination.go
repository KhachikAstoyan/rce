package utils

import (
	"strconv"

	"github.com/labstack/echo/v4"
	"gorm.io/gorm"
)

func Paginate(c *echo.Context) func(db *gorm.DB) *gorm.DB {
	return func(db *gorm.DB) *gorm.DB {
		c := (*c)
		page, _ := strconv.Atoi(c.QueryParam("page"))

		if page <= 0 {
			page = 1
		}

		pageSize, _ := strconv.Atoi(c.QueryParam("pageSize"))

		switch {
		case pageSize > 100:
			pageSize = 100
		case pageSize <= 0:
			pageSize = 10
		}

		println(page, pageSize)

		offset := (page - 1) * pageSize
		return db.Offset(offset).Limit(pageSize)
	}
}
