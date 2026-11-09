document.getElementById("year").textContent=new Date().getFullYear();const hdr=document.getElementById("siteHeader");document.getElementById("navToggle").addEventListener("click",()=>hdr.classList.toggle("open"));const esc=e=>String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t]),money=e=>{const t=String(e??"").trim();return t?/^[\d,.]+$/.test(t)?"\u20B9"+Number(t.replace(/,/g,"")).toLocaleString("en-IN"):t:""},CAR_SVG='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 11l1.5-4.5A2 2 0 0 1 8.4 5h7.2a2 2 0 0 1 1.9 1.5L19 11"/><rect x="3" y="11" width="18" height="6" rx="2"/><circle cx="7.5" cy="17" r="1.5"/><circle cx="16.5" cy="17" r="1.5"/></svg>',CITIES=["Ahmedabad Airport","Ahmedabad Railway Station","Ahmedabad City","Gandhinagar","Vadodara","Surat","Rajkot","Bhavnagar","Junagadh","Dwarka","Somnath","Diu","Mount Abu","Udaipur","Jaipur","Jodhpur","Mumbai","Pune","Goa","Indore","Ujjain"],root=document.getElementById("vehRoot"),wantedId=new URLSearchParams(location.search).get("id");let V=null,tripType="oneway";function todayStr(){const e=new Date;return e.getFullYear()+"-"+String(e.getMonth()+1).padStart(2,"0")+"-"+String(e.getDate()).padStart(2,"0")}function setMeta(){document.title=`${V.name} ${V.category?V.category+" ":""}Cab on Rent from Ahmedabad \u2014 Rate per km & Booking | Dharti Holidays`;const e=`${V.name}${V.similarTo?" "+V.similarTo:""} \u2014 ${V.category||"car"}${V.seats?", "+V.seats+" seater":""}${V.perKm?", \u20B9"+V.perKm+" per km":""}. Enquire with Dharti Holidays, Ahmedabad for outstation trips and airport transfers.`;let t=document.querySelector('meta[name="description"]');t||(t=document.createElement("meta"),t.name="description",document.head.appendChild(t)),t.content=e.slice(0,160);const i=document.querySelector('link[rel="canonical"]');setCanonicalUrl(location.origin+"/vehicle.html?id="+encodeURIComponent(V.id))}function otherCard(e){const t=e.photoUrl?`<img src="${esc(e.photoUrl)}" alt="${esc(e.name)}" loading="lazy" width="600" height="340">`:CAR_SVG;return`<a class="veh-card veh-card-link" href="vehicle.html?id=${encodeURIComponent(e.id)}"><div class="veh-media">${t}<span class="veh-cat">${esc(e.category)}</span></div><div class="veh-body"><h3>${esc(e.name)}</h3><div class="veh-rate">${e.perKm?`<strong>\u20B9${esc(e.perKm)}</strong><span>per km</span>`:"<span>Rate on request</span>"}</div></div></a>`}function render(e){const t=String(V.features||"").split(`
`).map(n=>n.trim()).filter(Boolean),i=[["Category",V.category],["Seating capacity",V.seats?V.seats+" passengers":""],["Luggage space",V.luggage],["Air conditioning",V.ac==="No"?"No":"Yes"],["Rate per km",money(V.perKm)?money(V.perKm)+" per km":""],["Minimum km per day",V.minKmPerDay?V.minKmPerDay+" km":""],["Driver allowance",money(V.driverAllowance)?money(V.driverAllowance)+" per day":""],["Night halt charge",money(V.nightCharge)]].filter(n=>n[1]),d=e.filter(n=>String(n.id)!==String(V.id)).slice(0,3);root.innerHTML=`
  <section class="dd-hero"><div class="wrap dd-hero-grid">
    <div class="dd-gallery"><div class="dd-main"><button type="button" class="share-btn share-corner" data-wa-share aria-label="Share on WhatsApp" title="Share on WhatsApp" data-share-url="vehicle.html?id=${encodeURIComponent(V.id)}" data-share-text="${esc("\u{1F697} *"+V.name+"* ("+(V.category||"car")+(V.seats?", "+V.seats+" seats":"")+") \u2014 car rental by Dharti Holidays, Ahmedabad"+(money(V.perKm)?`
From `+money(V.perKm)+" per km":""))}"></button>${V.photoUrl?`<img src="${esc(V.photoUrl)}" alt="${esc(V.name)}" width="900" height="600">`:`<div class="vd-ph">${CAR_SVG}</div>`}</div></div>
    <div class="dd-intro">
      <span class="eyebrow">${esc(V.category||"Vehicle")}</span>
      <h1>${esc(V.name)} ${V.similarTo?`<small>${esc(V.similarTo)}</small>`:""}</h1>
      <div class="dd-facts">
        <div><span>Seats</span><strong>${esc(V.seats||"\u2014")}</strong></div>
        <div><span>Luggage</span><strong>${esc(V.luggage||"\u2014")}</strong></div>
        <div><span>A/C</span><strong>${V.ac==="No"?"No":"Yes"}</strong></div>
      </div>
      <div class="vd-rate">${money(V.perKm)?`<strong>${esc(money(V.perKm))}</strong><span>per km</span>`:"<span>Rate on request \u2014 we confirm it in your quote</span>"}</div>
      <div class="dd-actions"><a class="btn btn-primary" href="#vdEnquiry">Enquire for this vehicle</a><a class="btn btn-outline-dark" href="car-transfer.html">See all vehicles</a></div>
    </div>
  </div></section>

  <section class="dd-section"><div class="wrap dd-cols">
    <div class="dd-main-col">
      <h2>Vehicle details</h2>
      <table class="vd-table">${i.map(n=>`<tr><th>${esc(n[0])}</th><td>${esc(n[1])}</td></tr>`).join("")}</table>
      ${t.length?`<h2>Features</h2><ul class="dd-chips">${t.map(n=>`<li>${esc(n)}</li>`).join("")}</ul>`:""}
      <h2>How charges work</h2>
      <p class="vd-note">Charges depend on the kilometres travelled. For longer trips the minimum km per day, driver allowance and night halt charge shown above can apply. Tolls, parking and state taxes, where applicable, are stated in your quote. The rate shown is indicative; we confirm the final fare after you send your trip details.</p>
    </div>
    <aside class="dd-enquiry" id="vdEnquiry">
      <h3>Enquire for ${esc(V.name)}</h3>
      <p>Tell us about your trip and we'll confirm availability and the final fare.</p>
      <form class="dd-form" id="vdForm">
        <div class="vd-toggle" id="vdTrip"><button type="button" class="active" data-type="oneway">One Way</button><button type="button" data-type="roundtrip">Round Trip</button></div>
        <div class="field"><label for="vdFrom">Pickup location</label><input type="text" id="vdFrom" list="vdCities" required placeholder="e.g. Ahmedabad Airport"></div>
        <div class="field"><label for="vdTo">Drop location</label><input type="text" id="vdTo" list="vdCities" required placeholder="e.g. Udaipur"></div>
        <div class="vd-row2">
          <div class="field"><label for="vdDate">Pickup date</label><input type="date" id="vdDate" required min="${todayStr()}"></div>
          <div class="field"><label for="vdTime">Pickup time</label><input type="time" id="vdTime" required></div>
        </div>
        <div class="field" id="vdReturnField" hidden><label for="vdReturn">Return date</label><input type="date" id="vdReturn" min="${todayStr()}"></div>
        <div class="field"><label for="vdPax">Passengers</label><input type="number" id="vdPax" min="1" value="2" required><span class="vd-warn" id="vdPaxNote"></span></div>
        <div class="field"><label for="vdName">Your name</label><input type="text" id="vdName" required placeholder="Full name"></div>
        <div class="field"><label for="vdPhone">Phone number</label><input type="tel" id="vdPhone" required placeholder="+91"></div>
        <div class="field"><label for="vdNotes">Anything else? (optional)</label><textarea id="vdNotes" placeholder="Luggage, extra stops, flight number for pickup..."></textarea></div>
        <button type="submit" class="btn btn-primary">Send Enquiry</button>
      </form>
      <datalist id="vdCities">${CITIES.map(n=>`<option value="${esc(n)}">`).join("")}</datalist>
    </aside>
  </div></section>
  ${d.length?`<section class="dd-related"><div class="wrap"><h2>Other vehicles</h2><div class="veh-grid">${d.map(otherCard).join("")}</div></div></section>`:""}`,document.getElementById("vdTrip").addEventListener("click",n=>{const a=n.target.closest("button[data-type]");a&&(tripType=a.dataset.type,document.querySelectorAll("#vdTrip button").forEach(r=>r.classList.toggle("active",r===a)),document.getElementById("vdReturnField").hidden=tripType!=="roundtrip",document.getElementById("vdReturn").required=tripType==="roundtrip")}),document.getElementById("vdDate").addEventListener("change",n=>{document.getElementById("vdReturn").min=n.target.value||todayStr()}),document.getElementById("vdPax").addEventListener("input",n=>{const a=parseInt(V.seats,10),r=parseInt(n.target.value,10);document.getElementById("vdPaxNote").textContent=a&&r>a?`This vehicle seats ${a}. We'll suggest a bigger one if needed.`:""}),document.getElementById("vdForm").addEventListener("submit",n=>{n.preventDefault();const a=o=>document.getElementById(o).value.trim();let r=`Hi Dharti Holidays, I'd like a quote for a car transfer:

Vehicle: ${V.name}${V.similarTo?" "+V.similarTo:""} (${V.category||"car"}${V.seats?", "+V.seats+" seats":""})`;money(V.perKm)&&(r+=`
Shown rate: ${money(V.perKm)} per km`),r+=`
Trip type: ${tripType==="roundtrip"?"Round Trip":"One Way"}
Pickup: ${a("vdFrom")} on ${a("vdDate")} at ${a("vdTime")}
Drop: ${a("vdTo")}`,tripType==="roundtrip"&&a("vdReturn")&&(r+=`
Return date: ${a("vdReturn")}`),r+=`
Passengers: ${a("vdPax")}

Name: ${a("vdName")}
Phone: ${a("vdPhone")}`,a("vdNotes")&&(r+=`
Notes: ${a("vdNotes")}`),submitEnquiry("car-transfer",a("vdName"),a("vdPhone"),r),document.getElementById("vdForm").reset(),document.getElementById("vdPaxNote").textContent=""})}async function load(){if(typeof APPS_SCRIPT_URL>"u"||APPS_SCRIPT_URL.includes("PASTE_YOUR")){root.innerHTML='<div class="wrap"><p class="dd-loading">Vehicles will appear here once connected.</p></div>';return}try{const t=await(await fetch(`${APPS_SCRIPT_URL}?action=listVehicles`)).json(),i=Array.isArray(t)?t:[];if(V=i.find(d=>String(d.id)===String(wantedId)),!V){root.innerHTML='<div class="wrap"><div class="dd-loading"><h2>Vehicle not found</h2><p style="margin:10px 0 20px;">It may no longer be available or the link is incorrect.</p><a class="btn btn-primary" href="car-transfer.html">See all vehicles</a></div></div>';return}setMeta(),render(i)}catch(e){root.innerHTML='<div class="wrap"><p class="dd-loading">Could not load this vehicle right now \u2014 please try again shortly.</p></div>',console.error(e)}}load();function setCanonicalUrl(e){let t=document.querySelector('link[rel="canonical"]');t||(t=document.createElement("link"),t.rel="canonical",document.head.appendChild(t)),t.href=e;let i=document.querySelector('meta[property="og:url"]');i||(i=document.createElement("meta"),i.setAttribute("property","og:url"),document.head.appendChild(i)),i.content=e}
