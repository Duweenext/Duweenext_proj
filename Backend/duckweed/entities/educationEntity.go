package entities


type (
	// // InsertEducationDto defines the structure for creating a new education post.
	// InsertEducationDto struct {
	// 	PostTitle  string `json:"postTitle"`
	// 	PostDetail string `json:"postDetail"`
	// 	ImageURL   string `json:"imageURL"`
	// 	Quote      string `json:"quote"`
	// }

	// Education represents the education entity.
	Education struct {
		PostID     *uint  `gorm:"primaryKey;autoIncrement"`
		PostTitle  *string 
		PostDetail *string 
		ImageURL   *string
		Quote      *string 
	}

	// // EducationResponseDto defines the structure for responding with education post data.
	// EducationResponseDto struct {
	// 	PostID     int64  `json:"postId"`
	// 	PostTitle  string `json:"postTitle"`
	// 	PostDetail string `json:"postDetail"`
	// 	ImageURL   string `json:"imageURL"`
	// 	Quote      string `json:"quote"`
	// }
)