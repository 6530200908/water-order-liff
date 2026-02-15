let currentOrderId = "", driverImageBase64 = "";
async function init() {
  try {
    await liff.init({ liffId: CONFIG.LIFF_ID_DRIVER });
    if (!liff.isLoggedIn()) { liff.login(); return; }
    loadDriverOrders();
  } catch (err) { console.error(err); document.getElementById("loader").style.display = "none"; }
}

function loadDriverOrders() {
  fetch(`${CONFIG.GAS_API}?type=driver_list`)
    .then(res => res.json()).then(res => {
      const list = document.getElementById("driver-order-list");
      if (res.orders.length === 0) { list.innerHTML = "<p class='text-center mt-5'>ไม่มีรายการ</p>"; return; }
      list.innerHTML = res.orders.map(o => `
        <div class="order-card p-3 mb-3 bg-dark rounded-3 border-start border-info border-4">
          <div class="fw-bold">${o.order_id}</div>
          <div class="small text-info">${o.customer} - ${o.locat}</div>
          <button class="btn btn-outline-info w-100 mt-2 btn-sm" onclick="openUploadModal('${o.order_id}')">📸 ส่งของสำเร็จ</button>
        </div>`).join("");
    }).finally(() => { document.getElementById("loader").style.display = "none"; });
}

function openUploadModal(id) {
  currentOrderId = id;
  document.getElementById("modal-order-id").innerText = "Order: " + id;
  document.getElementById("upload-modal").style.display = "block";
  document.getElementById("driverSlipInput").onchange = e => {
    const reader = new FileReader();
    reader.onload = () => {
      driverImageBase64 = reader.result;
      document.getElementById("driver-preview").src = driverImageBase64;
      document.getElementById("driver-preview").style.display = "block";
      document.getElementById("btn-submit-delivery").disabled = false;
    };
    reader.readAsDataURL(e.target.files[0]);
  };
}

function closeUploadModal() { document.getElementById("upload-modal").style.display = "none"; }

async function submitDelivery() {
  document.getElementById("btn-submit-delivery").disabled = true;
  fetch(CONFIG.GAS_API, { method: "POST", body: JSON.stringify({ type: "update_delivery", orderId: currentOrderId, image: driverImageBase64 }) })
  .then(() => { alert("บันทึกสำเร็จ!"); closeUploadModal(); loadDriverOrders(); });
}
window.onload = init;
