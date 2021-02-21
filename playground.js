// 1. Create layout with styles - done
// 2. DOM navigation - done
// 3. Access to web camera - done
// 4. Stream data - done
// 5. Record video - done
// 6. Take snapshot - done
// 7. Download
// 8. Screen sharing

let recordedBlobs;
let mediaRecorder;

// Get access to button nodes
const startButton = document.getElementById('start');
const recordButton = document.getElementById('record');
const playButton = document.getElementById('play');
const downloadButton = document.getElementById('download');
const snapshotButton = document.getElementById('snapshot');
const screenshareButton = document.getElementById('screenshare');

// Get access to video nodes
const gumVideo = document.getElementById('gum');
const recordedVideo = document.getElementById('recorded');
const shareVideo = document.getElementById('share');

// Get access to canvas node
const canvas = document.querySelector('canvas');
const filterSelect = document.querySelector('select#filter');

// Take snapshot
snapshotButton.addEventListener('click', () => {
    canvas.className = filterSelect.value;
    canvas.width = 361.5;
    canvas.height = 212.094;
    canvas.getContext('2d').drawImage(gumVideo, 20, 20, canvas.width, canvas.height);
})

// Download video
downloadButton.addEventListener('click', () => {
		let a = document.createElement("a");
  	let buffer = new Blob(recordedBlobs, {type: 'video/webm'});
  	a.href = URL.createObjectURL(buffer);
  	a.download = "video.webm";
  	a.click();
})

//Screensharing
function handleShareSuccess(streamShare) {
	 	shareVideo.srcObject = null;
  	shareVideo.srcObject = streamShare;
}

screenshareButton.addEventListener('click', () => {
	if(screenshareButton.innerText === 'Screenshare') {
		screenshareButton.innerText = 'Stop screenshare';	
		navigator.mediaDevices.getDisplayMedia({video: true})
    .then(handleShareSuccess, handleError);
  } else {
  	screenshareButton.innerText = 'Screenshare';
  	shareVideo.srcObject = null;
  }
})

// Play recorded video
playButton.addEventListener('click', () => {
    const buffer = new Blob(recordedBlobs, {type: 'video/webm'});
    recordedVideo.src = null;
    recordedVideo.srcObject = null;
    recordedVideo.src = window.URL.createObjectURL(buffer);
    recordedVideo.controls = true;
    recordedVideo.play();
})

// 2. Record video
const handleDataAvailable = (event) => {
    if(event.data && event.data.size > 0) {
       recordedBlobs.push(event.data); 
    }
}

const startRecording = () => {
    recordedBlobs = [];
    const options = { 
        mimeType: 'video/webm;codecs=vp9,opus'
    }

    try {
        mediaRecorder = new MediaRecorder(window.stream, options);
    } catch(error) {
        handleError(error);
    }

    mediaRecorder.ondataavailable = handleDataAvailable;
    mediaRecorder.start();
}

const stopRecording = () => {
    mediaRecorder.stop();
}

recordButton.addEventListener('click', () => {
    if(recordButton.textContent === 'Record') {
        recordButton.textContent = 'Stop recording';
        startRecording();
    } else {
        recordButton.textContent = 'Record';
        playButton.disabled = false;
        downloadButton.disabled = false;
        stopRecording();
    }
})

// 1. Stream data
const handleSuccess = (stream) => {
    gumVideo.srcObject = stream;
    window.stream = stream;
    recordButton.disabled = false;
    snapshotButton.disabled = false;
    screenshareButton.disabled = false;
}

const handleError = (error) => {
    console.error(`navigator getUserMedia error: ${error}`);
}

const init = (constraints) => {
    navigator.mediaDevices.getUserMedia(constraints)
        .then(handleSuccess)
        .catch(handleError)
}

startButton.addEventListener('click', () => {
    if(startButton.innerText === 'Start camera') {
        startButton.innerText = 'Stop camera';

        const constraints = {
            audio: true,
            video: {
                width: 1280,
                height: 720
            }
        }
        init(constraints);

    } else {
        startButton.innerText = 'Start camera';
        recordButton.disabled = true;
        playButton.disabled = true;
        downloadButton.disabled = true;
        snapshotButton.disabled = true;
        screenshareButton.disabled = true;
        window.stream = null;
        gumVideo.srcObject = null;
        recordedVideo.srcObject = null;
        recordedVideo.src = null;
        recordedVideo.controls = false;
    }
})