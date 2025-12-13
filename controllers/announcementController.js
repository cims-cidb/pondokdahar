const db = require("../config/db");
const whatsappService = require("../services/whatsappService");

exports.getAnnouncements = async (req, res, next) => {
  try {
    const { search, role, today } = req.query;

    let conditions = "WHERE a.deleted_at IS NULL";
    const params = [];

    if (search) {
      conditions += " AND (a.title LIKE ? OR a.body LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }

    if (role && role !== "all") {
      conditions += " AND JSON_CONTAINS(a.target_roles, ?)";
      params.push(`"${role}"`);
    }

    if (today === "1") {
      conditions += " AND DATE(a.created_at) = CURDATE()";
    }

    const [rows] = await db.query(
      `
      SELECT 
        a.id,
        a.title,
        a.created_at,
        a.target_roles
      FROM announcements a
      ${conditions}
      ORDER BY a.id DESC
      `,
      params
    );

    res.json(rows);
  } catch (err) {
    next(err);
  }
};

exports.createAnnouncement = async (req, res, next) => {
  try {
    const user = req.user;
    const { title, body, roles, outlet_id, attachment_url } = req.body;

    const [result] = await db.query(
      `
      INSERT INTO announcements
      (title, body, target_roles, outlet_id, attachment_url, created_by)
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        title,
        body,
        JSON.stringify(roles),
        outlet_id || null,
        attachment_url || null,
        user.id,
      ]
    );

    const announcementId = result.insertId;

    const roleFilter = roles.includes("all")
      ? ""
      : `AND role IN (${roles.map(() => "?").join(",")})`;
    const roleParams = roles.includes("all") ? [] : roles;

    const [targets] = await db.query(
      `
      SELECT whatsapp
      FROM users
      WHERE status = 'active'
      ${roleFilter}
      AND ( ? IS NULL OR outlet_id = ? )
      `,
      [...roleParams, outlet_id || null, outlet_id || null]
    );

    for (const u of targets) {
      if (u.whatsapp) {
        whatsappService.sendAnnouncement(
          u.whatsapp,
          title,
          body,
          roles,
          outlet_id,
          attachment_url
        );
      }
    }

    res.json({
      message: "Announcement created and notifications sent",
      id: announcementId,
    });
  } catch (err) {
    next(err);
  }
};

exports.getAnnouncementDetail = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [[row]] = await db.query(
      `
      SELECT 
        a.id,
        a.title,
        a.body,
        a.target_roles,
        a.outlet_id,
        a.attachment_url,
        a.created_at,
        u.name AS created_by
      FROM announcements a
      LEFT JOIN users u ON u.id = a.created_by
      WHERE a.id = ?
      `,
      [id]
    );

    if (!row) return res.status(404).json({ message: "Not found" });

    row.target_roles = JSON.parse(row.target_roles || "[]");

    res.json(row);
  } catch (err) {
    next(err);
  }
};
