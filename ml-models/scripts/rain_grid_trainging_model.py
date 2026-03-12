import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, confusion_matrix
from xgboost import XGBClassifier

print("Loading datasets...")

catch = pd.read_csv("catchment_characteristics_indofloods.csv")
events = pd.read_csv("floodevents_indofloods.csv")
meta = pd.read_csv("metadata_indofloods.csv")
prec = pd.read_csv("precipitation_variables_indofloods.csv")

print("Datasets loaded.")

# Extract GaugeID
events["GaugeID"] = events["EventID"].str.extract(r"(INDOFLOODS-gauge-\d+)")
prec["GaugeID"] = prec["EventID"].str.extract(r"(INDOFLOODS-gauge-\d+)")

print("Merging datasets...")

df = events.merge(prec, on="EventID")

df["GaugeID"] = df["GaugeID_x"]

df = df.merge(catch, on="GaugeID", how="left")

df = df.merge(meta[["GaugeID","Latitude","Longitude"]], on="GaugeID", how="left")

print("Dataset merged successfully.")

# Create flood label
threshold = df["Peak Discharge Q (cumec)"].median()

df["label"] = (df["Peak Discharge Q (cumec)"] > threshold).astype(int)

print("Flood labels created.")

# Select features
features = [
"T1d","T2d","T3d","T4d","T5d",
"T6d","T7d","T8d","T9d","T10d",
"Drainage Area","Drainage Density","Catchment Relief"
]

X = df[features].fillna(0)
y = df["label"]

print("Splitting training and testing data...")

X_train,X_test,y_train,y_test = train_test_split(
    X,y,test_size=0.2,random_state=42
)

print("Training XGBoost model...")

model = XGBClassifier(
    n_estimators=200,
    max_depth=5,
    learning_rate=0.1
)

model.fit(X_train,y_train)

print("Model training complete.")

pred = model.predict(X_test)

accuracy = accuracy_score(y_test,pred)

cm = confusion_matrix(y_test,pred)

TN, FP, FN, TP = cm.ravel()

false_positive_rate = FP / (FP + TN)
false_negative_rate = FN / (FN + TP)

print("\n=============================")
print("MODEL PERFORMANCE RESULTS")
print("=============================")

print("Accuracy:", round(accuracy,4))
print("False Positive Rate:", round(false_positive_rate,4))
print("False Negative Rate:", round(false_negative_rate,4))

print("\nConfusion Matrix:")
print(cm)

print("\nDataset size:", len(df))
print("Training samples:", len(X_train))
print("Testing samples:", len(X_test))
