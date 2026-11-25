function packageTicketHtml(e){const t=e.routeFrom&&e.routeTo?`${e.routeFrom} \u2192 ${e.routeTo}`:e.destinationLabel,n=e.routeFrom&&e.routeTo?e.destinationLabel:"",a=/^\d+$/.test(String(e.price))?`\u20B9${Number(e.price).toLocaleString("en-IN")}`:e.price;return`
    <article class="ticket">
      ${e.photoUrl?`<img class="ticket-cover" src="${e.photoUrl}" alt="${t}" loading="lazy">`:""}
      <div class="ticket-head">
        <div class="ticket-route">${t}${n?`<small>${n}</small>`:""}</div>
        <div class="ticket-tag">${e.tag||""}</div>
      </div>
      <div class="ticket-perf"></div>
      <div class="ticket-body">
        <p>${e.description||""}</p>
        <div class="ticket-meta">
          <span>${e.meta1Label||""}<br><strong>${e.meta1Value||""}</strong></span>
          <span>${e.meta2Label||""}<br><strong>${e.meta2Value||""}</strong></span>
          <span>${e.meta3Label||""}<br><strong>${e.meta3Value||""}</strong></span>
        </div>
      </div>
      <div class="ticket-foot">
        <div class="ticket-price">${a}<span>${e.priceUnit||""}</span></div>
        <a href="package.html?id=${encodeURIComponent(e.id)}" class="ticket-link">View itinerary \u2192</a>
      </div>
    </article>`}async function loadPackages(){const e={domestic:document.querySelector('.pkg-grid[data-panel="domestic"]'),international:document.querySelector('.pkg-grid[data-panel="international"]'),honeymoon:document.querySelector('.pkg-grid[data-panel="honeymoon"]'),corporate:document.querySelector('.pkg-grid[data-panel="corporate"]')};if(Object.values(e).forEach(t=>{t&&(t.innerHTML='<p style="color:var(--slate); grid-column:1/-1;">Loading packages...</p>')}),typeof APPS_SCRIPT_URL>"u"||APPS_SCRIPT_URL.includes("PASTE_YOUR")){Object.values(e).forEach(t=>{t&&(t.innerHTML='<p style="color:var(--slate); grid-column:1/-1;">Packages will appear here once connected \u2014 contact us directly for current offers.</p>')});return}try{const n=await(await fetch(`${APPS_SCRIPT_URL}?action=listPackages`)).json();Object.keys(e).forEach(a=>{const o=e[a];if(!o)return;const i=(Array.isArray(n)?n:[]).filter(r=>r.category===a);if(i.length===0){o.innerHTML='<p style="color:var(--slate); grid-column:1/-1;">No packages listed here yet \u2014 check back soon or contact us directly.</p>';return}o.innerHTML=i.map(packageTicketHtml).join("")})}catch(t){console.warn("Could not load packages:",t),Object.values(e).forEach(n=>{n&&(n.innerHTML='<p style="color:var(--slate); grid-column:1/-1;">Could not load packages right now \u2014 please contact us directly.</p>')})}}loadPackages().then(()=>{window.__packagesLoaded=!0,document.dispatchEvent(new Event("packagesLoaded"))});function pkgAttr(e){return String(e??"").replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}document.addEventListener("click",function(e){const t=e.target.closest(".pkg-enquire");t&&(e.preventDefault(),openPackageEnquiry(t.dataset))});function openPackageEnquiry(e){const t=document.getElementById("pkgModal");t&&t.remove();const n=e.dest&&e.dest!==e.pkg?`${e.pkg} \u2014 ${e.dest}`:e.pkg,a=document.createElement("div");a.id="pkgModal",a.className="pkg-modal-overlay",a.innerHTML=`
    <div class="pkg-modal" role="dialog" aria-label="Package enquiry">
      <button type="button" class="pkg-modal-close" aria-label="Close">\u2715</button>
      <h3>Enquire about this package</h3>
      <p class="pkg-modal-sub">${pkgAttr(n)}</p>
      <form id="pkgModalForm">
        <div class="field"><label for="pmName">Your name</label><input type="text" id="pmName" required placeholder="Full name"></div>
        <div class="field"><label for="pmPhone">Phone number</label><input type="tel" id="pmPhone" required placeholder="+91"></div>
        <div class="field"><label for="pmDate">Travel date (approx.)</label><input type="text" id="pmDate" placeholder="e.g. 20 Dec, or flexible"></div>
        <div class="field"><label for="pmPax">Travellers</label><input type="number" id="pmPax" min="1" value="2"></div>
        <div class="field"><label for="pmNotes">Anything else? (optional)</label><textarea id="pmNotes" placeholder="Budget, hotel type, special requests..."></textarea></div>
        <button type="submit" class="btn btn-primary" style="width:100%; justify-content:center; padding:14px;">Send Enquiry</button>
      </form>
    </div>`,document.body.appendChild(a);const o=()=>{a.remove(),document.removeEventListener("keydown",i)},i=r=>{r.key==="Escape"&&o()};document.addEventListener("keydown",i),a.querySelector(".pkg-modal-close").addEventListener("click",o),a.addEventListener("click",r=>{r.target===a&&o()}),document.getElementById("pmName").focus(),document.getElementById("pkgModalForm").addEventListener("submit",function(r){r.preventDefault();const c=document.getElementById("pmName").value.trim(),s=document.getElementById("pmPhone").value.trim(),d=document.getElementById("pmDate").value.trim(),m=document.getElementById("pmPax").value,p=document.getElementById("pmNotes").value.trim();let l=`Hi Dharti Holidays, I'd like a quote for this package:

Package: ${e.pkg}${e.dest&&e.dest!==e.pkg?" ("+e.dest+")":""}`;e.price&&!/^[-–—\s]*$/.test(e.price)&&!/^custom$/i.test(e.price.trim())&&(l+=`
Price shown: ${e.price}${e.unit?" "+e.unit:""}`),l+=`
Travellers: ${m}`,d&&(l+=`
Travel date: ${d}`),l+=`
Name: ${c}
Phone: ${s}`,p&&(l+=`
Notes: ${p}`),o(),submitEnquiry("package",c,s,l)})}
