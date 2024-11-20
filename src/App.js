import React, { useState } from "react";

function App() {
  const [numPasses, setNumPasses] = useState(null);
  const [tempPasses, setTempPasses] = useState("");
  const [r, setR] = useState("");
  const [passes, setPasses] = useState([]);
  const [currentPass, setCurrentPass] = useState(1);
  const [b0, setB0] = useState("");
  const [h0, setH0] = useState("");
  const [h1, setH1] = useState("");

  // Calculate A
  const calculateA = (h0, deltaH) => {
    return (
      (1 + 5 * Math.pow(0.35 - deltaH / h0, 2)) * Math.sqrt(h0 / deltaH - 1)
    );
  };

  // Calculate B
  const calculateB = (b0, h0) => {
    return (b0 / h0 - 1) * Math.pow(b0 / h0, 2 / 3);
  };

  // Calculate b1
  const calculateB1 = (b0, h0, h1, r) => {
    const deltaH = h0 - h1;

    const A = calculateA(h0, deltaH);
    const B = calculateB(b0, h0);

    const firstPart =
      1 / (1 - deltaH / h0 + (3 * A) / Math.pow(2 * ((0.5 * r) / h0), 3 / 4));

    const secondPart = b0 / h0 / (1 + 0.57 * B);

    const b1 = b0 + (h0 - h1) * firstPart * secondPart;

    return b1;
  };

  // Start simulation by setting the number of passes and roll radius
  const startSimulation = (e) => {
    e.preventDefault();
    setNumPasses(parseInt(tempPasses, 10)); // Set number of passes
    setTempPasses(""); // Clear temporary input
  };

  // Handle each pass submission
  const handlePassSubmit = (e) => {
    e.preventDefault();

    const b0Num = parseFloat(b0);
    const h0Num = parseFloat(h0);
    const h1Num = parseFloat(h1);
    const rNum = parseFloat(r);

    const b1 = calculateB1(b0Num, h0Num, h1Num, rNum);

    // Add pass result to the table
    const newPass = {
      pass: currentPass,
      h0: h0Num,
      b0: b0Num,
      h1: h1Num,
      b1: b1.toFixed(2),
    };
    setPasses([...passes, newPass]);

    // Prepare for the next pass
    setB0(b1.toFixed(2)); // New B0 is the B1 from this pass
    setH0(h1Num); // New H0 is the H1 from this pass
    setH1(""); // Clear input for next H1
    setCurrentPass((prev) => prev + 1);
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
            <label>
              Roll Radius (r):
              <input
                required
                className="number"
                type="number"
                step="any"
                min={0}
                placeholder="Enter roll radius"
                value={r}
                onChange={(e) => setR(e.target.value)}
              />
            </label>
            <br />
            <button type="submit">Start Simulation</button>
          </form>
        ) : currentPass <= numPasses ? (
          <form className="inputs" onSubmit={handlePassSubmit}>
            <h1>Pass Schedule Simulation Tool</h1>
            <label>
              Initial Height (H0):
              <input
                required
                className="number"
                type="number"
                step="any"
                min={0}
                placeholder="Enter H0"
                value={h0}
                onChange={(e) => setH0(e.target.value)}
                disabled={currentPass > 1 || currentPass > numPasses} // Disable after first pass or simulation ends
              />
            </label>
            <br />
            <label>
              Initial Width (B0):
              <input
                required
                className="number"
                type="number"
                step="any"
                min={0}
                placeholder="Enter B0"
                value={b0}
                onChange={(e) => setB0(e.target.value)}
                disabled={currentPass > 1 || currentPass > numPasses} // Disable after first pass or simulation ends
              />
            </label>
            <br />
            <label>
              Resulted Height (H1):
              <input
                required
                className="number"
                type="number"
                step="any"
                min={0}
                placeholder="Enter H1"
                value={h1}
                onChange={(e) => setH1(e.target.value)}
                disabled={currentPass > numPasses} // Disable when simulation ends
              />
            </label>
            <br />
            <button type="submit" disabled={currentPass > numPasses}>
              {currentPass > numPasses
                ? "Simulation Complete"
                : `Submit Pass ${currentPass}`}
            </button>
          </form>
        ) : (
          <form className="inputs">
            <h1>Pass Schedule Simulation Tool</h1>
            <label>
              Initial Height (H0):
              <input className="number" type="number" value={h0} disabled />
            </label>
            <br />
            <label>
              Initial Width (B0):
              <input className="number" type="number" value={b0} disabled />
            </label>
            <br />
            <button type="button" disabled>
              Simulation Complete
            </button>
          </form>
        )}

        {passes.length > 0 && (
          <div className="table">
            <h1>Pass Results</h1>
            <table border="1">
              <thead>
                <tr>
                  <th>H0</th>
                  <th>B0</th>
                  <th>H1</th>
                  <th>B1</th>
                </tr>
              </thead>
              <tbody>
                {passes.map((pass) => (
                  <tr key={pass.pass}>
                    <td>{pass.h0}</td>
                    <td>{pass.b0}</td>
                    <td>{pass.h1}</td>
                    <td>{pass.b1}</td>
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
