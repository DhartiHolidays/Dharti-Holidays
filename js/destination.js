document.getElementById("year").textContent=new Date().getFullYear();const hdr=document.getElementById("siteHeader");document.getElementById("navToggle").addEventListener("click",()=>hdr.classList.toggle("open"));function esc(e){return String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}function photosOf(e){try{const t=typeof e.photos=="string"?JSON.parse(e.photos||"[]"):e.photos||[];return Array.isArray(t)?t:[]}catch{return[]}}function lines(e){return String(e||"").split(`
`).map(t=>t.trim()).filter(Boolean)}const root=document.getElementById("destRoot"),wantedId=new URLSearchParams(location.search).get("id");function relatedCard(e){const t=photosOf(e)[0],n=t?`<img src="${esc(t)}" alt="${esc(e.name)}" loading="lazy" width="600" height="400">`:`<div class="dg-placeholder"><span>${esc(e.name)}</span></div>`;return`<a class="dg-card" href="destination.html?id=${encodeURIComponent(e.id)}"><div class="dg-media">${n}</div><div class="dg-body"><h3>${esc(e.name)}</h3><p class="dg-loc">${esc(e.location||"")}</p><span class="dg-cta">View guide \u2192</span></div></a>`}function setMeta(e,t){const n=`${e.name} Travel Guide \u2014 Places to Visit, Food & Activities | Dharti Holidays`;document.title=n;const o=(e.overview||e.tagline||`Plan your trip to ${e.name} with Dharti Holidays.`).replace(/\s+/g," ").slice(0,155);let i=document.querySelector('meta[name="description"]');i||(i=document.createElement("meta"),i.name="description",document.head.appendChild(i)),i.content=o;const c=document.querySelector('link[rel="canonical"]');setCanonicalUrl(location.origin+"/destination.html?id="+encodeURIComponent(e.id));const s=document.createElement("script");s.type="application/ld+json",s.textContent=JSON.stringify({"@context":"https://schema.org","@type":"TouristDestination",name:e.name,description:e.overview||e.tagline||"",url:location.origin+"/destination.html?id="+encodeURIComponent(e.id),...t.length?{image:t}:{}}),document.head.appendChild(s)}function render(e,t){const n=photosOf(e),o=lines(e.places),i=lines(e.activities),c=lines(e.food),s=e.region==="international"?"International":"Domestic",m=t.filter(a=>a.id!==e.id&&a.region===e.region).slice(0,4);setMeta(e,n),root.innerHTML=`
  <section class="dd-hero"><div class="wrap dd-hero-grid">
    <div class="dd-gallery">
      <div class="dd-main"><button type="button" class="share-btn share-corner" data-wa-share aria-label="Share on WhatsApp" title="Share on WhatsApp" data-share-url="destination.html?id=${encodeURIComponent(e.id)}" data-share-text="${("\u{1F4CD} *"+e.name+"* travel guide \u2014 "+(e.bestTime?"best time: "+e.bestTime+". ":"")+"Places, food & activities by Dharti Holidays, Ahmedabad").replace(/&/g,"&amp;").replace(/"/g,"&quot;")}"></button>${n[0]?`<img id="ddMainImg" src="${esc(n[0])}" alt="${esc(e.name)}" width="900" height="600">`:`<div class="dg-placeholder big"><span>${esc(e.name)}</span></div>`}</div>
      ${n.length>1?`<div class="dd-thumbs">${n.map((a,d)=>`<img src="${esc(a)}" data-src="${esc(a)}" alt="${esc(e.name)} photo ${d+1}" loading="lazy" width="92" height="68">`).join("")}</div>`:""}
    </div>
    <div class="dd-intro">
      <span class="eyebrow">${s} Destination</span>
      <h1>${esc(e.name)}</h1>
      <p class="dd-tagline">${esc(e.tagline||"")}</p>
      <div class="dd-facts">
        ${e.location?`<div><span>Location</span><strong>${esc(e.location)}</strong></div>`:""}
        ${e.bestTime?`<div><span>Best time to visit</span><strong>${esc(e.bestTime)}</strong></div>`:""}
        <div><span>Trip type</span><strong>${s}</strong></div>
      </div>
      <div class="dd-actions">
        <a class="btn btn-primary" href="#ddEnquiry">Plan this trip</a>
        <a class="btn btn-outline-dark" href="hotels.html?dest=${encodeURIComponent(e.id)}">Browse hotels</a>
        <a class="btn btn-outline-dark" href="packages.html?q=${encodeURIComponent(e.name)}">View packages</a>
      </div>
    </div>
  </div></section>

  <section class="dd-section"><div class="wrap dd-cols">
    <div class="dd-main-col">
      ${e.overview?`<h2>About ${esc(e.name)}</h2><p class="dd-overview">${esc(e.overview).replace(/\n/g,"<br>")}</p>`:""}
      ${o.length?`<h2>Places to visit</h2><ol class="dd-places">${o.map(a=>`<li>${esc(a)}</li>`).join("")}</ol>`:""}
      ${i.length?`<h2>Things to do</h2><ul class="dd-chips">${i.map(a=>`<li>${esc(a)}</li>`).join("")}</ul>`:""}
      ${c.length?`<h2>Food speciality</h2><ul class="dd-food">${c.map(a=>`<li>${esc(a)}</li>`).join("")}</ul>`:""}
    </div>
    <aside class="dd-enquiry" id="ddEnquiry">
      <h3>Interested in ${esc(e.name)}?</h3>
      <p>Tell us your plan and we'll send a personal quote \u2014 flights, hotels and sightseeing included if you like.</p>
      <form class="dd-form" id="ddForm">
        <div class="field"><label for="ddName">Your name</label><input type="text" id="ddName" required placeholder="Full name"></div>
        <div class="field"><label for="ddPhone">Phone number</label><input type="tel" id="ddPhone" required placeholder="+91"></div>
        <div class="field"><label for="ddDates">Travel dates (approx.)</label><input type="text" id="ddDates" placeholder="e.g. 20\u201327 Dec"></div>
        <div class="field"><label for="ddPax">Travellers</label><input type="number" id="ddPax" min="1" value="2"></div>
        <div class="field"><label for="ddNotes">Anything else?</label><textarea id="ddNotes" placeholder="Budget, hotel type, interests..."></textarea></div>
        <button type="submit" class="btn btn-primary">Send Enquiry</button>
      </form>
    </aside>
  </div></section>

  ${m.length?`<section class="dd-related"><div class="wrap"><h2>More ${s.toLowerCase()} destinations</h2><div class="dg-grid">${m.map(relatedCard).join("")}</div></div></section>`:""}`,root.addEventListener("click",a=>{const d=a.target.closest(".dd-thumbs img"),l=document.getElementById("ddMainImg");d&&l&&(l.src=d.dataset.src)}),document.getElementById("ddForm").addEventListener("submit",a=>{a.preventDefault();const d=document.getElementById("ddName").value.trim(),l=document.getElementById("ddPhone").value.trim(),p=document.getElementById("ddDates").value.trim(),u=document.getElementById("ddPax").value,h=document.getElementById("ddNotes").value.trim();let r=`Hi Dharti Holidays, I'd like to plan a trip to ${e.name}:

Travellers: ${u}`;p&&(r+=`
Travel dates: ${p}`),r+=`
Name: ${d}
Phone: ${l}`,h&&(r+=`
Notes: ${h}`),submitEnquiry("destination",d,l,r),document.getElementById("ddForm").reset()})}async function load(){if(typeof APPS_SCRIPT_URL>"u"||APPS_SCRIPT_URL.includes("PASTE_YOUR")){root.innerHTML='<div class="wrap"><p class="dd-loading">Destination guides will appear here once connected.</p></div>';return}try{const t=await(await fetch(`${APPS_SCRIPT_URL}?action=listDestinations`)).json(),n=Array.isArray(t)?t:[],o=n.find(i=>String(i.id)===String(wantedId));if(!o){root.innerHTML='<div class="wrap"><div class="dd-loading"><h2>Destination not found</h2><p style="margin:10px 0 20px;">It may have been removed or the link is incorrect.</p><a class="btn btn-primary" href="destinations.html">See all destinations</a></div></div>';return}render(o,n)}catch(e){root.innerHTML='<div class="wrap"><p class="dd-loading">Could not load this guide right now \u2014 please try again shortly.</p></div>',console.error(e)}}load();function setCanonicalUrl(e){let t=document.querySelector('link[rel="canonical"]');t||(t=document.createElement("link"),t.rel="canonical",document.head.appendChild(t)),t.href=e;let n=document.querySelector('meta[property="og:url"]');n||(n=document.createElement("meta"),n.setAttribute("property","og:url"),document.head.appendChild(n)),n.content=e}
