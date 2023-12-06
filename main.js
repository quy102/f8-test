const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const playlist = $(".playlist");
const cd = $(".cd");
const cdThumb = $(".cd-thumb");
const heading = $("header h2");
const audio = $("#audio");
const playBtn = $(".btn-toggle-play");
const pauseBtn = $(".icon-pause");
const player = $(".player");
const progress = $(".progress");
const nextBtn = $(".btn-next");
const prevBtn = $(".btn-prev");
const randomBtn = $(".btn-random");
const repeatBtn = $(".btn-repeat");

const app = {
    currentIndex: 0,

    isPlaying: false,

    isRandom: false,

    isRepeat: false,

    songs: [
        {
            name: "Look What You Made Me Do",
            singer: "Taylor Swift",
            path: "./assets/songs/Look-What-You-Made-Me-Do-Taylor-Swift.mp3",
            image: "./assets/img/look_what_you_made_me_do.jpg",
        },
        {
            name: "All I Want For Christmas Is You",
            singer: "Maria Carey",
            path: "./assets/songs/All-I-Want-For-Christmas-Is-You-Mariah-Carey.mp3",
            image: "./assets/img/All-I-Want-For-Christmas-Is-You.jpg",
        },
        {
            name: "At My Worst",
            singer: "Sympton",
            path: "./assets/songs/At-My-Worst-Sympton-X-Collective.mp3",
            image: "./assets/img/at-my-worst.jpg",
        },
        {
            name: "Perfect",
            singer: "Double-Chick",
            path: "./assets/songs/Perfect-Double-Chick.mp3",
            image: "./assets/img/perfect.jpg",
        },
        {
            name: "Vampire",
            singer: "Olivia-Rodrigo",
            path: "./assets/songs/vampire-Olivia-Rodrigo.mp3",
            image: "./assets/img/vampire.jpg",
        },
    ],

    render: function () {
        const htmls = this.songs.map((song, index) => {
            return `
            <div class="song data-index='${index}' ${
                index === this.currentIndex ? "active" : ""
            }">
                <div
                    class="thumb"
                    style="background-image: url('${song.image}');"
                ></div>
                <div class="body">
                    <h3 class="title">${song.name}</h3>
                    <p class="author">${song.singer}</p>
                </div>
                <div class="option">
                    <i class="fas fa-ellipsis-h"></i>
                </div>
            </div>
            `;
        });
        playlist.innerHTML = htmls.join("");
    },

    // define properties for this object. That means "app" has a property is "currentSong"
    defineProperties: function () {
        Object.defineProperty(this, "currentSong", {
            get: function () {
                return this.songs[this.currentIndex];
            },
        });
    },

    handleEvents: function () {
        // avoid unwants contexts
        const _this = this;

        // get width of cd
        const cdWidth = cd.offsetWidth;

        // event Scroll to Zoom / Scale cdThumb
        document.onscroll = function () {
            // get VERTICAL SCROLL
            const scrollTop =
                window.scrollY || document.documentElement.scrollTop;

            const newCdWidth = cdWidth - scrollTop;

            // when scroll too fast, width will be turn to NEGATIVE, to avoid it:
            cd.style.width = newCdWidth > 0 ? newCdWidth + "px" : 0;
            cd.style.opacity = newCdWidth / scrollTop;
        };

        // when cdThumb rotate
        const cdThumbAnimate = cdThumb.animate(
            [{ transform: "rotate(360deg)" }],
            {
                duration: 10000, // 10s
                iterations: Infinity,
            }
        );
        // tránh việc khi mới vào web chưa chạy nhạc nhưng đĩa bị quay
        cdThumbAnimate.pause();

        // play / pause song
        playBtn.onclick = function () {
            if (_this.isPlaying) {
                audio.pause();
            } else {
                audio.play();
            }
        };

        // when press Space
        document.onkeypress = function (e) {
            if (e.code == "Space") {
                if (_this.isPlaying) {
                    audio.pause();
                } else {
                    audio.play();
                }
            }
            // when press Space, web browser default has scroll down, to avoid it:
            e.preventDefault();
        };

        // when play song
        audio.onplay = function () {
            _this.isPlaying = true;
            player.classList.add("playing");
            cdThumbAnimate.play();
        };

        // when pause song
        audio.onpause = function () {
            _this.isPlaying = false;
            player.classList.remove("playing");
            cdThumbAnimate.pause();
        };

        // When song running
        audio.ontimeupdate = function () {
            if (audio.duration) {
                // avoid NaN
                const progressPercent = Math.floor(
                    (audio.currentTime / audio.duration) * 100
                );
                progress.value = progressPercent;
            }
        };

        // when seek in a song
        progress.onchange = function (e) {
            const seekTime = (audio.duration / 100) * e.target.value;
            audio.currentTime = seekTime;
        };

        // when next / prev song
        nextBtn.onclick = function () {
            if (_this.isRandom) {
                _this.playRandomSong();
            } else {
                _this.nextSong();
            }
            // when click next song, it auto be played
            audio.play();
            // when next song, add "active" to song
            _this.render();
        };

        prevBtn.onclick = function () {
            if (_this.isRandom) {
                _this.playRandomSong();
            } else {
                _this.prevSong();
            }
            audio.play();
            _this.render();
        };

        // when random song
        randomBtn.onclick = function () {
            _this.isRandom = !_this.isRandom;
            // toggle method
            // không click vào e.target vì mục đích muốn khi click vào thẻ đó thì đều được áp dụng
            randomBtn.classList.toggle("active", _this.isRandom);
        };

        // when end a song then play next song
        audio.onended = function () {
            if (_this.isRepeat) {
                audio.play();
            } else {
                // auto click (not user click)
                nextBtn.click();
            }
        };

        // when repeat song
        repeatBtn.onclick = function () {
            _this.isRepeat = !_this.isRepeat;
            repeatBtn.classList.toggle("active", _this.isRepeat);
        };

        // when click playlist
        playlist.onclick = function (e) {
            const songNode = e.target.closest(".song:not(.active)");

            if (songNode || e.target.closest(".option")) {
                // when click a song
                if (songNode) {
                    _this.currentIndex = songNode.dataset.index;
                    _this.loadCurrentSong();
                    audio.play();
                }
            }
        };
    },

    loadCurrentSong: function () {
        heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url(${this.currentSong.image})`;
        audio.src = this.currentSong.path;
    },

    nextSong: function () {
        this.currentIndex++;
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0;
        }
        this.loadCurrentSong();
    },

    prevSong: function () {
        if (this.currentIndex == 0) {
            this.currentIndex = this.songs.length;
        }
        this.currentIndex--;
        this.loadCurrentSong();
    },

    playRandomSong: function () {
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * this.songs.length);
        } while (newIndex === this.currentIndex); // tránh trùng với song đang chạy

        this.currentIndex = newIndex;

        this.loadCurrentSong();
    },

    start: function () {
        // define properties for object (when define success, app has "currentSong") property
        this.defineProperties();

        // listen and execute events (DOM)
        this.handleEvents();

        // load first song to UI when run app
        this.loadCurrentSong();

        // render out to web
        this.render();
    },
};

app.start();
