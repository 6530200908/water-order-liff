let currentOrderId = "";
let driverImageBase64 = "";

async function init() {
  await liff.init({ liffId: CONFIG.LIFF_ID_DRIVER }); // อย่าลืมเพิ่ม ID ใน Config
  if (!liff.isLoggedIn()) { liff.login(); return; }
  
  loadDriverOrders();
}

function loadDriverOrders() {
  // เรียก API หลังบ้านเพื่อดึงรายการที่มีสถานะ "รอจัดส่ง"
  fetch(`${CONFIG.GAS_API}?type=driver_list`)
    .then(res => res.json())
    .then(res => {
      document.getElementById("loader").style.display = "none";
      const listContainer = document.getElementById("driver-order-list");
      
      if (res.orders.length === 0) {
        listContainer.innerHTML = "<p class='text-center text-muted mt-5'>ไม่มีรายการที่ต้องส่งในขณะนี้</p>";
        return;
      }

      listContainer.innerHTML = res.orders.map(order => `
        <div class="order-card p-3 mb-3 shadow-sm border-start border-info border-4">
          <div class="d-flex justify-content-between align-items-start mb-2">
            <span class="badge bg-info text-dark">${order.order_id}</span>
            <small class="text-muted">${order.time}</small>
          </div>
          <div class="fw-bold fs-5 text-white mb-1">👤 ${order.customer}</div>
          <div class="text-info small mb-2">📍 ${order.locat}</div>
          <hr class="opacity-25">
          <div class="mb-3">
            <div class="small text-muted">รายการสินค้า:</div>
            <div class="fw-bold text-light">${order.bland}</div>
            <div class="small text-info">จำนวน: ${order.amount}</div>
          </div>
          <button class="btn btn-outline-info w-100 fw-bold" onclick="openUploadModal('${order.order_id}')">
            📸 ส่งของเรียบร้อย
          </button>
        </div>
      `).join("");
    });
}

function openUploadModal(orderId) {
  currentOrderId = orderId;
  document.getElementById("modal-order-id").innerText = "Order: " + orderId;
  document.getElementById("upload-modal").style.display = "block";
  
  // จัดการการเลือกรูป
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
  document.getElementById("driverSlipInput").value = "";
  document.getElementById("driver-preview").style.display = "none";
}

async function submitDelivery() {
  const btn = document.getElementById("btn-submit-delivery");
  btn.disabled = true;
  btn.innerText = "กำลังบันทึก...";

  // ส่งข้อมูลกลับไปที่หลังบ้านเพื่อ Update สถานะเป็น "ส่งสำเร็จ" และแนบรูป
  const data = {
    type: "update_delivery",
    orderId: currentOrderId,
    image: driverImageBase64
  };

  fetch(CONFIG.GAS_API, { method: "POST", body: JSON.stringify(data) })
    .then(res => res.json())
    .then(res => {
      alert("บันทึกการส่งสำเร็จ!");
      closeUploadModal();
      loadDriverOrders(); // โหลดรายการใหม่
    });
}

window.onload = init;
