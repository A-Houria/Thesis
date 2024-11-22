import React, { useState } from "react";

function App() {
  const [numPasses, setNumPasses] = useState(null);
  const [tempPasses, setTempPasses] = useState("");
  const [passes, setPasses] = useState([]);
  const [error, setError] = useState("");

  // B1 calculation
  const calculateB1 = (b0, h0, h1, r) => {
    const deltaH = h0 - h1;

    const A =
      (1 + 5 * Math.pow(0.35 - deltaH / h0, 2)) * Math.sqrt(h0 / deltaH - 1);
    const B = (b0 / h0 - 1) * Math.pow(b0 / h0, 2 / 3);

    const firstPart =
      1 / (1 - deltaH / h0 + (3 * A) / Math.pow(2 * ((0.5 * r) / h0), 3 / 4));

    const secondPart = b0 / h0 / (1 + 0.57 * B);

    const b1 = b0 + (h0 - h1) * firstPart * secondPart;

    return b1.toFixed(2);
  };

  // Alpha_0 calculation
  const calculateAlpha0 = (h0, h1, r) => {
    if (!h0 || !h1 || !r || h0 <= h1 || r <= 0) return "";
    const alpha0 = Math.acos(1 - (h0 - h1) / r) * (180 / Math.PI);
    return alpha0.toFixed(2);
  };

  // start simulation function handling
  const startSimulation = (e) => {
    e.preventDefault();
    const initialPasses = Array.from(
      { length: parseInt(tempPasses, 10) },
      (_, i) => ({
        pass: i + 1,
        h0: "",
        b0: "",
        h1: "",
        b1: "",
        r: "",
        alpha0: "",
        rotated: false,
      })
    );
    setPasses(initialPasses);
    setNumPasses(parseInt(tempPasses, 10));
    setTempPasses("");
  };

  // function for table cells change handling
  const handleCellChange = (value, rowIndex, columnName) => {
    const updatedPasses = [...passes];
    const currentRow = updatedPasses[rowIndex];
    const prevRow = updatedPasses[rowIndex - 1] || null;

    if (columnName === "h0" && rowIndex > 0 && value > prevRow.h1) {
      setError(`H0 cannot be greater than the previous pass's H1`);
      return;
    }

    if (columnName === "h1" && value > currentRow.h0) {
      setError(`H1 cannot be greater than H0`);
      return;
    }

    setError("");

    currentRow[columnName] = value;

    //  dependent values recalculation after every previous value change
    const { h0, h1, b0, r } = currentRow;
    if (h0 && h1 && b0 && r && h0 > h1) {
      currentRow.b1 = calculateB1(
        parseFloat(b0),
        parseFloat(h0),
        parseFloat(h1),
        parseFloat(r)
      );
      currentRow.alpha0 = calculateAlpha0(
        parseFloat(h0),
        parseFloat(h1),
        parseFloat(r)
      );
    } else {
      currentRow.b1 = "";
      currentRow.alpha0 = "";
    }

    // Propagation for changes to next passes
    for (let i = rowIndex + 1; i < updatedPasses.length; i++) {
      const prev = updatedPasses[i - 1];
      const curr = updatedPasses[i];
      if (prev.h1 && prev.b1) {
        curr.h0 = prev.h1;
        curr.b0 = prev.b1;
        curr.r = prev.r;
      }
    }
    setPasses(updatedPasses);
  };

  // function for handling rotation radio button clicks
  const handleRotation = (rowIndex) => {
    const updatedPasses = [...passes];
    updatedPasses.forEach((pass, i) => {
      if (i === rowIndex) {
        const rotated = !pass.rotated;
        if (rotated) {
          [pass.h0, pass.b0] = [pass.b0, pass.h0];
          [pass.h1, pass.b1] = [pass.b1, pass.h1];
        } else {
          [pass.h0, pass.b0] = [pass.b0, pass.h0];
          [pass.h1, pass.b1] = [pass.b1, pass.h1];
        }
        pass.rotated = rotated;
      }
      if (i > rowIndex) {
        const prev = updatedPasses[i - 1];
        pass.h0 = prev.h1;
        pass.b0 = prev.b1;
      }
    });
    setPasses(updatedPasses);
  };

  return (
    <div className="app">
      <div className="cont">
        {!numPasses ? (
          <form className="inputs" onSubmit={startSimulation}>
            <h1>Pass Schedule Simulation Tool</h1>
            <label>
              Number of Passes:
              <input
                required
                className="number"
                type="number"
                min={1}
                placeholder="Enter number of passes"
                value={tempPasses}
                onChange={(e) => setTempPasses(e.target.value)}
              />
            </label>
            <br />
            <button type="submit">Start Simulation</button>
          </form>
        ) : (
          <div className="table">
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
                </tr>
              </thead>
              <tbody>
                {passes.map((pass, index) => (
                  <tr key={index}>
                    <td>
                      <input
                        type="checkbox"
                        checked={pass.rotated || false}
                        onChange={() => handleRotation(index)}
                      />
                    </td>
                    <td>{pass.pass}</td>
                    {["h0", "b0", "h1", "b1", "r"].map((column) => (
                      <td key={column}>
                        {column === "b1" ? (
                          pass[column]
                        ) : (
                          <input
                            type="number"
                            value={pass[column]}
                            onChange={(e) =>
                              handleCellChange(
                                parseFloat(e.target.value) || "",
                                index,
                                column
                              )
                            }
                          />
                        )}
                      </td>
                    ))}
                    <td>{pass.alpha0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
