let currentOrderId = "";
let driverImageBase64 = "";

async function init() {
  try {
    await liff.init({ liffId: CONFIG.LIFF_ID_DRIVER });
    if (!liff.isLoggedIn()) { liff.login(); return; }
    loadDriverOrders();
  } catch (err) {
    console.error(err);
    document.getElementById("loader").style.display = "none";
  }
}

function loadDriverOrders() {
  fetch(`${CONFIG.GAS_API}?type=driver_list`)
    .then(res => res.json())
    .then(res => {
      const listContainer = document.getElementById("driver-order-list");
      if (res.orders.length === 0) {
        listContainer.innerHTML = "<p class='text-center text-muted mt-5'>ไม่มีรายการที่ต้องส่ง</p>";
        return;
      }
      listContainer.innerHTML = res.orders.map(order => `
        <div class="order-card p-3 mb-3 shadow-sm border-start border-info border-4">
          <div class="d-flex justify-content-between mb-2">
            <span class="badge bg-info text-dark">${order.order_id}</span>
            <small class="text-muted">${order.time}</small>
          </div>
          <div class="fw-bold text-white mb-1">👤 ${order.customer}</div>
          <div class="text-info small mb-2">📍 ${order.locat}</div>
          <button class="btn btn-outline-info w-100 btn-sm" onclick="openUploadModal('${order.order_id}')">📸 ส่งของเรียบร้อย</button>
        </div>`).join("");
    })
    .finally(() => {
      document.getElementById("loader").style.display = "none";
    });
}

function openUploadModal(orderId) {
  currentOrderId = orderId;
  document.getElementById("modal-order-id").innerText = "Order: " + orderId;
  document.getElementById("upload-modal").style.display = "block";
  document.getElementById("driverSlipInput").onchange = e => {
    const reader = new FileReader();
    reader.onload = () => {
      driverImageBase64 = reader.result;
      const img = document.getElementById("driver-preview");
      img.src = driverImageBase64;
      img.style.display = "block";
      document.getElementById("btn-submit-delivery").disabled = false;
    };
    reader.readAsDataURL(e.target.files[0]);
  };
}

function closeUploadModal() {
  document.getElementById("upload-modal").style.display = "none";
}

async function submitDelivery() {
  const btn = document.getElementById("btn-submit-delivery");
  btn.disabled = true;
  fetch(CONFIG.GAS_API, { 
    method: "POST", 
    body: JSON.stringify({ type: "update_delivery", orderId: currentOrderId, image: driverImageBase64 }) 
  })
  .then(() => {
    alert("บันทึกการส่งสำเร็จ!");
    closeUploadModal();
    loadDriverOrders();
  });
}
window.onload = init;
