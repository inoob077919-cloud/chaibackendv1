import multer from 'multer';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Set the destination folder for uploaded files
    cb(null, './public/temp/')
  },
  filename: function (req, file, cb) {
    // Generate a unique filename to avoid naming conflicts
    // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    // const originalFileExtension = path.extname(file.originalname)
    //  const filename = file.fieldname + '-' + uniqueSuffix + originalFileExtension
    const filename = file.fieldname;
    cb(null, filename)
  },
});

export const upload = multer({ storage });