import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "task-manager",
    allowed_formats: ["jpg", "jpeg", "png", "pdf", "docx"],
  },
});

const upload = multer({ storage });

export default upload;