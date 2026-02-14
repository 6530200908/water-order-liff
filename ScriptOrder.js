let currentUserId = "", products = [], cart = {};

async function init() {
  await liff.init({ liffId: CONFIG.LIFF_ID_ORDER });
  if (!liff.isLoggedIn()) { liff.login(); return; }
  const profile = await liff.getProfile();
  currentUserId = profile.userId;

  fetch(`${CONFIG.GAS_API}?uid=${currentUserId}`)
    .then(res => res.json()).then(res => {
      document.getElementById("loader").style.display = "none";
      products = res.products;
      renderProducts();
      const select = document.getElementById("locSelect");
      select.innerHTML = '<option value="">-- เลือกสถานที่ --</option>';
      res.locations.forEach(loc => select.innerHTML += `<option value="${loc}">${loc}</option>`);
      select.innerHTML += '<option value="อื่นๆ">อื่นๆ...</option>';
      document.getElementById("cusName").value = res.customer ? res.customer.name : profile.displayName;
    });
}

function renderProducts() {
  document.getElementById("product-list").innerHTML = products.map((p, i) => `
    <div class="product-card d-flex justify-content-between align-items-center">
      <div><div class="fw-bold">${p.desc}</div><div class="text-info small">${p.price} ฿</div></div>
      <div class="d-flex align-items-center gap-3">
        <button class="btn btn-sm btn-outline-light rounded-circle" onclick="updateQty(${i},-1)">-</button>
        <span id="qty-${i}" class="fw-bold">0</span>
        <button class="btn btn-sm btn-outline-info rounded-circle" onclick="updateQty(${i},1)">+</button>
      </div>
    </div>`).join("");
}

function updateQty(i, d) {
  cart[i] = Math.max(0, (cart[i] || 0) + d);
  document.getElementById(`qty-${i}`).innerText = cart[i];
  let total = 0;
  Object.keys(cart).forEach(k => { total += cart[k] * products[k].price; });
  document.getElementById("total-price").innerText = total;
}

function toggleOther(v) { document.getElementById("cusAddress").style.display = (v === "อื่นๆ") ? "block" : "none"; }
function openPayment() { if(document.getElementById("total-price").innerText === "0") return alert("เลือกน้ำก่อนครับ"); document.getElementById("payment-ui").style.display = "block"; }
function closePayment() { document.getElementById("payment-ui").style.display = "none"; }

function confirmOrder() {
  const loc = document.getElementById("locSelect").value;
  const addr = (loc === "อื่นๆ") ? document.getElementById("cusAddress").value : loc;
  const orderData = {
    uid: currentUserId,
    name: document.getElementById("cusName").value,
    address: addr,
    items: Object.keys(cart).filter(i => cart[i] > 0).map(i => products[i].desc).join(", "),
    amounts: Object.keys(cart).filter(i => cart[i] > 0).map(i => String(cart[i])).join(", "),
    total: document.getElementById("total-price").innerText
  };

  document.getElementById("btn-confirm").disabled = true;
  fetch(CONFIG.GAS_API, { method: "POST", body: JSON.stringify(orderData) })
    .then(res => res.json()).then(res => {
      liff.sendMessages([{ type: "text", text: `✅ สั่งสำเร็จ!\nออเดอร์: ${res.orderId}` }]).finally(() => liff.closeWindow());
    });
}
window.onload = init;
