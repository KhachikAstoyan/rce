package models

import "time"

type RefreshToken struct {
	ID        string    `db:"id"`
	UserID    string    `db:"user_id"`
	Token     string    `db:"token"`
	CreatedAt time.Time `db:"created_at"`
	UpdatedAt time.Time `db:"updated_at"`
	ExpiresAt time.Time `db:"expires_at"`
}

// _, err := db.Exec(`
// 		CREATE TABLE IF NOT EXISTS refresh_tokens (
// 			id SERIAL PRIMARY KEY,
// 			user_id VARCHAR(255) NOT NULL,
// 			token TEXT NOT NULL,
// 			created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
// 			updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
// 			expires_at TIMESTAMP WITH TIME ZONE NOT NULL
// 		);
//
// 		CREATE OR REPLACE FUNCTION update_modified_column()
// 		RETURNS TRIGGER AS $$
// 		BEGIN
// 			NEW.updated_at = CURRENT_TIMESTAMP;
// 			RETURN NEW;
// 		END;
// 		$$ language 'plpgsql';
//
// 		DROP TRIGGER IF EXISTS update_refresh_token_modtime ON refresh_tokens;
//
// 		CREATE TRIGGER update_refresh_token_modtime
// 		BEFORE UPDATE ON refresh_tokens
// 		FOR EACH ROW
// 		EXECUTE FUNCTION update_modified_column();
// 	`)
