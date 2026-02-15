async function init() {
  try {
    await liff.init({ liffId: CONFIG.LIFF_ID_STATUS });
    if (!liff.isLoggedIn()) { liff.login(); return; }
    const profile = await liff.getProfile();
    
    const res = await fetch(`${CONFIG.GAS_API}?type=status&uid=${profile.userId}`).then(r => r.json());
    
    if(!res.order) { 
      document.getElementById("page-status").innerHTML = "<p class='text-center mt-5 text-muted'>ไม่พบข้อมูลออเดอร์</p>"; 
      return; 
    }
    
    document.getElementById("o-id").innerText = res.order.id;
    document.getElementById("o-items").innerText = res.order.items;
    
    const box = document.getElementById("timeline-box");
    if (box) {
      box.innerHTML = ""; 
      const steps = res.statusMaster.filter(s => !s.id.includes('.'));
      const activeIdx = steps.findIndex(s => s.desc === res.order.status);
      steps.forEach((s, i) => {
        const div = document.createElement("div");
        div.className = `t-item ${i < activeIdx ? 'done' : (i === activeIdx ? 'active' : '')}`;
        div.innerHTML = `<div class="t-icon"></div><div class="t-text">${s.desc}</div>`;
        box.appendChild(div);
      });
    }
  } catch (err) {
    console.error(err);
  } finally {
    document.getElementById("loader").style.display = "none";
  }
}
window.onload = init;
