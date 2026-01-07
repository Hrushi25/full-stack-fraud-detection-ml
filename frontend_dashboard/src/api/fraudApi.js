export async function predictFraud(transaction) {
    const res = await fetch("http://127.0.0.1:8000/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(transaction),
    });
  
    if (!res.ok) {
      throw new Error("Prediction failed");
    }
  
    return res.json();
  }
  