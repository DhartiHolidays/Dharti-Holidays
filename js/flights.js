document.getElementById("year").textContent=new Date().getFullYear();const header=document.getElementById("siteHeader");document.getElementById("navToggle").addEventListener("click",()=>header.classList.toggle("open"));const AIRPORTS=["Ahmedabad (AMD)","Mumbai (BOM)","Delhi (DEL)","Bangalore (BLR)","Chennai (MAA)","Kolkata (CCU)","Hyderabad (HYD)","Pune (PNQ)","Goa (GOI)","Kochi (COK)","Jaipur (JAI)","Srinagar (SXR)","Leh (IXL)","Port Blair (IXZ)","Udaipur (UDR)","Dubai (DXB)","Abu Dhabi (AUH)","Bangkok (BKK)","Singapore (SIN)","Kuala Lumpur (KUL)","Kathmandu (KTM)","Bali - Denpasar (DPS)","Phuket (HKT)","Male (MLE)","London (LHR)","Paris (CDG)","New York (JFK)","Toronto (YYZ)","Sydney (SYD)","Doha (DOH)"],airportListEl=document.getElementById("airportList");AIRPORTS.forEach(t=>{const e=document.createElement("option");e.value=t,airportListEl.appendChild(e)});let tripType="oneway";const tripTypeBtns=document.querySelectorAll(".trip-type-btn"),simpleSection=document.getElementById("simpleTripSection"),multiSection=document.getElementById("multiCitySection"),returnDateField=document.getElementById("returnDateField");tripTypeBtns.forEach(t=>{t.addEventListener("click",()=>{tripTypeBtns.forEach(e=>e.classList.remove("active")),t.classList.add("active"),tripType=t.dataset.type,simpleSection.hidden=tripType==="multicity",multiSection.hidden=tripType!=="multicity",returnDateField.hidden=tripType!=="roundtrip",document.getElementById("fromAirport").required=tripType!=="multicity",document.getElementById("toAirport").required=tripType!=="multicity",document.getElementById("departDate").required=tripType!=="multicity",tripType==="multicity"&&multiCityLegsContainer.children.length===0&&(addLeg(),addLeg())})}),(function(){const e=new URLSearchParams(window.location.search);if(!e.has("from")&&!e.has("to"))return;e.get("trip")==="roundtrip"&&document.querySelector('.trip-type-btn[data-type="roundtrip"]').click(),e.get("from")&&(document.getElementById("fromAirport").value=e.get("from")),e.get("to")&&(document.getElementById("toAirport").value=e.get("to")),e.get("depart")&&(document.getElementById("departDate").value=e.get("depart")),e.get("return")&&(document.getElementById("returnDate").value=e.get("return"))})();const multiCityLegsContainer=document.getElementById("multiCityLegs");let legCount=0;function addLeg(){legCount++;const t=`leg-${Date.now()}-${legCount}`,e=document.createElement("div");e.className="leg-row",e.dataset.legId=t,e.innerHTML=`
    <div class="field">
      <label>From</label>
      <input type="text" list="airportList" class="leg-from" required placeholder="City or airport">
    </div>
    <div class="field">
      <label>To</label>
      <input type="text" list="airportList" class="leg-to" required placeholder="City or airport">
    </div>
    <div class="field">
      <label>Date</label>
      <input type="date" class="leg-date" required>
    </div>
    <button type="button" class="leg-remove" aria-label="Remove flight">\u2715</button>
  `,e.querySelector(".leg-remove").addEventListener("click",()=>{multiCityLegsContainer.children.length>1&&e.remove()}),multiCityLegsContainer.appendChild(e)}document.getElementById("addLegBtn").addEventListener("click",addLeg),document.getElementById("flightForm").addEventListener("submit",t=>{t.preventDefault();const e=document.getElementById("flightClass").value,d=document.getElementById("adultsCount").value,u=document.getElementById("childrenCount").value,c=document.getElementById("infantsCount").value,m=document.getElementById("flyerName").value.trim(),s=document.getElementById("flyerPhone").value.trim(),g=document.getElementById("flyerNotes").value.trim();let y={oneway:"One Way",roundtrip:"Round Trip",multicity:"Multi-City"}[tripType],l="";if(tripType==="multicity")l=Array.from(multiCityLegsContainer.children).map((r,i)=>{const a=r.querySelector(".leg-from").value.trim(),p=r.querySelector(".leg-to").value.trim(),f=r.querySelector(".leg-date").value;return`  Flight ${i+1}: ${a} \u2192 ${p} on ${f}`}).join(`
`);else{const o=document.getElementById("fromAirport").value.trim(),r=document.getElementById("toAirport").value.trim(),i=document.getElementById("departDate").value;if(l=`  ${o} \u2192 ${r} on ${i}`,tripType==="roundtrip"){const a=document.getElementById("returnDate").value;l+=`
  Return: ${r} \u2192 ${o} on ${a}`}}let n=`Hi Dharti Holidays, I'd like a flight quote:

`;n+=`Trip Type: ${y}
${l}

`,n+=`Class: ${e}
`,n+=`Passengers: ${d} Adult(s)`,Number(u)>0&&(n+=`, ${u} Child(ren)`),Number(c)>0&&(n+=`, ${c} Infant(s)`),n+=`

Name: ${m}
Phone: ${s}`,g&&(n+=`
Notes: ${g}`),submitEnquiry("flight",m,s,n)});
