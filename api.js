module.exports = {
    host:   "https://sode.su",
    domain: "sode.su",
    socket: "wss://sode.su/ws",
    params: {
        post:  "p",
        image: "i",
        video: "v",
        music: "m"
    },
    sections: {
        home:       "home",
        friends:    "friends",
        feed:       "feed",
        feedback:   "feedback",
        clubs:      "clubs",
        images:     "images",
        videos:     "videos",
        music:      "music",
        themes:     "themes",
        moderation: "moderation"
    },
    paths: {
        i18n:    "i18n/",
        layouts: "layouts/",
        scripts: "js/",
        posts:   "p/",
        images:  "i/",
        videos:  "v/",
        music:   "m/"
    },
    files: {
        stats:   "stats.json",
        profile: "profile.json",
        bio:     "bio.smu",
        wall:    "wall.json"
    },
    patterns: {
        entities: {
            user: "@*",
            club: "~*"
        },
        i18n:       "*.json",
        layout:     "*.html",
        script:     "*.js",
        post:       "*.json",
        image_info: "*.json",
        video_info: "*.json",
        music_info: "*.json",
        theme:      "*.css",
        theme_info: "*.json",
    },
    methods: {
        users: "api/users",
        me:    "api/me",
        auth:  "api/auth"
    },
    errors: {
        "ok":           0,
        "invalid_data": 1,
        "unauthorized": 2
    },
    limits: {
        comment_length: 1500,
        post_length:    15000,
        bio_length:     15000
    },
    langs: {
        eng: "English",
        rus: "Русский"
    },
    lang2to3: {
        "en": "eng",
        "ru": "rus",
        "ja": "nih"
    },
    lang3to2: {
        "eng": "en",
        "rus": "ru",
        "nih": "ja"
    },
    entities: {
        "@": "user",
        "~": "club"
    },
    file_formats: {
        themes: [ "css" ],
        images: [ "svg", "png", "gif", "jpeg", "webp", "bmp" ],
        videos: [ "webm", "mpeg", "mp4", "avi", "mov" ],
        audios: [ "mp3", "wav", "ogg" ]
    },
    default: {
        entity: {
            type: "user",
            id:   0
        },
        album: "@"
    }
};
