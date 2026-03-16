const CONFIG = {
  GAS_API: "https://script.google.com/macros/s/AKfycbyJE_vDIQ0X2C23L_BZtB_KVWY6daPzds7lQ3CSChqznDc3sLfyjT-PMRpbZ12zAyspLA/exec",
  LIFF_ID_ORDER: "2008821220-C8oqqBvB",
  LIFF_ID_STATUS: "2008821220-URtBKHjL",
  LIFF_ID_SLIP: "2008821220-NqDJdKS0",
  LIFF_ID_DRIVER: "2008821220-M2Bqp8AG",
  LIFF_ID_ADMIN: "2008821220-ePnWMlu9",
  LIFF_ID_HISTORY:"2008821220-DC2vs4n2",
  LIFF_ID_ROLE: "2008821220-5DyuuHwJ",
  WEBHOOK_SLIP: "https://amarin-650200908-drinking-water-bot.hf.space/webhook/upload-slip2",
  WEBHOOK_Delivery: "https://amarin-650200908-drinking-water-bot.hf.space/webhook/delivery",
  // ตั้งค่าสิทธิการเข้าถึงแต่ละหน้าตรงนี้ที่เดียว
  PAGE_PERMISSIONS: {
    "SUMMARY_PAGE": ["Admin", "Staff"],  // หน้าสรุปยอด
    "STOCK_PAGE":   ["Admin", "Staff"],  // หน้าจัดการสต็อก
    "DRIVER_PAGE":  ["Admin", "Staff"],  // หน้ารายการจัดส่ง
    "ROLE_PAGE":    ["Admin"]           // หน้าจัดการสิทธิ (เฉพาะ Admin)
  }
};
/**
 * ฟังก์ชันกลางสำหรับเช็คสิทธิ
 * @param {string} pageName - ชื่อหน้าจาก PAGE_PERMISSIONS
 * @returns {Promise<boolean>}
 */
async function validateAccess(pageName) {
  const allowedRoles = CONFIG.PAGE_PERMISSIONS[pageName];
  
  // ถ้าตั้งเป็น "ALL" ให้ผ่านได้เลย
  if (allowedRoles === "ALL") return true;

  try {
    if (!liff.isLoggedIn()) {
      liff.login();
      return false;
    }

    const profile = await liff.getProfile();
    const uid = profile.userId;

    // ดึง Role จาก GAS (ใช้ฟังก์ชัน check_role ที่เราทำไว้)
    const res = await fetch(`${CONFIG.GAS_API}?type=check_role&uid=${uid}`).then(r => r.json());
    
    if (allowedRoles.includes(res.role)) {
      return true; // มีสิทธิเข้าถึง
    } else {
      alert(`⛔ ขออภัย! เฉพาะ ${allowedRoles.join(" หรือ ")} เท่านั้นที่เข้าหน้านี้ได้`);
      liff.closeWindow();
      return false;
    }
  } catch (e) {
    console.error("Permission Error:", e);
    alert("ไม่สามารถตรวจสอบสิทธิได้");
    return false;
  }
}
