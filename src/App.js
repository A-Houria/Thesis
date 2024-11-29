import React, { useState } from "react";

const MAX_PASSES = 50;

function App() {
  const [passes, setPasses] = useState([
    {
      pass: 1,
      h0: "",
      b0: "",
      h1: "",
      b1: "",
      r: "",
      alpha0: "",
      rotated: false,
    },
  ]);
  const [error, setError] = useState("");

  // Helper functions
  const calculateB1 = (b0, h0, h1, r) => {
    const deltaH = h0 - h1;
    const A =
      (1 + 5 * Math.pow(0.35 - deltaH / h0, 2)) * Math.sqrt(h0 / deltaH - 1);
    const B = (b0 / h0 - 1) * Math.pow(b0 / h0, 2 / 3);
    const firstPart =
      1 / (1 - deltaH / h0 + (3 * A) / Math.pow(2 * ((0.5 * r) / h0), 3 / 4));
    const secondPart = b0 / h0 / (1 + 0.57 * B);
    return (b0 + (h0 - h1) * firstPart * secondPart).toFixed(2);
  };

  const calculateAlpha0 = (h0, h1, r) => {
    if (!h0 || !h1 || !r || h0 <= h1 || r <= 0) return "";
    return (Math.acos(1 - (h0 - h1) / r) * (180 / Math.PI)).toFixed(2);
  };

  const updateDependentValues = (index, updatedPasses) => {
    const { h0, h1, b0, r } = updatedPasses[index];
    if (h0 && h1 && b0 && r && h0 > h1) {
      updatedPasses[index].b1 = calculateB1(
        parseFloat(b0),
        parseFloat(h0),
        parseFloat(h1),
        parseFloat(r)
      );
      updatedPasses[index].alpha0 = calculateAlpha0(
        parseFloat(h0),
        parseFloat(h1),
        parseFloat(r)
      );
    } else {
      updatedPasses[index].b1 = "";
      updatedPasses[index].alpha0 = "";
    }
    return updatedPasses;
  };

  // Add a new pass
  const addPass = () => {
    if (passes.length >= MAX_PASSES) return;

    const newPass = {
      pass: passes.length + 1,
      h0: passes[passes.length - 1].h1 || "",
      b0: passes[passes.length - 1].b1 || "",
      h1: "",
      b1: "",
      r: passes[passes.length - 1].r || "",
      alpha0: "",
      rotated: false,
    };

    const updatedPasses = [...passes, newPass];
    setPasses(updatedPasses);
    updateDependentValuesForAll(updatedPasses); // Ensure calculations are done for the new pass
  };

  // Remove a pass
  const removePass = (index) => {
    if (index === 0) return; // Prevent removal of the first pass
    const updatedPasses = passes
      .filter((_, i) => i !== index)
      .map((pass, i) => ({ ...pass, pass: i + 1 }));
    setPasses(updatedPasses);
    updateDependentValuesForAll(updatedPasses); // Ensure calculations are done
  };

  // Update dependent values for all passes
  const updateDependentValuesForAll = (updatedPasses) => {
    updatedPasses.forEach((_, index) => {
      updateDependentValues(index, updatedPasses);
    });
    setPasses(updatedPasses);
  };

  // Handle cell value changes
  const handleCellChange = (value, index, column) => {
    const updatedPasses = [...passes];
    const currentPass = updatedPasses[index];
    const prevPass = updatedPasses[index - 1] || null;

    if (column === "h0" && index > 0 && value > prevPass.h1) {
      setError(`H0 cannot be greater than the previous pass's H1`);
      return;
    }

    if (column === "h1" && value > currentPass.h0) {
      setError(`H1 cannot be greater than H0`);
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
      updatedPasses[i].r = prev.r || "";
      updateDependentValues(i, updatedPasses);
    }

    setPasses(updatedPasses);
  };

  // Handle rotation
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

  return (
    <div className="app">
      <h1>Pass Schedule Simulation Tool</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <table border="1">
        <thead>
          <tr>
            <th>Rotate</th>
            <th>Pass</th>
            <th>H0</th>
            <th>B0</th>
            <th>H1</th>
            <th>B1</th>
            <th>Radius (r)</th>
            <th>Alpha_0</th>
            <th>Ratio B1 / H1</th>
            <th>Remove</th>
          </tr>
        </thead>
        <tbody>
          {passes.map((pass, index) => (
            <tr key={index}>
              <td>
                <input
                  type="checkbox"
                  checked={pass.rotated || false}
                  onChange={() => (index === 0 ? null : handleRotation(index))}
                  disabled={index === 0} // Disable rotate for the first pass
                />
              </td>
              <td>{pass.pass}</td>
              {["h0", "b0", "h1", "b1", "r"].map((col) => (
                <td key={col}>
                  {col === "b1" ? (
                    pass[col]
                  ) : (
                    <input
                      type="number"
                      value={pass[col]}
                      onChange={(e) =>
                        handleCellChange(
                          parseFloat(e.target.value) || "",
                          index,
                          col
                        )
                      }
                      min="0" // Ensures that the minimum value is 0
                      step="any" // Allows decimal input
                    />
                  )}
                </td>
              ))}
              <td>{pass.alpha0}</td>
              <td>{(parseFloat(pass.b1) / parseFloat(pass.h1)).toFixed(2)}</td>
              <td>
                <button
                  onClick={() => removePass(index)}
                  disabled={index === 0}>
                  -
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {passes.length < MAX_PASSES && (
        <button onClick={addPass} style={{ marginTop: "10px" }}>
          +
        </button>
      )}
    </div>
  );
}

export default App;
