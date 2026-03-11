# import pandas as pd
# import joblib
# from xgboost import XGBClassifier
# from sklearn.model_selection import train_test_split
# from sklearn.metrics import accuracy_score

# data = pd.read_csv("../training_dataset.csv")

# features = [
#     "elevation",
#     "slope",
#     "distance_to_drain",
#     "rainfall",
#     "drain_blockage",
#     "event_count"
# ]

# X = data[features]

# y = data["flood"]

# X_train, X_test, y_train, y_test = train_test_split(
#     X,
#     y,
#     test_size=0.2,
#     random_state=42
# )

# model = XGBClassifier(
#     n_estimators=300,
#     max_depth=6,
#     learning_rate=0.05,
#     subsample=0.8,
#     colsample_bytree=0.8
# )

# model.fit(X_train, y_train)

# pred = model.predict(X_test)

# accuracy = accuracy_score(y_test, pred)

# print("Model accuracy:", accuracy)

# joblib.dump(model, "../flood_model.pkl")

# print("Model saved")












import pandas as pd
import joblib

from xgboost import XGBClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
from sklearn.metrics import classification_report

print("Loading dataset...")

data = pd.read_csv("../training_dataset.csv")

features = [
    "elevation",
    "slope",
    "distance_to_drain",
    "drain_density",
    "rainfall",
    "drain_blockage",
    "event_count",
    "water_accumulation"
]

X = data[features]
y = data["flood"]

# -----------------------------
# TRAIN TEST SPLIT
# -----------------------------

X_train,X_test,y_train,y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)

# -----------------------------
# MODEL
# -----------------------------

model = XGBClassifier(

    n_estimators=600,
    max_depth=8,
    learning_rate=0.03,

    subsample=0.9,
    colsample_bytree=0.9,

    gamma=0.2,
    min_child_weight=3,

    scale_pos_weight=1.2,

    eval_metric="logloss"
)

print("Training model...")

model.fit(X_train,y_train)

# -----------------------------
# EVALUATION
# -----------------------------

pred = model.predict(X_test)

accuracy = accuracy_score(y_test,pred)

print("\nModel Accuracy:",accuracy)

print("\nClassification Report:")

print(classification_report(y_test,pred))

# -----------------------------
# SAVE MODEL
# -----------------------------

joblib.dump(model,"../flood_model.pkl")

print("\nModel saved successfully")