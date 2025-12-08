import pandas as pd
from pathlib import Path

BASE_DIR = Path(__file__).parent
DATA_DIR = BASE_DIR / "data"

files = [
    DATA_DIR / "sault_2020.csv",
    DATA_DIR / "sault_2021.csv",
    DATA_DIR / "sault_2022.csv",
    DATA_DIR / "sault_2023.csv",
    DATA_DIR / "sault_2024.csv",
]

dfs = [pd.read_csv(f) for f in files]
df = pd.concat(dfs, ignore_index=True)

# Some files use "Date/Time" as column name
df = df.rename(columns={"Date/Time": "Date"})

cols_to_keep = [
    "Date",
    "Mean Temp (°C)",
    "Max Temp (°C)",
    "Min Temp (°C)",
    "Total Precip (mm)",
    "Spd of Max Gust (km/h)",
]

df = df[cols_to_keep].copy()

# Parse date
df["Date"] = pd.to_datetime(df["Date"], errors="coerce")

num_cols = [
    "Mean Temp (°C)",
    "Max Temp (°C)",
    "Min Temp (°C)",
    "Total Precip (mm)",
    "Spd of Max Gust (km/h)",
]

for col in num_cols:
    df[col] = pd.to_numeric(df[col], errors="coerce")

df = df.sort_values("Date").reset_index(drop=True)

# Fill missing values
df[num_cols] = df[num_cols].fillna(method="ffill").fillna(method="bfill")

# Label: will it rain tomorrow?
df["TotalPrecipTomorrow"] = df["Total Precip (mm)"].shift(-1)
df["WillRainTomorrow"] = (df["TotalPrecipTomorrow"] > 0).astype(int)

df = df.dropna(subset=["TotalPrecipTomorrow"]).reset_index(drop=True)

df.to_csv("sault_2020_2024_ml_ready.csv", index=False)
print("Saved sault_2020_2024_ml_ready.csv")
