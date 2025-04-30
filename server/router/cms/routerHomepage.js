import express from "express";
import { pool } from "../../config/config.js";
import { authorize } from "../../middleware/auth.js";
import multer from "multer";
import path from "path";

const create = "Berhasil disimpan";
const update = "berhasil diperbarui";
const remove = "Berhasil dihapus";

const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./server/assets/cms");
  },

  filename: function (req, file, cb) {
    cb(
      null,
      path.parse(file.originalname).name +
        "-" +
        Date.now() +
        path.extname(file.originalname)
    );
  },
});

const uploadImage = multer({ storage: imageStorage });

const router = express.Router();

router.get("/get-data", async (req, res) => {
  const client = await pool.connect();
  try {
    const { rows } = await client.query(`SELECT * FROM cms_homepage`);

    res.status(200).json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

router.put(
  "/homepage",
  authorize("cms"),
  uploadImage.single("logo"),
  async (req, res) => {
    const client = await pool.connect();
    try {
      const {
        name,
        tagline,
        description,
        video_url,
        youtube,
        instagram,
        facebook,
        ppdb_url,
      } = req.body;

      let logoPath = req.body.logo; // Default to existing logo path

      // If a new logo file was uploaded, use its path
      if (req.file) {
        logoPath = "/assets/cms/" + req.file.filename;
      }

      const query = `
      UPDATE cms_homepage 
      SET 
        name = $1,
        tagline = $2,
        description = $3,
        video_url = $4,
        youtube = $5,
        instagram = $6,
        facebook = $7,
        ppdb_url = $8,
        logo = $9
      WHERE id = 1
      RETURNING *
    `;

      const values = [
        name,
        tagline,
        description,
        video_url,
        youtube,
        instagram,
        facebook,
        ppdb_url,
        logoPath,
      ];

      await client.query(query, values);

      res.status(200).json({ message: update });
    } catch (error) {
      res.status(500).json({ message: error.message });
    } finally {
      client.release();
    }
  }
);

export default router;
