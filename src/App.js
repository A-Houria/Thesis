import React, { useState } from "react";

function App() {
  const [result, setResult] = useState("");
  const [b0, setB0] = useState("");
  const [h0, setH0] = useState("");
  const [h1, setH1] = useState("");

  const r = 950;

  // Calc A
  const calculateA = (h0, deltaH) => {
    return (
      (1 + 5 * Math.pow(0.35 - deltaH / h0, 2)) * Math.sqrt(h0 / deltaH - 1)
    );
  };
  // Calc B
  const calculateB = (b0, h0) => {
    return (b0 / h0 - 1) * Math.pow(b0 / h0, 2 / 3);
  };

  // Calc b1
  const calculateB1 = (b0, h0, h1) => {
    const deltaH = h0 - h1;

    const A = calculateA(h0, deltaH);

    const B = calculateB(b0, h0);

    const firstPart = 1 / (1 - deltaH / h0 + (3 * A) / Math.pow(r / h0, 3 / 4));

    const secondPart = b0 / h0 / (1 + 0.57 * B);

    const b1 = b0 + (h0 - h1) * firstPart * secondPart;

    return b1;
  };

  const onSubmit = (e) => {
    e.preventDefault();

    // Ensure all inputs are numbers
    const b0Num = parseFloat(b0);
    const h0Num = parseFloat(h0);
    const h1Num = parseFloat(h1);

    // Calculate b1
    const b1 = calculateB1(b0Num, h0Num, h1Num);

    // Round the result to 2 decimal places
    setResult(b1.toFixed(2));
  };

  return (
    <div className="app">
      <div className="cont">
        <h1>Pass Schedule Simulation Tool</h1>
        <form className="inputs" onSubmit={onSubmit}>
          <input
            required
            className="number"
            type="number"
            step="any"
            min={0}
            placeholder="Input: H0"
            value={h0}
            onChange={(e) => setH0(e.target.value)}
          />
          <input
            required
            className="number"
            type="number"
            step="any"
            min={0}
            placeholder="Input: B0"
            value={b0}
            onChange={(e) => setB0(e.target.value)}
          />
          <input
            required
            className="number"
            type="number"
            step="any"
            min={0}
            placeholder="Input: H1"
            value={h1}
            onChange={(e) => setH1(e.target.value)}
          />
          <p>Result B1: {result}</p>
          <input className="btn" type="submit" value="Submit" />
        </form>
      </div>
    </div>
  );
}

export default App;
