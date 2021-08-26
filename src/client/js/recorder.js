import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";

const actionBtn = document.getElementById("actionBtn");
const video = document.getElementById("preview");

let stream; //stream 받아오기위해서
let recorder;
let videoFile;
const files = {
  input: "recording.webm",
  output: "output.mp4",
  thumb: "thumbnail.jpg",
};
const downloadFile = (fileUrl, fileName) => {
  const a = document.createElement("a"); //a성분 보여줌
  a.href = fileUrl;
  a.download = fileName; //url보내주는 것이 아닌 url저장(MyRecording파일로 다운로드 시켜줌)
  document.body.appendChild(a);
  a.click(); //유저가 링크를 클릭한 것처럼 작동
};

const handleDownload = async () => {
  actionBtn.removeEventListener("click", handleDownload);

  actionBtn.innerText = "Transcoding...";
  actionBtn.disabled = true;

  const ffmpeg = createFFmpeg({
    corePath: "https://unpkg.com/@ffmpeg/core@0.8.5/dist/ffmpeg-core.js",
    log: true,
  });
  await ffmpeg.load(); //software사용
  ffmpeg.FS("writeFile", files.input, await fetchFile(videoFile)); //파일 생성해주기
  await ffmpeg.run("-i", files.input, "-r", "60", files.output); //input
  await ffmpeg.run(
    "-i",
    files.input,
    "-ss",
    "00:00:01",
    "-frames:v",
    "1",
    files.thumb
  );
  const mp4File = ffmpeg.FS("readFile", files.output);
  const thumbFile = ffmpeg.FS("readFile", files.thumb);
  const mp4Blob = new Blob([mp4File.buffer], { type: "video/mp4" }); //binary file to mp4
  const thumbBlob = new Blob([thumbFile.buffer], { type: "image/jpg" });
  const mp4Url = URL.createObjectURL(mp4Blob);
  const thumbUrl = URL.createObjectURL(thumbBlob); //access uRL

  downloadFile(mp4Url, "MyRecording.mp4");
  downloadFile(thumbUrl, "MyThumbnail.jpg");

  ffmpeg.FS("unlink", files.input);
  ffmpeg.FS("unlink", files.output); //delete file
  ffmpeg.FS("unlink", files.thumb);

  URL.revokeObjectURL(mp4Url); //delete URL
  URL.revokeObjectURL(thumbUrl);
  URL.revokeObjectURL(videoFile);

  actionBtn.disabled = false;
  actionBtn.innerText = "Record Again";
  actionBtn.addEventListener("click", handleStart);
};

const handleStart = () => {
  actionBtn.innerText = "Recording";
  actionBtn.disabled = true;
  actionBtn.removeEventListener("click", handleStart);
  recorder = new MediaRecorder(stream, { mimeType: "video/webm" }); //비디오 리코더
  recorder.ondataavailable = (event) => {
    videoFile = URL.createObjectURL(event.data); //브라우저메모리
    video.srcObject = null; //지금 화면 말고
    video.src = videoFile; //비디오 화면이 녹음된 파일로
    video.loop = true; //반복재생
    video.play();
    actionBtn.innerText = "Download";
    actionBtn.disabled = false;
    actionBtn.addEventListener("click", handleDownload);
  };
  recorder.start(); //리코딩 시작-active
  setTimeout(() => {
    recorder.stop();
  }, 5000);
};

const init = async () => {
  stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: { width: 1024, height: 576 },
  });
  video.srcObject = stream; //비디오 지금 화면
  video.play();
};
init();
actionBtn.addEventListener("click", handleStart);
