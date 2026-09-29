import { mountVideoUploader } from "./video-uploader";

// The page only renders this element once the Bunny Stream env vars are set.
const root = document.getElementById("uploader");
if (root) mountVideoUploader(root);
