import { VideoUploader } from "components/video_uploader";

const root = document.querySelector("[data-video-uploader]");
if (root) new VideoUploader(root);
