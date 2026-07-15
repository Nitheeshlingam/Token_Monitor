import db from "../config/db.js";
import generateSdkKey from "../utils/generateSdkKey.js";

/**
 * Create New Application
 */
export const createApplication = async (req, res) => {
  try {
    const { appName, description } = req.body;

    if (!appName) {
      return res.status(400).json({
        success: false,
        message: "Application name is required",
      });
    }

    const sdkKey = generateSdkKey();

    const [result] = await db.execute(
      `
      INSERT INTO applications
      (
        app_name,
        description,
        sdk_key,
        owner_id
      )
      VALUES (?,?,?,?)
      `,
      [
        appName,
        description || "",
        sdkKey,
        req.user.id,
      ]
    );

    res.status(201).json({
      success: true,
      message: "Application created successfully",
      application: {
        id: result.insertId,
        appName,
        description: description || "",
        sdkKey,
        status: "ACTIVE",
      },
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * Get All Applications
 */
export const getApplications = async (req, res) => {
  try {

    const [applications] = await db.execute(
      `
      SELECT
          id,
          app_name,
          description,
          sdk_key,
          status,
          created_at
      FROM applications
      WHERE owner_id = ?
      ORDER BY created_at DESC
      `,
      [req.user.id]
    );

    res.json({
      success: true,
      total: applications.length,
      applications,
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * Get Application By ID
 */
export const getApplicationById = async (req, res) => {
  try {

    const { id } = req.params;

    const [rows] = await db.execute(
      `
      SELECT
        id,
        app_name,
        description,
        sdk_key,
        status,
        created_at
      FROM applications
      WHERE id = ?
      AND owner_id = ?
      `,
      [id, req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    res.json({
      success: true,
      application: rows[0],
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * Update Application
 */
export const updateApplication = async (req, res) => {
  try {

    const { id } = req.params;
    const { appName, description } = req.body;

    await db.execute(
      `
      UPDATE applications
      SET
        app_name = ?,
        description = ?
      WHERE id = ?
      AND owner_id = ?
      `,
      [
        appName,
        description,
        id,
        req.user.id,
      ]
    );

    res.json({
      success: true,
      message: "Application updated successfully",
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * Regenerate SDK Key
 */
export const regenerateSdkKey = async (req, res) => {
  try {

    const { id } = req.params;

    const sdkKey = generateSdkKey();

    await db.execute(
      `
      UPDATE applications
      SET sdk_key = ?
      WHERE id = ?
      AND owner_id = ?
      `,
      [
        sdkKey,
        id,
        req.user.id,
      ]
    );

    res.json({
      success: true,
      message: "SDK Key regenerated successfully",
      sdkKey,
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * Delete Application (Soft Delete)
 */
export const deleteApplication = async (req, res) => {
  try {

    const { id } = req.params;

    await db.execute(
      `
      UPDATE applications
      SET status = 'INACTIVE'
      WHERE id = ?
      AND owner_id = ?
      `,
      [
        id,
        req.user.id,
      ]
    );

    res.json({
      success: true,
      message: "Application deleted successfully",
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};