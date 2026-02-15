let imageBase64 = "", orderIdFromUrl = "";

async function init() {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    orderIdFromUrl = urlParams.get('order_id');
    
    await liff.init({ liffId: CONFIG.LIFF_ID_SLIP });
    if (!liff.isLoggedIn()) { liff.login(); return; }
    
    if(orderIdFromUrl) document.getElementById("slip-order-text").innerText = "ออเดอร์: " + orderIdFromUrl;

    document.getElementById("slipInput").onchange = e => {
      const reader = new FileReader();
      reader.onload = () => {
        imageBase64 = reader.result;
        const preview = document.getElementById("preview");
        preview.src = imageBase64;
        preview.style.display = "block";
        document.getElementById("sendBtn").disabled = false;
      };
      reader.readAsDataURL(e.target.files[0]);
    };
  } catch (err) {
    console.error(err);
  } finally {
    document.getElementById("loader").style.display = "none";
  }
}

async function uploadSlip() {
  const btn = document.getElementById("sendBtn");
  btn.disabled = true;
  btn.innerText = "กำลังส่ง...";
  
  try {
    await fetch(CONFIG.WEBHOOK_SLIP, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order_id: orderIdFromUrl, slip_image: imageBase64 })
    });
    liff.sendMessages([{ type: "text", text: "📤 ส่งสลิปเรียบร้อยแล้วค่ะ" }]).finally(() => liff.closeWindow());
  } catch (err) {
    alert("เกิดข้อผิดพลาดในการส่ง");
    btn.disabled = false;
  }
}
window.onload = init;
