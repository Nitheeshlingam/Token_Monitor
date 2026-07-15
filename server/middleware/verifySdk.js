import db from "../config/db.js";

const verifySdk = async (req, res, next) => {
  try {
    // Read SDK headers
    const sdkKey = req.headers["x-sdk-key"];
    const appName = req.headers["x-app-name"];
    const sdkVersion = req.headers["x-sdk-version"];
    const environment = req.headers["x-environment"];

    // Check SDK Key
    if (!sdkKey) {
      return res.status(401).json({
        success: false,
        message: "SDK Key missing",
      });
    }

    // Find application
    const [rows] = await db.execute(
      `SELECT * FROM applications WHERE sdk_key = ?`,
      [sdkKey]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid SDK Key",
      });
    }

    // Save application details
    req.application = rows[0];

    req.sdk = {
      sdkKey,
      appName,
      sdkVersion,
      environment,
    };

    next();

  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "SDK Verification Failed",
    });
  }
};

export default verifySdk;