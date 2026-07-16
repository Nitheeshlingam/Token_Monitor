import axios from "axios";

const API_KEY = process.env.EXCHANGE_RATE_API_KEY;

export const getUsdToInrRate = async () => {
  try {
    const response = await axios.get(
      `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/USD`
    );

    return response.data.conversion_rates.INR;

  } catch (err) {
    console.error("Exchange Rate Error:", err.message);

    throw new Error("Unable to fetch exchange rate");
  }
};