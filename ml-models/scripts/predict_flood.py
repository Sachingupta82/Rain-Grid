from flask import Flask, request, jsonify
import joblib
import numpy as np

app = Flask(__name__)

# Load trained model
model = joblib.load("../flood_model.pkl")


@app.route("/predict", methods=["POST"])
def predict():

    data = request.json

    try:

        # -------------------------
        # INPUT FEATURES
        # -------------------------

        elevation = float(data.get("elevation", 0))
        slope = float(data.get("slope", 0.003))

        distance_to_drain = float(
            data.get("distance_to_drain", 50)
        )

        drain_density = float(
            data.get("drain_density", 2)
        )

        rainfall = float(
            data.get("rainfall", 120)
        )

        drain_blockage = float(
            data.get("drain_blockage", 0)
        )

        event_count = float(
            data.get("event_count", 0)
        )

        # -------------------------
        # DERIVED FEATURE
        # -------------------------

        water_accumulation = (
            rainfall * (1 - slope)
        ) / (drain_density + 0.5)

        # -------------------------
        # MODEL FEATURE VECTOR
        # (MUST MATCH TRAINING)
        # -------------------------

        features = np.array([
            [
                elevation,
                slope,
                distance_to_drain,
                drain_density,
                rainfall,
                drain_blockage,
                event_count,
                water_accumulation
            ]
        ], dtype=float)

        # -------------------------
        # PREDICTION
        # -------------------------

        prob = model.predict_proba(features)[0][1]

        risk_level = "LOW"

        if prob > 0.75:
            risk_level = "HIGH"
        elif prob > 0.45:
            risk_level = "MEDIUM"

        # -------------------------
        # RESPONSE
        # -------------------------

        return jsonify({

            "flood_probability": float(prob),

            "risk_level": risk_level,

            "derived_features": {
                "water_accumulation": round(
                    float(water_accumulation), 3
                )
            }

        })

    except Exception as e:

        print("Prediction error:", str(e))

        return jsonify({
            "error": str(e)
        }), 500


if __name__ == "__main__":
    app.run(port=8000)