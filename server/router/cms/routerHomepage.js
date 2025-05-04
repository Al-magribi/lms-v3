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

router.put(
  "/udpate-homepage",
  authorize("cms"),
  uploadImage.single("logo"),
  async (req, res) => {
    const client = await pool.connect();

    try {
      // Validate required fields
      const requiredFields = ["name", "tagline", "description"];
      const missingFields = requiredFields.filter((field) => !req.body[field]);

      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Field berikut wajib diisi: ${missingFields.join(", ")}`,
          data: null,
        });
      }

      const {
        name,
        tagline,
        description,
        video_url,
        youtube,
        instagram,
        facebook,
        ppdb_url,
        address,
        title_reason,
        desc_reason,
        title_facility,
        desc_facility,
        primary_color,
        secondary_color,
      } = req.body;

      let logoPath = req.body.logo; // Default to existing logo path

      // If a new logo file was uploaded, use its path
      if (req.file) {
        // Validate file type
        const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
        if (!allowedTypes.includes(req.file.mimetype)) {
          return res.status(400).json({
            success: false,
            message:
              "Format file logo tidak didukung. Gunakan JPG, PNG, atau GIF",
            data: null,
          });
        }

        // Validate file size (max 2MB)
        if (req.file.size > 2 * 1024 * 1024) {
          return res.status(400).json({
            success: false,
            message: "Ukuran file logo terlalu besar. Maksimal 2MB",
            data: null,
          });
        }

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
          logo = $9,
          address = $10,
          title_reason = $11,
          desc_reason = $12,
          title_facility = $13,
          desc_facility = $14,
          primary_color = $15,
          secondary_color = $16
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
        address,
        title_reason,
        desc_reason,
        title_facility,
        desc_facility,
        primary_color,
        secondary_color,
      ];

      const result = await client.query(query, values);

      res.status(200).json({
        message: update,
        data: result.rows[0],
      });
    } catch (error) {
      console.error("Error in homepage update:", error);
      res.status(500).json({ message: error.message });
    } finally {
      if (client) {
        client.release();
      }
    }
  }
);

router.get("/get-data", async (req, res) => {
  const client = await pool.connect();
  try {
    // Check if table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'cms_homepage'
      )
    `);

    if (!tableCheck.rows[0].exists) {
      return res.status(404).json({
        success: false,
        message: "Table cms_homepage tidak ditemukan",
        data: null,
      });
    }

    // Get homepage data with proper error handling
    const { rows } = await client.query(`
      SELECT  * FROM cms_homepage
    `);

    if (!rows.length) {
      return res.status(404).json({
        message: "Data homepage tidak ditemukan",
        data: null,
      });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error("Error in get-data:", error);

    if (error.code === "57014") {
      res.status(504).json({
        message: "Waktu tunggu query habis. Silakan coba lagi.",
      });
    } else {
      res.status(500).json({ message: error.message });
    }
  } finally {
    if (client) {
      client.release();
    }
  }
});

export default router;
