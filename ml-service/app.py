from flask import Flask, request, jsonify
import joblib
import numpy as np

app = Flask(__name__)

# Load the trained model
# Make sure sault_rain_model.pkl is in the same folder where you run app.py
model = joblib.load("sault_rain_model.pkl")


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


@app.route("/predict_rain", methods=["POST"])
def predict_rain():
    """
    Flexible input parser.

    It will accept EITHER:
      {
        "mean_temp": float,
        "max_temp": float,
        "min_temp": float,
        "total_precip": float,
        "max_gust_speed": float
      }

    OR the payload your front-end currently sends:
      {
        "temp_mean": float,
        "temp_max": float,
        "temp_min": float,
        "wind_speed": float
      }

    Missing precipitation / gust values are defaulted to 0.0.
    """
    data = request.get_json(silent=True) or {}

    try:
        # 1) Temperature features: accept both naming styles
        mean_temp = float(
            data.get("mean_temp", data.get("temp_mean"))
        )
        max_temp = float(
            data.get("max_temp", data.get("temp_max", mean_temp))
        )
        min_temp = float(
            data.get("min_temp", data.get("temp_min", mean_temp))
        )

        # 2) Precipitation – if not provided, default to 0.0
        total_precip = float(
            data.get("total_precip", data.get("precip", data.get("rain", 0.0)))
        )

        # 3) Wind / gust – accept max_gust_speed or wind_speed, default 0.0
        max_gust_speed = float(
            data.get("max_gust_speed", data.get("wind_speed", data.get("gust", 0.0)))
        )

        values = [mean_temp, max_temp, min_temp, total_precip, max_gust_speed]

    except (TypeError, ValueError) as e:
        return jsonify({
            "error": f"Bad input: {e}",
            "received": data
        }), 400

    # Convert to numpy array and predict
    X = np.array([values], dtype=float)
    proba = model.predict_proba(X)[0][1]  # probability of rain (class 1)
    pred = int(proba >= 0.5)

    return jsonify({
        "will_rain_tomorrow": pred,
        "probability": float(proba),
    })


if __name__ == "__main__":
    # Listen on all interfaces so Node (same machine) can call it
    app.run(host="0.0.0.0", port=5000)
