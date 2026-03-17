const CONFIG = {
  GAS_API: "https://script.google.com/macros/s/AKfycbysNiya_7qbItyM_v3pd9t_pXfAOSTBWMBdXLsj-Nb7-iRs-gWnK5-RUl4F-l6A09XwFA/exec",
  LIFF_ID_ORDER: "2008821220-C8oqqBvB",
  LIFF_ID_STATUS: "2008821220-URtBKHjL",
  LIFF_ID_SLIP: "2008821220-NqDJdKS0",
  LIFF_ID_DRIVER: "2008821220-M2Bqp8AG",
  LIFF_ID_ADMIN: "2008821220-ePnWMlu9",
  LIFF_ID_HISTORY: "2008821220-DC2vs4n2",
  LIFF_ID_ROLE: "2008821220-5DyuuHwJ",
  LIFF_ID_SUMMARY: "2008821220-nF2QLSuT",
  WEBHOOK_SLIP: "https://amarin-650200908-drinking-water-bot.hf.space/webhook/upload-slip2",
  WEBHOOK_Delivery: "https://amarin-650200908-drinking-water-bot.hf.space/webhook/delivery",

  // ตั้งค่าสิทธิการเข้าถึงแต่ละหน้า
  PAGE_PERMISSIONS: {
    "SUMMARY_PAGE": ["Admin", "Staff"],
    "STOCK_PAGE": ["Admin", "Staff"],
    "DRIVER_PAGE": ["Admin", "Staff"],
    "ROLE_PAGE": ["Admin"]
  }
};

/**
 * ฟังก์ชันกลางสำหรับเช็คสิทธิ
 * - UID ต้องอยู่ในชีต role ก่อน
 * - จากนั้น role ต้องตรงกับหน้าที่อนุญาต
 * @param {string} pageName
 * @returns {Promise<boolean>}
 */
async function validateAccess(pageName) {
  const allowedRoles = CONFIG.PAGE_PERMISSIONS[pageName];

  if (!allowedRoles) {
    console.error("Permission config not found for page:", pageName);
    alert("ไม่พบการตั้งค่าสิทธิของหน้านี้");
    return false;
  }

  if (allowedRoles === "ALL") {
    return true;
  }

  try {
    if (!liff.isLoggedIn()) {
      liff.login();
      return false;
    }

    const profile = await liff.getProfile();
    const uid = (profile.userId || "").trim();

    if (!uid) {
      alert("ไม่พบ LINE UID ของผู้ใช้งาน");
      return false;
    }

    const response = await fetch(
      `${CONFIG.GAS_API}?type=check_role&uid=${encodeURIComponent(uid)}`,
      {
        method: "GET",
        cache: "no-store"
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const res = await response.json();
    console.log("check_role response =", res);

    if (res.status !== "success") {
      throw new Error(res.msg || "ตรวจสอบสิทธิไม่สำเร็จ");
    }

    // ยังไม่ได้รับอนุญาตให้ใช้ระบบ
    if (!res.allowed) {
      alert("⛔ UID นี้ยังไม่ได้รับอนุญาตให้ใช้งานระบบ");
      try {
        liff.closeWindow();
      } catch (err) {
        console.warn("closeWindow failed:", err);
      }
      return false;
    }

    // มี UID ในระบบ แต่ role ไม่ตรงกับหน้าที่จะเข้า
    if (!allowedRoles.includes(res.role)) {
      alert(`⛔ ขออภัย! เฉพาะ ${allowedRoles.join(" หรือ ")} เท่านั้นที่เข้าหน้านี้ได้`);
      try {
        liff.closeWindow();
      } catch (err) {
        console.warn("closeWindow failed:", err);
      }
      return false;
    }

    return true;

  } catch (e) {
    console.error("Permission Error:", e);
    alert("ไม่สามารถตรวจสอบสิทธิได้: " + e.message);
    return false;
  }
}
