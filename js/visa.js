document.getElementById("year").textContent=new Date().getFullYear();const header=document.getElementById("siteHeader");document.getElementById("navToggle").addEventListener("click",()=>header.classList.toggle("open"));let visaServices=[];function visaCardHtml(e){return`
    <article class="ticket">
      <div class="ticket-head">
        <div class="ticket-route">${e.country}<small>${e.visaType}</small></div>
      </div>
      <div class="ticket-perf"></div>
      <div class="ticket-body">
        <p>${e.notes||"Documentation guidance and application assistance included."}</p>
        <div class="ticket-meta">
          <span>Processing Time<br><strong>${e.processingTime}</strong></span>
        </div>
      </div>
      <div class="ticket-foot">
        <div class="ticket-price">\u20B9${e.price}<span>${e.priceUnit||""}</span></div>
        <a href="#customVisaForm" class="ticket-link" onclick="prefillVisaCountry('${e.country.replace(/'/g,"\\'")}', '${e.visaType.replace(/'/g,"\\'")}')">Enquire \u2192</a>
      </div>
    </article>`}function prefillVisaCountry(e,t){document.getElementById("cvCountry").value=e;const n=document.getElementById("cvVisaType"),a=Array.from(n.options).find(s=>t.toLowerCase().includes(s.value.toLowerCase()));a&&(n.value=a.value)}async function loadVisaServices(){const e=document.getElementById("visaGrid");if(e.innerHTML='<p style="color:var(--slate); grid-column:1/-1;">Loading...</p>',typeof APPS_SCRIPT_URL>"u"||APPS_SCRIPT_URL.includes("PASTE_YOUR")){e.innerHTML='<p style="color:var(--slate); grid-column:1/-1;">Visa listings will appear here once connected \u2014 use the form below to enquire directly.</p>';return}try{const n=await(await fetch(`${APPS_SCRIPT_URL}?action=listVisaServices`)).json();visaServices=Array.isArray(n)?n:[],renderVisaGrid(visaServices),applyUrlQuery()}catch(t){e.innerHTML='<p style="color:var(--red); grid-column:1/-1;">Could not load visa services \u2014 please use the form below.</p>',console.error(t)}}function renderVisaGrid(e){const t=document.getElementById("visaGrid"),n=document.getElementById("visaNoResults");if(t.innerHTML="",e.length===0){n.hidden=!1;return}n.hidden=!0,t.innerHTML=e.map(visaCardHtml).join("")}document.getElementById("visaSearch").addEventListener("input",e=>{const t=e.target.value.trim().toLowerCase();if(document.getElementById("visaNoResultsQuery").textContent=e.target.value.trim(),!t){renderVisaGrid(visaServices);return}const n=visaServices.filter(a=>a.country.toLowerCase().includes(t)||a.visaType.toLowerCase().includes(t));renderVisaGrid(n)}),document.getElementById("customVisaForm").addEventListener("submit",e=>{e.preventDefault();const t=document.getElementById("cvCountry").value.trim(),n=document.getElementById("cvVisaType").value,a=document.getElementById("cvTravelDate").value,s=document.getElementById("cvApplicants").value,o=document.getElementById("cvName").value.trim(),c=document.getElementById("cvPhone").value.trim();let i=`Hi Dharti Holidays, I'd like visa assistance:

`;i+=`Destination Country: ${t}
`,i+=`Visa Type: ${n}
`,i+=`Applicants: ${s}
`,a&&(i+=`Planned Travel Date: ${a}
`),i+=`
Name: ${o}
Phone: ${c}`,submitEnquiry("visa",o,c,i)}),loadVisaServices();function applyUrlQuery(){const e=new URLSearchParams(location.search).get("q"),t=document.getElementById("visaSearch");e&&t&&(t.value=e,t.dispatchEvent(new Event("input")))}
