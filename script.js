console.log("Welcome to VibiPlay!");
let currentSong = new Audio();
let songs;
let currFolder;

function secondToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "Invalid input";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}



async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`http://127.0.0.1:5500/${folder}/`);
    let response = await a.text();
    let element = document.createElement("div");
    element.innerHTML = response;
    let as = element.getElementsByTagName("a");
    songs = [];
    for (let i = 0; i < as.length; i++) {
        const element = as[i];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }

    // Show all the songs in the playlist
    let songul = document.querySelector(".songlist").getElementsByTagName("ul")[0];
    songul.innerHTML = "";
    for (const song of songs) {
        songul.innerHTML = songul.innerHTML + `<li><img class="invert" src="img/music.svg" alt="">
                            <div class="info">
                                <div>${song.replaceAll("%20", " ")}</div>
                                <div>Shubham</div>
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                <img class="invert" src="img/play.svg" alt="">
                            </div> </li>`;
    }

    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            console.log(e.querySelector(".info").firstElementChild.innerHTML);
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
        });
    });

    return songs;

}

// change icons inside library
function updateLibraryIcons(currentTrackName = "") {
    let allSongs = document.querySelectorAll(".songlist li");

    allSongs.forEach(li => {
        let img = li.querySelector(".playnow img");
        let name = li.querySelector(".info").firstElementChild.innerHTML.trim();

        if (decodeURI(currentTrackName) === name && !currentSong.paused) {
            img.src = "img/pause.svg";
        } else {
            img.src = "img/play.svg";
        }
    });
}

// whenever song starts playing
currentSong.addEventListener("play", () => {
    let current = currentSong.src.split("/").slice(-1)[0];
    updateLibraryIcons(current);
});

// whenever paused
currentSong.addEventListener("pause", () => {
    updateLibraryIcons("");
});

// when song ends
currentSong.addEventListener("ended", () => {
    updateLibraryIcons("");
});


const playMusic = (track, pause = false) => {
    // let audio = new Audio("/song/" + track);
    currentSong.src = `/${currFolder}/` + track;
    if (!pause) {
        currentSong.play();
        play.src = "img/pause.svg";
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
    updateLibraryIcons(track);

}

async function displayAlbums() {
    let a = await fetch(`http://127.0.0.1:5500/song/`);
    let response = await a.text();
    let element = document.createElement("div");
    element.innerHTML = response;
    let anchors = element.getElementsByTagName("a");
    let CardContainer = document.querySelector(".cardContainer");
    let array = Array.from(anchors)
    for (let i = 0; i < anchors.length; i++) {
        const e = array[i];

        if (e.href.includes("/song/")) {
            let folder = e.href.split("/").slice(-1)[0];
            // Get the metadata of the folder
            let a = await fetch(`http://127.0.0.1:5500/song/${folder}/info.json`);
            let response = await a.json();
            CardContainer.innerHTML = CardContainer.innerHTML + `<div data-folder = ${folder} class="card">
                        <div class="play">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 220" width="60" height="60">
                                <g transform="translate(10,10)">
                                    <circle cx="100" cy="100" r="90" fill="#2ecc71" />
                                    <polygon points="85,65 85,135 140,100" fill="#000000" />
                                </g>
                            </svg>
                        </div>
                        <img id="img1" src="/song/${folder}/cover.png" alt="">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>`
        }
    }

    //load the playlist whenever the card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`song/${item.currentTarget.dataset.folder}`);
            playMusic(songs[0]);
        });
    });


}
async function main() {

    await getSongs("song/happy");
    playMusic(songs[0], true);

    // Display all the albumon on the page
    displayAlbums();


    // Attach event listeners to the play, next and previous buttons
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "img/pause.svg";
        }
        else {
            currentSong.pause();
            play.src = "img/play.svg";
        }
    });

    // Listen for timeupdate event
    currentSong.addEventListener("timeupdate", () => {
        (currentSong.currentTime, currentSong.duration);
        document.querySelector(".songtime").innerHTML = `${secondToMinutesSeconds(currentSong.currentTime)} / ${secondToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.currentTarget.clientWidth) * 100;
        document.querySelector(".circle").style.left = percent + "%";

        currentSong.currentTime = (currentSong.duration * percent) / 100;
    });

    // Add an event listener to the hamburger menu
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    // Add an event listener close button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-110%";
    });

    // Add an event listener to previous buttons
    previous.addEventListener("click", () => {
        currentSong.pause();

        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if (index > 0) {
            playMusic(songs[index - 1]);
        }
    });

    // Add an event listener to previous buttons
    next.addEventListener("click", () => {
        currentSong.pause();
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if (index < songs.length - 1) {
            playMusic(songs[index + 1]);
        }
    });

    //Add an event to volume slider
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log(e, e.target, e.target.value, "/ 100");
        currentSong.volume = e.target.value / 100;
    });

    // Add event listner to mute the track
    document.querySelector(".volume>img").addEventListener("click", e => {
        console.log(e.target);
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("img/volume.svg", "img/mute.svg");
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else {
            e.target.src = e.target.src.replace("img/mute.svg", "img/volume.svg");
            currentSong.volume = .10;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }
    });


}

main();