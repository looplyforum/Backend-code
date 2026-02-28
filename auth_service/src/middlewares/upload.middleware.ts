import multer from "multer";

import os from "os";
import fs from "fs";

// store images in disk
const homeDir = os.homedir();
const uploadDir = homeDir + "/upload";
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const suffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + suffix);
  },
});

export const upload = multer({ storage: storage });