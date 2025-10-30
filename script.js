/* script.js
   Multi-step Zakat logic (Option A: user selects unit Tola or Gram)
   - Works with your existing HTML (ids: step1, step2, resultBox, weight, rate, cashValue)
   - Injects unit controls automatically into step2
*/

document.addEventListener("DOMContentLoaded", () => {
  // constants
  const TOla_IN_GRAMS = 11.664;
  const GOLD_NISAB_TOLA = 7.5;
  const SILVER_NISAB_TOLA = 52.5;

  // state
  let selectedAsset = "";

  // expose selectAsset globally so existing HTML onclick works
  window.selectAsset = function (asset) {
    selectedAsset = asset;
    // show step2 & hide step1
    document.getElementById("step1").style.display = "none";
    document.getElementById("step2").style.display = "block";
    document.getElementById("resultBox").style.display = "none";

    // set asset title
    const titleMap = { 
      gold: "Gold Zakat (سونے کی زکوٰة)", 
      silver: "Silver Zakat (چاندی کی زکوٰة)", 
      cash: "Cash / Other Assets (نقد/دیگر اثاثے)" 
    };
    document.getElementById("assetTitle").innerText = titleMap[asset] || "Zakat";

    // show/hide relevant input groups
    const weightBox = document.getElementById("weightInputBox");
    const rateBox = document.getElementById("rateInputBox");
    const cashBox = document.getElementById("cashValue");

    if (asset === "gold" || asset === "silver") {
      // show weight & rate inputs
      weightBox.style.display = "block";
      rateBox.style.display = "block";
      cashBox.style.display = "none";

      // inject unit selection (if not already present)
      // injectUnitControls(); // we already have it in HTML
      // update placeholders and label text
      updatePlaceholdersForUnit();
    } else {
      // cash/other assets only
      weightBox.style.display = "none";
      rateBox.style.display = "none";
      cashBox.style.display = "block";
    }
  };

  // Add unit radio controls to step2 (only once)
  function injectUnitControls() {
    const rateBox = document.getElementById("rateInputBox");
    if (document.getElementById("unitControls")) return; // already injected

    const html = `
      <div id="unitControls" style="margin:8px 0; text-align:center;">
        <label style="margin-right:12px;">
          <input type="radio" name="unit" value="tola" checked> Tola (تولہ)
        </label>
        <label>
          <input type="radio" name="unit" value="gram"> Gram (گرام)
        </label>
        <div style="font-size:13px; color:#ffeaa7; margin-top:6px;">
          Note: If you choose <b>Tola</b>, enter rate per Tola. (اگر تولہ منتخب کریں تو شرح فی تولہ درج کریں)
        </div>
      </div>
    `;
    rateBox.insertAdjacentHTML("afterbegin", html);

    // attach change listener
    document.getElementsByName("unit").forEach(r => {
      r.addEventListener("change", updatePlaceholdersForUnit);
    });
  }

  // 🔥 UPDATED FUNCTION — now also changes label text dynamically
  function updatePlaceholdersForUnit() {
    const unit = getUnit();
    const weightField = document.getElementById("weight");
    const rateField = document.getElementById("rate");
    const weightLabel = document.getElementById("weightLabel"); // 👈 label element

    if (!weightField || !rateField) return;

    if (unit === "tola") {
      weightField.placeholder = "Enter weight (e.g. 7.5 for nisab) — in Tola";
      rateField.placeholder = "Enter price per Tola (PKR)";
      if (weightLabel) weightLabel.innerText = "Enter the weight in Tola";
    } else {
      weightField.placeholder = "Enter weight (e.g. 87.48) — in Grams";
      rateField.placeholder = "Enter price per Gram (PKR)";
      if (weightLabel) weightLabel.innerText = "Enter the weight in Gram";
    }
  }

  function getUnit() {
    const node = document.querySelector('input[name="unit"]:checked');
    return node ? node.value : "tola";
  }

  // calculate and render result
  window.calculateZakat = function () {
    const resultBox = document.getElementById("resultBox");
    resultBox.style.display = "none";

    const unit = getUnit(); // 'tola' or 'gram'

    // helpers to format PKR nicely
    const fmt = n => Number(n).toLocaleString(undefined, { maximumFractionDigits: 2 });

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

      // Normalize: compute weight in tola and grams
      let weightInTola = unit === "tola" ? rawWeight : rawWeight / TOla_IN_GRAMS;
      let weightInGrams = unit === "gram" ? rawWeight : rawWeight * TOla_IN_GRAMS;

      // Determine price units:
      totalValue = (unit === "tola") ? (weightInTola * rate) : (weightInGrams * rate);

      // Nisab check uses tola thresholds
      if (selectedAsset === "gold") {
        eligible = weightInTola >= GOLD_NISAB_TOLA;
        nisabInfo = `${GOLD_NISAB_TOLA} Tola ≈ ${(GOLD_NISAB_TOLA * TOla_IN_GRAMS).toFixed(2)} g`;
      } else {
        eligible = weightInTola >= SILVER_NISAB_TOLA;
        nisabInfo = `${SILVER_NISAB_TOLA} Tola ≈ ${(SILVER_NISAB_TOLA * TOla_IN_GRAMS).toFixed(2)} g`;
      }

      if (eligible) {
        zakat = totalValue * 0.025;
        html += `<div class="result-inner">
                   <h3 style="color:#dfffc4;">✅ Zakat Eligible — واجب (Eligible)</h3>
                   <p>Asset: <b>${selectedAsset.toUpperCase()}</b> (${selectedAsset === "gold" ? "سونا" : "چاندی"})</p>
                   <p>Weight: <b>${rawWeight}</b> ${unit === "tola" ? "Tola" : "g (grams)"} — وزن</p>
                   <p>Equivalent: <b>${weightInTola.toFixed(4)}</b> Tola / <b>${weightInGrams.toFixed(2)}</b> g</p>
                   <p>Price used: <b>PKR ${fmt(rate)}</b> per ${unit === "tola" ? "Tola" : "Gram"}</p>
                   <p>Total Value: <b>PKR ${fmt(totalValue)}</b></p>
                   <p>Nisab: <b>${nisabInfo}</b></p>
                   <hr>
                   <p style="font-size:18px;">Zakat (2.5%): <b>PKR ${fmt(zakat)}</b></p>
                 </div>`;
      } else {
        html += `<div class="result-inner">
                   <h3 style="color:#ffd3d3;">❌ Not Eligible — ابھی واجب نہیں (Not Eligible)</h3>
                   <p>Your ${selectedAsset} amount is below nisab.</p>
                   <p>Your weight: <b>${rawWeight}</b> ${unit === "tola" ? "Tola" : "g (grams)"}</p>
                   <p>Required Nisab: <b>${nisabInfo}</b></p>
                   <p>To reach nisab you need additional: <b>`;

        // compute required extra (in weight and value)
        if (selectedAsset === "gold") {
          const missingTola = Math.max(0, GOLD_NISAB_TOLA - weightInTola);
          const missingGrams = missingTola * TOla_IN_GRAMS;
          const missingValue = (unit === "tola") ? missingTola * rate : missingGrams * rate;
          html += `${missingTola.toFixed(3)} Tola (≈ ${missingGrams.toFixed(2)} g) — approx PKR ${fmt(missingValue)}`;
        } else {
          const missingTola = Math.max(0, SILVER_NISAB_TOLA - weightInTola);
          const missingGrams = missingTola * TOla_IN_GRAMS;
          const missingValue = (unit === "tola") ? missingTola * rate : missingGrams * rate;
          html += `${missingTola.toFixed(3)} Tola (≈ ${missingGrams.toFixed(2)} g) — approx PKR ${fmt(missingValue)}`;
        }

        html += `</b></p></div>`;
      }

    } else {
      // cash / other
      const amount = parseFloat(document.getElementById("cashValue").value || 0);
      if (!amount || isNaN(amount)) {
        alert("Enter total amount in PKR. (براہ کرم کل رقم درج کریں)");
        return;
      }

      const guidance = `Silver Nisab: ${SILVER_NISAB_TOLA} Tola ≈ ${(SILVER_NISAB_TOLA * TOla_IN_GRAMS).toFixed(2)} g. To compute PKR-nisab, use current silver rate per Tola and multiply.`;
      const fallbackNisabPKR = 135000;

      eligible = amount >= fallbackNisabPKR;
      zakat = eligible ? amount * 0.025 : 0;

      if (eligible) {
        html += `<div class="result-inner">
                   <h3 style="color:#dfffc4;">✅ Eligible — واجب</h3>
                   <p>Total Wealth (PKR): <b>PKR ${fmt(amount)}</b></p>
                   <p>Zakat (2.5%): <b>PKR ${fmt(zakat)}</b></p>
                   <small style="color:#fff7c4">${guidance}</small>
                 </div>`;
      } else {
        html += `<div class="result-inner">
                   <h3 style="color:#ffd3d3;">❌ Not Eligible — ابھی واجب نہیں</h3>
                   <p>Total Wealth (PKR): <b>PKR ${fmt(amount)}</b></p>
                   <p>Approx Nisab Threshold (fallback): <b>PKR ${fmt(fallbackNisabPKR)}</b></p>
                   <small style="color:#fff7c4">${guidance}</small>
                 </div>`;
      }
    }

    resultBox.innerHTML = `
      <div style="padding:12px; border-radius:8px;">
        ${html}
        <div style="margin-top:12px; display:flex; gap:8px; justify-content:center;">
          <button onclick="resetCalculator()" style="padding:10px 14px; border-radius:8px; background:#444; color:#fff; border:none;">Start Over (دوبارہ کریں)</button>
        </div>
      </div>
    `;
    resultBox.style.display = "block";
    resultBox.scrollIntoView({ behavior: "smooth" });
  };

  // reset to first step
  window.resetCalculator = function () {
    const ids = ["weight", "rate", "cashValue"];
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = "";
    });
    document.getElementById("step2").style.display = "none";
    document.getElementById("resultBox").style.display = "none";
    document.getElementById("step1").style.display = "block";
    selectedAsset = "";
  };

  if (!document.getElementById("step2")) {
    console.warn("Warning: step2 not found in DOM. Ensure your HTML contains element with id='step2'.");
  }
    // ✅ Add listeners for radio buttons (Tola/Gram)
  const unitRadios = document.querySelectorAll('input[name="unit"]');
  unitRadios.forEach(radio => {
    radio.addEventListener("change", updatePlaceholdersForUnit);
  });

  // ✅ Set initial placeholders when the page first loads
  updatePlaceholdersForUnit();
}); // DOMContentLoaded
