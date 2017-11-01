export const clubId = 80327326;

export function getInvalidToken() {
    return {
        "message": "Bad Request",
        "errors": [
            {
                "resource": "RequestToken",
                "field": "code",
                "code": "invalid"
            }
        ]
    };
}

export const mockedAthlete = {
    "id": 227615,
    "resource_state": 2,
    "firstname": "John",
    "lastname": "Applestrava",
    "profile_medium": "http://pics.com/227615/medium.jpg",
    "profile": "http://pics.com/227615/large.jpg",
    "city": "San Francisco",
    "state": "California",
    "country": "United States",
    "sex": "M",
    "premium": true,
    "email": "john@applestrava.com",
    "created_at": "2008-01-01T17:44:00Z",
    "updated_at": "2013-09-04T20:00:50Z"
};

export const mockedAccesstoken = "83ebeabdec09f6670863766f792ead24d61fe3f9";

export function getValidToken() {
    return {
        access_token: mockedAccesstoken,
        athlete: mockedAthlete
    };
}

export const mockedClub = {
    "id": clubId,
    "resource_state": 2,
    "name": "Team Strava Cycling",
    "profile_medium": "http://pics.com/clubs/1/medium.jpg",
    "profile": "http://pics.com/clubs/1/large.jpg",
    "cover_photo": "http://pics.com/clubs/1/cover/large.jpg",
    "cover_photo_small": "http://pics.com/clubs/1/cover/small.jpg",
    "sport_type": "cycling",
    "city": "San Francisco",
    "state": "California",
    "country": "United States",
    "private": true,
    "member_count": 23,
    "featured": false,
    "verified": false,
    "url": "strava-cycling"
};

export function listAthleteClubs() {
    return [mockedClub];
}
