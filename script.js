document.addEventListener("DOMContentLoaded", () => {
  
  // --- Constants ---
  const TOLA_IN_GRAMS = 11.664;
  const GOLD_NISAB_TOLA = 7.5;
  const SILVER_NISAB_TOLA = 52.5;

  let selectedAsset = ""; 

  // --- Function to Select Asset (Gold/Silver/Other) ---
  window.selectAsset = function (asset) {
    selectedAsset = asset;
    
    // UI Logic: Switch from Step 1 to Step 2
    const step1 = document.getElementById("step1"); // Ensure HTML ID is "step1" or "step-1"
    const step2 = document.getElementById("step2"); // Ensure HTML ID is "step2" or "step-2"
    const resultBox = document.getElementById("resultBox");

    if (step1) step1.style.display = "none";
    if (step2) step2.style.display = "block";
    if (resultBox) resultBox.style.display = "none";

    // Handle "Other" as "Cash"
    if (asset === "other") {
      asset = "cash";
    }
    selectedAsset = (asset === "cash") ? "cash" : selectedAsset;

    // Update Title based on selection
    const titleMap = {
      gold: "Gold Zakat (سونے کی زکوٰة)",
      silver: "Silver Zakat (چاندی کی زکوٰة)",
      cash: "Cash / Other Assets (نقد/دیگر اثاثے)",
    };
    
    const assetTitle = document.getElementById("assetTitle");
    if(assetTitle) assetTitle.innerText = titleMap[asset] || "Zakat";

    // Get Input Elements
    const weightBox = document.getElementById("weightInputBox");
    const rateBox = document.getElementById("rateInputBox");
    const cashBox = document.getElementById("cashValue");
    
    const goldLink = document.getElementById("goldLinkNote");
    const silverLink = document.getElementById("silverLinkNote");
    
    const rateLabel = document.getElementById("rateLabel");
    const rateField = document.getElementById("rate");
    
    // Reset Rate Field
    if (rateField) rateField.value = "";

    // Reset Links display
    if (goldLink) goldLink.style.display = "none";
    if (silverLink) silverLink.style.display = "none";

    // Logic to show/hide inputs based on Asset Type
    if (asset === "gold") {
      if(weightBox) weightBox.style.display = "block";
      if(rateBox) rateBox.style.display = "block";
      if(cashBox) cashBox.style.display = "none";
      
      if (goldLink) goldLink.style.display = "block"; 
      if (rateLabel) rateLabel.innerText = "Gold Rate (per Tola/Gram)";
      updatePlaceholdersForUnit(); 
      
    } else if (asset === "silver") {
      if(weightBox) weightBox.style.display = "block";
      if(rateBox) rateBox.style.display = "block";
      if(cashBox) cashBox.style.display = "none";
      
      if (silverLink) silverLink.style.display = "block";
      if (rateLabel) rateLabel.innerText = "Silver Rate (per Tola/Gram)";
      updatePlaceholdersForUnit(); 

    } else { 
      // Cash or Other
      if(weightBox) weightBox.style.display = "none";
      if(rateBox) rateBox.style.display = "block";
      if(cashBox) cashBox.style.display = "block";
      
      if (silverLink) silverLink.style.display = "block";
      
      if (rateField) {
        rateField.placeholder = "Enter Silver Price per Tola (Nisab k liye)";
      }
      if (rateLabel) {
        rateLabel.innerText = "Current Silver Rate (per Tola)";
      }
    }
  };

  // --- Helper to Update Placeholders (Grams vs Tola) ---
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

  // --- Helper to get selected Unit ---
  function getUnit() {
    const node = document.querySelector('input[name="unit"]:checked');
    return node ? node.value : "tola";
  }

  // --- Main Calculation Function ---
  window.calculateZakat = function () {
    const resultBox = document.getElementById("resultBox");
    if(resultBox) resultBox.style.display = "none";

    const unit = getUnit(); 

    const fmt = (n) =>
      Number(n).toLocaleString(undefined, { maximumFractionDigits: 2 });

    let html = "";
    let eligible = false;
    let zakat = 0;
    let totalValue = 0;
    let nisabInfo = "";

    // 1. Logic for GOLD or SILVER
    if (selectedAsset === "gold" || selectedAsset === "silver") {
      const rawWeight = parseFloat(document.getElementById("weight").value);
      const rate = parseFloat(document.getElementById("rate").value);

      if (!rawWeight || !rate || isNaN(rawWeight) || isNaN(rate)) {
        alert("Please enter valid weight and rate. (براہ کرم درست مقدار اور شرح درج کریں)");
        return;
      }

      let weightInTola =
        unit === "tola" ? rawWeight : rawWeight / TOLA_IN_GRAMS;
      let weightInGrams =
        unit === "gram" ? rawWeight : rawWeight * TOLA_IN_GRAMS;

      totalValue =
        unit === "tola" ? weightInTola * rate : weightInGrams * rate;

      if (selectedAsset === "gold") {
        eligible = weightInTola >= GOLD_NISAB_TOLA;
        nisabInfo = `${GOLD_NISAB_TOLA} Tola ≈ ${(
          GOLD_NISAB_TOLA * TOLA_IN_GRAMS
        ).toFixed(2)} g`;
      } else {
        eligible = weightInTola >= SILVER_NISAB_TOLA;
        nisabInfo = `${SILVER_NISAB_TOLA} Tola ≈ ${(
          SILVER_NISAB_TOLA * TOLA_IN_GRAMS
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
      // 2. Logic for CASH / OTHER
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

    if(resultBox) {
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
    }
  };

  // --- Reset Function ---
  window.resetCalculator = function () {
    const ids = ["weight", "rate", "cashValue"];
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.value = "";
    });
    
    const step1 = document.getElementById("step1");
    const step2 = document.getElementById("step2");
    const resultBox = document.getElementById("resultBox");

    if (step2) step2.style.display = "none";
    if (resultBox) resultBox.style.display = "none";
    if (step1) step1.style.display = "block";
    
    selectedAsset = "";
  };

  // --- Event Listeners for Unit Change ---
  const unitRadios = document.querySelectorAll('input[name="unit"]');
  unitRadios.forEach((radio) => {
    radio.addEventListener("change", updatePlaceholdersForUnit);
  });

});