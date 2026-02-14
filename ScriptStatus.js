async function init() {
  await liff.init({ liffId: CONFIG.LIFF_ID_STATUS });
  if (!liff.isLoggedIn()) { liff.login(); return; }
  const profile = await liff.getProfile();
  
  fetch(`${CONFIG.GAS_API}?type=status&uid=${profile.userId}`)
    .then(res => res.json()).then(res => {
      document.getElementById("loader").style.display = "none";
      if(!res.order) { document.body.innerHTML = "<p class='text-center mt-5'>ไม่พบข้อมูล</p>"; return; }
      document.getElementById("o-id").innerText = res.order.id;
      document.getElementById("o-items").innerText = res.order.items;
      
      const box = document.getElementById("timeline-box");
      const steps = res.statusMaster.filter(s => !s.id.includes('.'));
      const activeIdx = steps.findIndex(s => s.desc === res.order.status);
      steps.forEach((s, i) => {
        const div = document.createElement("div");
        div.className = `t-item ${i < activeIdx ? 'done' : (i === activeIdx ? 'active' : '')}`;
        div.innerHTML = `<div class="t-icon"></div>${s.desc}`;
        box.appendChild(div);
      });
    });
}
window.onload = init;
