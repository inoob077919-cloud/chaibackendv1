import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: "./public/temp/",
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname); // e.g. .png, .jpg
    cb(null, file.fieldname + "-" + Date.now() + ext);
  }
});

export const upload = multer({ storage });
