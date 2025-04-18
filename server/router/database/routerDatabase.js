import express from "express";
import { authorize } from "../../middleware/auth.js";
import { pool } from "../../config/config.js";

const router = express.Router();

router.post(
  "/add-student-data",
  authorize("admin", "teacher", "student"),
  async (req, res) => {
    const {
      userid,
      homebaseid,
      homebase_name,
      entryid,
      entry_name,
      nis,
      nisn,
      name,
      gender,
      birth_place,
      birth_date,
      height,
      weight,
      head,
      order_number,
      siblings,
      provinceid,
      province_name,
      cityid,
      city_name,
      districtid,
      district_name,
      villageid,
      village_name,
      postal_code,
      address,
    } = req.body;

    try {
      // Pengecekan apakah NIS sudah ada di db_student
      const studentCheck = await pool.query(
        `SELECT * FROM db_student WHERE nis = $1`,
        [nis]
      );

      if (studentCheck.rows.length > 0) {
        // Jika NIS ditemukan, update kolom yang sesuai dengan data dari req.body
        await pool.query(
          `UPDATE db_student SET
                    userid = COALESCE($1, userid),
                    homebaseid = COALESCE($2, homebaseid),
                    homebase_name = COALESCE($3, homebase_name),
                    entryid = COALESCE($4, entryid),
                    entry_name = COALESCE($5, entry_name),
                    name = COALESCE($6, name),
                    nisn = COALESCE($7, nisn),
                    gender = COALESCE($8, gender),
                    birth_place = COALESCE($9, birth_place),
                    birth_date = COALESCE($10, birth_date),
                    height = COALESCE($11, height),
                    weight = COALESCE($12, weight),
                    head = COALESCE($13, head),
                    order_number = COALESCE($14, order_number),
                    siblings = COALESCE($15, siblings),
                    provinceid = COALESCE($16, provinceid),
                    province_name = COALESCE($17, province_name),
                    cityid = COALESCE($18, cityid),
                    city_name = COALESCE($19, city_name),
                    districtid = COALESCE($20, districtid),
                    district_name = COALESCE($21, district_name),
                    villageid = COALESCE($22, villageid),
                    village_name = COALESCE($23, village_name),
                    postal_code = COALESCE($24, postal_code),
                    address = COALESCE($25, address)
                WHERE nis = $26
                RETURNING *`,
          [
            userid,
            homebaseid,
            homebase_name,
            entryid,
            entry_name,
            name,
            nisn,
            gender,
            birth_place,
            birth_date,
            height,
            weight,
            head,
            order_number,
            siblings,
            provinceid,
            province_name,
            cityid,
            city_name,
            districtid,
            district_name,
            villageid,
            village_name,
            postal_code,
            address,
            nis,
          ]
        );

        await pool.query(`UPDATE u_students SET homebase = $1 WHERE id = $2`, [
          homebaseid,
          userid,
        ]);

        return res.status(200).json({ message: "Berhasil diperbarui" });
      } else {
        // Jika NIS tidak ditemukan, tambahkan data baru ke db_student
        await pool.query(
          `INSERT INTO db_student (
                   userid, homebaseid, homebase_name, entryid, entry_name, nis, nisn, name, gender,
                   birth_place, birth_date, height, weight, head, order_number, siblings,
                   provinceid, province_name, cityid, city_name, districtid, district_name,
                   villageid, village_name, postal_code, address
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26)
                RETURNING *`,
          [
            userid,
            homebaseid,
            homebase_name,
            entryid,
            entry_name,
            nis,
            nisn,
            name,
            gender,
            birth_place,
            birth_date,
            height,
            weight,
            head,
            order_number,
            siblings,
            provinceid,
            province_name,
            cityid,
            city_name,
            districtid,
            district_name,
            villageid,
            village_name,
            postal_code,
            address,
          ]
        );

        await pool.query(`UPDATE u_students SET homebase = $1 WHERE id = $2`, [
          homebaseid,
          userid,
        ]);

        return res.status(201).json({ message: "Berhasil disimpan" });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: error.message });
    }
  }
);

