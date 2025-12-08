import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix
import joblib   # 🔥 IMPORTANT

# 1. Load ML-ready dataset
df = pd.read_csv("sault_2020_2024_ml_ready.csv")

# 2. Select features and target
feature_cols = [
    "Mean Temp (°C)",
    "Max Temp (°C)",
    "Min Temp (°C)",
    "Total Precip (mm)",
    "Spd of Max Gust (km/h)",
]

X = df[feature_cols]
y = df["WillRainTomorrow"]

# 3. Train/test split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, shuffle=True
)

# 4. Train model
model = RandomForestClassifier(n_estimators=200, random_state=42)
model.fit(X_train, y_train)

# 5. Evaluate
y_pred = model.predict(X_test)
print("Confusion Matrix:\n", confusion_matrix(y_test, y_pred))
print("\nClassification Report:\n", classification_report(y_test, y_pred))

# 6. Save model
joblib.dump(model, "sault_rain_model.pkl")
print("✅ Model saved as sault_rain_model.pkl")
