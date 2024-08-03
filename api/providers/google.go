package providers

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	"github.com/KhachikAstoyan/toy-rce-api/core"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
)

type GoogleProfile struct {
	Email         string `json:"email"`
	FamilyName    string `json:"family_name"`
	GivenName     string `json:"given_name"`
	ID            string `json:"id"`
	Name          string `json:"name"`
	Picture       string `json:"picture"`
	VerifiedEmail bool   `json:"verified_email"`
}

var (
	GoogleOauthStateString = "somerandomjibberish"
)

func GetGoogleOauthConfig(app *core.App) *oauth2.Config {
	return &oauth2.Config{
		RedirectURL:  fmt.Sprintf("%s/auth/google/callback", app.Config.ServerURL),
		ClientID:     app.Config.Auth.GcpClientID,
		ClientSecret: app.Config.Auth.GcpClientSecret,
		Scopes:       []string{"https://www.googleapis.com/auth/userinfo.email", "https://www.googleapis.com/auth/userinfo.profile"},
		Endpoint:     google.Endpoint,
	}
}

func GetGoogleUserInfo(client *http.Client) (*GoogleProfile, error) {
	response, err := client.Get("https://www.googleapis.com/oauth2/v2/userinfo")

	if err != nil {
		return nil, err
	}

	defer response.Body.Close()

	contents, err := io.ReadAll(response.Body)

	if err != nil {
		return nil, err
	}

	var userInfo GoogleProfile
	err = json.Unmarshal(contents, &userInfo)
	if err != nil {
		return nil, err
	}

	return &userInfo, nil
}
