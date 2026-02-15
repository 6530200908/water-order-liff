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
        const img = document.getElementById("preview");
        img.src = imageBase64;
        img.style.display = "block";
        document.getElementById("sendBtn").disabled = false;
      };
      reader.readAsDataURL(e.target.files[0]);
    };
  } catch (err) { console.error(err); } finally { document.getElementById("loader").style.display = "none"; }
}

async function uploadSlip() {
  document.getElementById("sendBtn").disabled = true;
  try {
    await fetch(CONFIG.WEBHOOK_SLIP, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order_id: orderIdFromUrl, slip_image: imageBase64 })
    });
    liff.sendMessages([{ type: "text", text: "✅ ส่งสลิปเรียบร้อยแล้วค่ะ" }]).finally(() => liff.closeWindow());
  } catch (err) { alert("เกิดข้อผิดพลาด"); document.getElementById("sendBtn").disabled = false; }
}
window.onload = init;
