const CONFIG = {
  GAS_API: "https://script.google.com/macros/s/AKfycbz3KCnQx0bf8fSBQxB6ZWBpVFwSwOPRufE3N-48-patTfgT3j4pY-NUY5RB1anZ3f_CNQ/exec",
  LIFF_ID_ORDER: "2009604073-MZihP07R",
  LIFF_ID_STATUS: "2009604073-8PmWSI57",
  LIFF_ID_SLIP: "2009604073-IvxDf4Mv",
  LIFF_ID_DRIVER: "2009604073-m9Rj1hjE",
  LIFF_ID_ADMIN: "2009604073-XVN4ZiMX",
  LIFF_ID_HISTORY: "2009604073-LsgE16VV",
  LIFF_ID_ROLE: "2009604073-D1MLrOm0",
  LIFF_ID_SUMMARY: "2009604073-v6sZPlEw",
  LIFF_ID_ORDERLIST: "2009604073-95imIyfn",
  
  WEBHOOK_SLIP: "https://amarin-650200908-drinking-water-bot-v2.hf.space/webhook/upload-slip2",
  WEBHOOK_Delivery: "https://amarin-650200908-drinking-water-bot-v2.hf.space/webhook/delivery",

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
