import React, { useState } from "react";

// Constants for calculations
const k0 = 4558.90;
const M1 = -0.00321180;
const M2 = -0.03995400;
const M3 = 0.259180;
const M4 = -0.590610;
const M5 = 0.000177840;
const T = 1000;

function App() {
  const [passes, setPasses] = useState([
    {
      pass: 1,
      h0: "",
      b0: "",
      h1: "",
      b1: "",
      dN: "",
      n: "",
      alpha0: "",
      Kfm: "",
      p_: "", 
      F: "",
      rotated: false,
    },
  ]);
  const [error, setError] = useState("");

  //--------------------Calculation Functions---------------------------//
  const calculateB1 = (b0, h0, h1, R) => {
    const deltaH = h0 - h1;
    if (deltaH <= 0 || !b0 || !h0 || !h1 || !R) return "";
    const A =
        (1 + 5 * Math.pow(0.35 - deltaH / h0, 2)) * Math.sqrt(h0 / deltaH - 1);
    const B = (b0 / h0 - 1) * Math.pow(b0 / h0, 2 / 3);
    const firstPart =
        1 / (1 - deltaH / h0 + (3 * A) / Math.pow(2 * (R / h0), 3 / 4));
    const secondPart = b0 / h0 / (1 + 0.57 * B);
    return (b0 + (h0 - h1) * firstPart * secondPart).toFixed(2);
};

const calculateAlpha0 = (h0, h1, dw) => {
  if (!h0 || !h1 || !dw || h0 <= h1 || dw <= 0) return "";
  return (Math.acos(1 - (h0 - h1) / (dw)) * (180 / Math.PI)).toFixed(2);
};

  const calculatep_ = (A0, A1, R, deltaH, n) => {
    const p = Math.log(A0 / A1);
    const vc = (Math.PI * n * (R * 2)) / 60; 
    return (p * vc / Math.sqrt(R * deltaH)).toFixed(2);
  };

  const calculateKfm = (h0, b0, h1, b1, dN, n) => {
    if (!h0 || !b0 || !h1 || !b1 || !dN || h0 <= h1 || dN <= h1) return "";

    const A0 = h0 * b0;
    const A1 = h1 * b1;
    const dw = dN - h1; 
    const R = dw / 2;
    const deltaH = h0 - h1;

    if (A0 <= 0 || A1 <= 0 || R <= 0 || deltaH <= 0) return "";

    const p_ = calculatep_(A0, A1, R, deltaH, n);

    return (
        k0 *
        Math.exp(M1 * T) *
        Math.pow(p_, M2 + M5 * T) *
        Math.pow(p_, M3) *
        Math.exp(M4 * p_)
    ).toFixed(2);
};


const calculateForce = (bm, Kfm, R, deltaH, h0, h1) => {
  if (!bm || !Kfm || !R || !deltaH || !h0 || !h1) return "";

  // Calculate eh
  const eh = (h0 - h1) / h0;

  // Calculate BN
  const BN = Math.sqrt((1 - eh) / eh) *
   Math.tan(0.5 * Math.sqrt(h1 / R) *
   Math.log(1 - eh)) + 0.5 *
   Math.atan(Math.sqrt(eh / (1 - eh)));

  // Calculate Qf
  const Qf = 2 * 
  Math.sqrt((1 - eh) / eh) * 
  Math.atan(Math.sqrt(eh / (1 - eh))) - 
  1 + Math.sqrt(R / h1) * 
  Math.sqrt((1 - eh) / eh) * 
  Math.log(Math.sqrt(1 - eh) / 
  (1 - eh * (1 - Math.pow(BN, 2))));

  return (bm * Kfm * Math.sqrt(R * deltaH) * Qf);
};


const updateDependentValues = (index, updatedPasses) => {
  const currentPass = updatedPasses[index];
  const { h0, h1, b0, dN, n } = currentPass;

  if (h0 && h1 && b0 && dN && h0 > h1) {
      const dw = dN - h1; 
      const R = dw / 2;
      const b1 = calculateB1(parseFloat(b0), parseFloat(h0), parseFloat(h1), parseFloat(R));
      const alpha0 = calculateAlpha0(parseFloat(h0), parseFloat(h1), parseFloat(dw));
      const bm = (parseFloat(b0) + parseFloat(b1)) / 2;
      const deltaH = h0 - h1;

      const Kfm = calculateKfm(
          parseFloat(h0),
          parseFloat(b0),
          parseFloat(h1),
          parseFloat(b1),
          parseFloat(dN), 
          n
      );

      const F = calculateForce(
          parseFloat(bm),
          parseFloat(Kfm),
          parseFloat(R),
          parseFloat(deltaH),
          parseFloat(h0),
          parseFloat(h1)
      );

      updatedPasses[index] = {
          ...currentPass,
          b1,
          alpha0,
          Kfm,
          F,
          p_: calculatep_(h0 * b0, h1 * b1, R, deltaH, n),
      };
  } else {
      updatedPasses[index] = {
          ...currentPass,
          b1: "",
          alpha0: "",
          Kfm: "",
          p_: "",
          F: "",
      };
  }

  return updatedPasses;
};


  const handleCellChange = (value, index, column) => {
    const updatedPasses = [...passes];
    const currentPass = updatedPasses[index];
    const prevPass = updatedPasses[index - 1] || null;

    if (column === "h0" && index > 0 && value > prevPass.h1) {
      setError("H0 cannot be greater than the previous pass's H1");
      return;
    }

    if (column === "h1" && value > currentPass.h0) {
      setError("H1 cannot be greater than H0");
      return;
    }

    setError("");
    currentPass[column] = value;
    updateDependentValues(index, updatedPasses);

    // Update subsequent passes
    for (let i = index + 1; i < updatedPasses.length; i++) {
      const prev = updatedPasses[i - 1];
      updatedPasses[i].h0 = prev.h1 || "";
      updatedPasses[i].b0 = prev.b1 || "";
      updateDependentValues(i, updatedPasses);
    }

    setPasses(updatedPasses);
  };

  const handleRotation = (index) => {
    const updatedPasses = [...passes];
    const currentPass = updatedPasses[index];
    const rotated = !currentPass.rotated;

    if (rotated) {
      [currentPass.h0, currentPass.b0] = [currentPass.b0, currentPass.h0];
      [currentPass.h1, currentPass.b1] = [currentPass.b1, currentPass.h1];
    } else {
      [currentPass.h0, currentPass.b0] = [currentPass.b0, currentPass.h0];
      [currentPass.h1, currentPass.b1] = [currentPass.b1, currentPass.h1];
    }

    currentPass.rotated = rotated;
    updateDependentValues(index, updatedPasses);
    setPasses(updatedPasses);
  };

  const addPass = () => {
    const lastPass = passes[passes.length - 1];
    const newPass = {
      pass: passes.length + 1,
      h0: lastPass.h1 || "",
      b0: lastPass.b1 || "",
      h1: "",
      b1: "",
      dN: lastPass.dN || "",
      n: lastPass.n ||"",
      alpha0: "",
      Kfm: "",
      p_: "",
      F: "",
      rotated: false,
    };

    const updatedPasses = [...passes, newPass];
    setPasses(updatedPasses);
  };

  const removePass = (index) => {
    if (index === 0) return;
    const updatedPasses = passes.filter((_, i) => i !== index).map((pass, i) => ({ ...pass, pass: i + 1 }));
    setPasses(updatedPasses);
  };

  return (
    <div>
      <h1>Pass Schedule Simulation Tool</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <div className="table-container">
      <table border="1">
        <thead>
          <tr>
            <th>Rotate</th>
            <th>Pass</th>
            <th>H0</th>
            <th>B0</th>
            <th>H1</th>
            <th>dN</th>
            <th>n</th>
            <th>B1</th>
            <th>B1 / H1</th>
            <th>Alpha0</th>
            <th>p.</th> 
            <th>Kfm</th>
            <th>Roll Force: F</th>
            <th>Remove</th>
          </tr>
        </thead>
        <tbody>
          {passes.map((pass, index) => (
            <tr key={index}>
              <td>
                <input type="checkbox" checked={pass.rotated || false} onChange={() => (index === 0 ? null : handleRotation(index))} disabled={index === 0} />
              </td>
              <td>{pass.pass}</td>
              {["h0", "b0", "h1", "dN", "n"].map((col) => (
                <td key={col}>
                  <input type="number" value={pass[col]} onChange={(e) => handleCellChange(e.target.value, index, col)} />
                </td>
              ))}
              <td>{pass.b1}</td>
              <td>{(pass.b1 / pass.h1).toFixed(2)}</td>
              <td>{pass.alpha0}</td>
              <td>{pass.p_}</td>
              <td>{pass.Kfm}</td>
              <td>{(pass.F / 1000).toFixed(2)}</td>
              <td>
                <button className="removepass" onClick={() => removePass(index)} disabled={index === 0}>
                  <img src=".\imgs\trash.png" alt="remove button" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
      <button onClick={addPass} style={{ marginTop: "10px" }}>Add Pass</button>
    </div>
  );
}

export default App;