router.post(
  "/add-parents-data",
  authorize("admin", "teacher", "student"),
  async (req, res) => {
    const {
      userid,
      father_nik,
      father_name,
      father_birth_place,
      father_birth_date,
      father_job,
      father_phone,
      mother_nik,
      mother_name,
      mother_birth_place,
      mother_birth_date,
      mother_job,
      mother_phone,
    } = req.body;

    try {
      // Check if the student exists in db_student
      const studentCheck = await pool.query(
        `SELECT * FROM db_student WHERE userid = $1`,
        [userid]
      );

      if (studentCheck.rowCount > 0) {
        await pool.query(
          `UPDATE db_student SET
              father_nik = COALESCE($1, father_nik),
              father_name = COALESCE($2, father_name),
              father_birth_place = COALESCE($3, father_birth_place),
              father_birth_date = COALESCE($4, father_birth_date),
              father_job = COALESCE($5, father_job),
              father_phone = COALESCE($6, father_phone),
              mother_nik = COALESCE($7, mother_nik),
              mother_name = COALESCE($8, mother_name),
              mother_birth_place = COALESCE($9, mother_birth_place),
              mother_birth_date = COALESCE($10, mother_birth_date),
              mother_job = COALESCE($11, mother_job),
              mother_phone = COALESCE($12, mother_phone)
            WHERE userid = $13
            RETURNING *`,
          [
            father_nik,
            father_name,
            father_birth_place,
            father_birth_date,
            father_job,
            father_phone,
            mother_nik,
            mother_name,
            mother_birth_place,
            mother_birth_date,
            mother_job,
            mother_phone,
            userid,
          ]
        );

        return res.status(200).json({ message: "Berhasil disimpan" });
      } else {
        return res.status(404).json({ message: "Data tidak ditemukan" });
      }
    } catch (error) {
      console.error(error.message);
      return res.status(500).json({ message: error.message });
    }
  }
);

router.post(
  "/add-family",
  authorize("admin", "teacher", "student"),
  async (req, res) => {
    const { userid, name, gender, birth_date } = req.body;

    try {
      // Check if the family member already exists for this user
      const familyCheck = await pool.query(
        `SELECT * FROM db_family WHERE userid = $1 AND name = $2`,
        [userid, name]
      );

      if (familyCheck.rows.length > 0) {
        // If family member exists, update the record
        await pool.query(
          `UPDATE db_family SET
              gender = COALESCE($1, gender),
              birth_date = COALESCE($2, birth_date)
            WHERE userid = $3 AND name = $4
            RETURNING *`,
          [gender, birth_date, userid, name]
        );

        return res
          .status(200)
          .json({ message: "Data keluarga berhasil diperbarui" });
      } else {
        // If family member doesn't exist, insert a new record
        await pool.query(
          `INSERT INTO db_family (
                   userid, name, gender, birth_date
                ) VALUES ($1, $2, $3, $4)
                RETURNING *`,
          [userid, name, gender, birth_date]
        );

        return res
          .status(201)
          .json({ message: "Data keluarga berhasil ditambahkan" });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: error.message });
    }
  }
);

router.get(
  "/get-family",
  authorize("admin", "teacher", "student"),
  async (req, res) => {
    const { userid } = req.query;

    try {
      if (!userid) {
        return res.status(400).json({ message: "userid diperlukan" });
      }

      const result = await pool.query(
        `SELECT * FROM db_family WHERE userid = $1 ORDER BY name`,
        [userid]
      );

      return res.status(200).json({
        message: "Data keluarga berhasil diambil",
        data: result.rows,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: error.message });
    }
  }
);

router.delete(
  "/delete-family",
  authorize("admin", "teacher", "student"),
  async (req, res) => {
    const { id } = req.query;

    try {
      if (!id) {
        return res.status(400).json({ message: "id diperlukan" });
      }

      const result = await pool.query(
        `DELETE FROM db_family WHERE id = $1 RETURNING *`,
        [id]
      );

      if (result.rowCount === 0) {
        return res
          .status(404)
          .json({ message: "Data keluarga tidak ditemukan" });
      }

      return res
        .status(200)
        .json({ message: "Data keluarga berhasil dihapus" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: error.message });
    }
  }
);

export default router;
