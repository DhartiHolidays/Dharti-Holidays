document.getElementById("year").textContent=new Date().getFullYear();const header=document.getElementById("siteHeader");document.getElementById("navToggle").addEventListener("click",()=>header.classList.toggle("open"));function passportCardHtml(e){return`
    <article class="ticket">
      <div class="ticket-head">
        <div class="ticket-route">${e.serviceType}</div>
      </div>
      <div class="ticket-perf"></div>
      <div class="ticket-body">
        <p>${e.notes||"Application filing and document guidance included."}</p>
        <div class="ticket-meta">
          <span>Processing Time<br><strong>${e.processingTime}</strong></span>
        </div>
      </div>
      <div class="ticket-foot">
        <div class="ticket-price">\u20B9${e.price}<span>${e.priceUnit||""}</span></div>
        <a href="#customPassportForm" class="ticket-link" onclick="prefillPassportService('${e.serviceType.replace(/'/g,"\\'")}')">Enquire \u2192</a>
      </div>
    </article>`}function prefillPassportService(e){document.getElementById("cpServiceType").value=e}async function loadPassportServices(){const e=document.getElementById("passportGrid");if(e.innerHTML='<p style="color:var(--slate); grid-column:1/-1;">Loading...</p>',typeof APPS_SCRIPT_URL>"u"||APPS_SCRIPT_URL.includes("PASTE_YOUR")){e.innerHTML='<p style="color:var(--slate); grid-column:1/-1;">Passport service listings will appear here once connected \u2014 use the form below to enquire directly.</p>';return}try{const s=await(await fetch(`${APPS_SCRIPT_URL}?action=listPassportServices`)).json(),n=Array.isArray(s)?s:[];if(n.length===0){e.innerHTML='<p style="color:var(--slate); grid-column:1/-1;">No services listed yet \u2014 use the form below to enquire directly.</p>';return}e.innerHTML=n.map(passportCardHtml).join("")}catch(t){e.innerHTML='<p style="color:var(--red); grid-column:1/-1;">Could not load services \u2014 please use the form below.</p>',console.error(t)}}document.getElementById("customPassportForm").addEventListener("submit",e=>{e.preventDefault();const t=document.getElementById("cpServiceType").value.trim(),s=document.getElementById("cpApplicants").value,n=document.getElementById("cpName").value.trim(),c=document.getElementById("cpPhone").value.trim();let i=`Hi Dharti Holidays, I'd like passport assistance:

`;i+=`Service Needed: ${t}
`,i+=`Applicants: ${s}
`,i+=`
Name: ${n}
Phone: ${c}`,submitEnquiry("passport",n,c,i)}),loadPassportServices(),(function(){const e=new URLSearchParams(location.search).get("service"),t=document.getElementById("cpServiceType");e&&t&&(t.value=e)})();
