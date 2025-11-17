

document.addEventListener("DOMContentLoaded", () => {
  
  const TOla_IN_GRAMS = 11.664;
  const GOLD_NISAB_TOLA = 7.5;
  const SILVER_NISAB_TOLA = 52.5;

  
  let selectedAsset = ""; 

  window.selectAsset = function (asset) {
    selectedAsset = asset;
    
    document.getElementById("step1").style.display = "none";
    document.getElementById("step2").style.display = "block";
    document.getElementById("resultBox").style.display = "none";

    
    if (asset === "other") {
      asset = "cash";
    }
   
    selectedAsset = (asset === "cash") ? "cash" : selectedAsset;

    
    const titleMap = {
      gold: "Gold Zakat (سونے کی زکوٰة)",
      silver: "Silver Zakat (چاندی کی زکوٰة)",
      cash: "Cash / Other Assets (نقد/دیگر اثاثے)",
    };
    document.getElementById("assetTitle").innerText =
      titleMap[asset] || "Zakat";

  
    const weightBox = document.getElementById("weightInputBox");
    const rateBox = document.getElementById("rateInputBox");
    const cashBox = document.getElementById("cashValue");
    
    
    const goldLink = document.getElementById("goldLinkNote");
    const silverLink = document.getElementById("silverLinkNote");
    
   
    const rateLabel = document.getElementById("rateLabel");
    const rateField = document.getElementById("rate");
    if (rateField) rateField.value = "";

   
    if (goldLink) goldLink.style.display = "none";
    if (silverLink) silverLink.style.display = "none";

    if (asset === "gold") {
     
      weightBox.style.display = "block";
      rateBox.style.display = "block";
      cashBox.style.display = "none";
      
      if (goldLink) goldLink.style.display = "block"; 
      if (rateLabel) rateLabel.innerText = "Gold Rate (per Tola/Gram)";
      updatePlaceholdersForUnit(); 
      
    } else if (asset === "silver") {
     
      weightBox.style.display = "block";
      rateBox.style.display = "block";
      cashBox.style.display = "none";
      
      if (silverLink) silverLink.style.display = "block";
      if (rateLabel) rateLabel.innerText = "Silver Rate (per Tola/Gram)";
      updatePlaceholdersForUnit(); 

    } else { 
      
      weightBox.style.display = "none";
      rateBox.style.display = "block";
      cashBox.style.display = "block";
      
      if (silverLink) silverLink.style.display = "block";
      
      
      if (rateField) {
        rateField.placeholder = "Enter Silver Price per Tola (Nisab k liye)";
      }
      if (rateLabel) {
        rateLabel.innerText = "Current Silver Rate (per Tola)";
      }
    }
  };


  function updatePlaceholdersForUnit() {
    
    if (selectedAsset !== "gold" && selectedAsset !== "silver") {
        return; 
    }
      
    const unit = getUnit();
    const weightField = document.getElementById("weight");
    const rateField = document.getElementById("rate");
    const weightLabel = document.getElementById("weightLabel");
    const rateLabel = document.getElementById("rateLabel");

    if (!weightField || !rateField) return;

    if (unit === "tola") {
      weightField.placeholder = "Enter weight (e.g. 7.5) — in Tola";
      rateField.placeholder = "Enter price per Tola (PKR)";
      if (weightLabel) weightLabel.innerText = "Enter the weight in Tola";
      if (rateLabel) rateLabel.innerText = selectedAsset.charAt(0).toUpperCase() + selectedAsset.slice(1) + " Rate (per Tola)";
    } else {
      weightField.placeholder = "Enter weight (e.g. 87.48) — in Grams";
      rateField.placeholder = "Enter price per Gram (PKR)";
      if (weightLabel) weightLabel.innerText = "Enter the weight in Gram";
      if (rateLabel) rateLabel.innerText = selectedAsset.charAt(0).toUpperCase() + selectedAsset.slice(1) + " Rate (per Gram)";
    }
  }

  function getUnit() {
    const node = document.querySelector('input[name="unit"]:checked');
    return node ? node.value : "tola";
  }

 
  window.calculateZakat = function () {
    const resultBox = document.getElementById("resultBox");
    resultBox.style.display = "none";

    const unit = getUnit(); 

    const fmt = (n) =>
      Number(n).toLocaleString(undefined, { maximumFractionDigits: 2 });

    let html = "";
    let eligible = false;
    let zakat = 0;
    let totalValue = 0;
    let nisabInfo = "";

    if (selectedAsset === "gold" || selectedAsset === "silver") {
      const rawWeight = parseFloat(document.getElementById("weight").value);
      const rate = parseFloat(document.getElementById("rate").value);

      if (!rawWeight || !rate || isNaN(rawWeight) || isNaN(rate)) {
        alert("Please enter valid weight and rate. (براہ کرم درست مقدار اور شرح درج کریں)");
        return;
      }

      let weightInTola =
        unit === "tola" ? rawWeight : rawWeight / TOla_IN_GRAMS;
      let weightInGrams =
        unit === "gram" ? rawWeight : rawWeight * TOla_IN_GRAMS;

      totalValue =
        unit === "tola" ? weightInTola * rate : weightInGrams * rate;

      if (selectedAsset === "gold") {
        eligible = weightInTola >= GOLD_NISAB_TOLA;
        nisabInfo = `${GOLD_NISAB_TOLA} Tola ≈ ${(
          GOLD_NISAB_TOLA * TOla_IN_GRAMS
        ).toFixed(2)} g`;
      } else {
        eligible = weightInTola >= SILVER_NISAB_TOLA;
        nisabInfo = `${SILVER_NISAB_TOLA} Tola ≈ ${(
          SILVER_NISAB_TOLA * TOla_IN_GRAMS
        ).toFixed(2)} g`;
      }

      if (eligible) {
        zakat = totalValue * 0.025;
        html += `<div class="result-inner">
                    <h3 style="color:#0f5132;">✅ Zakat Eligible — واجب (Eligible)</h3>
                    <p>Asset: <b>${selectedAsset.toUpperCase()}</b></p>
                    <p>Weight: <b>${rawWeight}</b> ${unit === "tola" ? "Tola" : "g (grams)"}</p>
                    <p>Total Value: <b>PKR ${fmt(totalValue)}</b></p>
                    <p>Nisab: <b>${nisabInfo}</b></p>
                    <hr>
                    <p style="font-size:18px;">Zakat (2.5%): <b>PKR ${fmt(zakat)}</b></p>
                  </div>`;
      } else {
        html += `<div class="result-inner">
                    <h3 style="color:#842029;">❌ Not Eligible — ابھی واجب نہیں</h3>
                    <p>Your ${selectedAsset} weight: <b>${rawWeight}</b> ${unit === "tola" ? "Tola" : "g"}</p>
                    <p>Required Nisab: <b>${nisabInfo}</b></p>
                  </div>`;
      }

    } else {
      // cash / other
      const amount = parseFloat(document.getElementById("cashValue").value || 0);
      const silverRatePerTola = parseFloat(document.getElementById("rate").value || 0);

      if (!amount || isNaN(amount) || !silverRatePerTola || isNaN(silverRatePerTola)) {
        alert("Enter total amount AND current silver rate per tola. (براہ کرم کل رقم اور چاندی کا ریٹ درج کریں)");
        return;
      }
      
      const calculatedNisabPKR = SILVER_NISAB_TOLA * silverRatePerTola;
      const guidance = `Nisab is calculated based on 52.5 Tola of Silver.`;
      
      eligible = amount >= calculatedNisabPKR;
      zakat = eligible ? amount * 0.025 : 0;

      if (eligible) {
        html += `<div class="result-inner">
                    <h3 style="color:#0f5132;">✅ Eligible — واجب</h3>
                    <p>Total Wealth (PKR): <b>PKR ${fmt(amount)}</b></p>
                    <p>Current Nisab (52.5 Tola @ ${fmt(silverRatePerTola)}/Tola): <b>PKR ${fmt(calculatedNisabPKR)}</b></p>
                    <p>Zakat (2.5%): <b>PKR ${fmt(zakat)}</b></p>
                    <small style="color:#554b27">${guidance}</small>
                  </div>`;
      } else {
        html += `<div class="result-inner">
                    <h3 style="color:#842029;">❌ Not Eligible — ابھی واجب نہیں</h3>
                    <p>Total Wealth (PKR): <b>PKR ${fmt(amount)}</b></p>
                    <p>Nisab Threshold: <b>PKR ${fmt(calculatedNisabPKR)}</b></p>
                    <p>Amount needed: <b>PKR ${fmt(Math.max(0, calculatedNisabPKR - amount))}</b></p>
                    <small style="color:#554b27">${guidance}</small>
                  </div>`;
      }
    }

    resultBox.innerHTML = `
      <div style="padding:12px; border-radius:8px;">
        ${html}
        <div style="margin-top:12px; display:flex; gap:8px; justify-content:center;">
          <button onclick="resetCalculator()" class="reset-btn" style="padding:10px 14px; background:#444; color:#fff; border:none;">Start Over (دوبارہ کریں)</button>
        </div>
      </div>
    `;
    resultBox.style.display = "block";
    resultBox.scrollIntoView({ behavior: "smooth" });
  };

  // reset to first step
  window.resetCalculator = function () {
    const ids = ["weight", "rate", "cashValue"];
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.value = "";
    });
    document.getElementById("step2").style.display = "none";
    document.getElementById("resultBox").style.display = "none";
    document.getElementById("step1").style.display = "block";
    selectedAsset = "";
  };

  if (!document.getElementById("step2")) {
    console.warn("Warning: step2 not found in DOM.");
  }

  
  const unitRadios = document.querySelectorAll('input[name="unit"]');
  unitRadios.forEach((radio) => {
    radio.addEventListener("change", updatePlaceholdersForUnit);
  });

})