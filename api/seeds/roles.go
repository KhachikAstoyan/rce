package seeds

import (
	"fmt"

	"github.com/KhachikAstoyan/toy-rce-api/models"
	"gorm.io/gorm"
)

func RoleSeeds(db *gorm.DB) {
  fmt.Printf("Seeding roles")
	roles := []models.Role{
		{Name: "admin", Permissions: []models.Permission{{Name: "*"},
		}},
	}

  err := db.Create(&roles).Error

  if err != nil {
    fmt.Printf("[ERROR] couldn't seed roles and permissions")
  }
}
