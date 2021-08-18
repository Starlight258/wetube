const startBtn = document.getElementById("startBtn");
const video = document.getElementById("preview");

let stream; //stream 받아오기위해서
let recorder;
let videoFile;

const handleDownload = () => {
  const a = document.createElement("a"); //a성분 보여줌
  a.href = videoFile;
  a.download = "MyRecording.webm"; //url보내주는 것이 아닌 url저장(MyRecording파일로 다운로드 시켜줌)
  document.body.appendChild(a);
  a.click(); //유저가 링크를 클릭한 것처럼 작동
};
const handleStop = () => {
  startBtn.innerText = "Download Recording";
  startBtn.removeEventListener("click", handleStop);
  startBtn.addEventListener("click", handleDownload);
  recorder.stop();
};

const handleStart = () => {
  startBtn.innerText = "Stop Recording";
  startBtn.removeEventListener("click", handleStart);
  startBtn.addEventListener("click", handleStop);
  recorder = new MediaRecorder(stream, { mimeType: "video/webm" }); //비디오 리코더
  recorder.ondataavailable = (event) => {
    videoFile = URL.createObjectURL(event.data); //브라우저메모리
    video.srcObject = null; //지금 화면 말고
    video.src = videoFile; //비디오 화면이 녹음된 파일로
    video.loop = true; //반복재생
    video.play();
  };
  recorder.start(); //리코딩 시작-active
};

const init = async () => {
  stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: { width: 200, height: 100 },
  });
  video.srcObject = stream; //비디오 지금 화면
  video.play();
};
init();
startBtn.addEventListener("click", handleStart);
