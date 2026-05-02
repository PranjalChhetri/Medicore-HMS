import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.neural_network import MLPClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
import joblib
import requests
import os

print("Training Diabetes Prediction Model...")

# Download diabetes dataset from UCI (Pima Indians Diabetes Database)
url = 'https://raw.githubusercontent.com/jbrownlee/Datasets/master/pima-indians-diabetes.data.csv'
data_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'diabetes.csv')
os.makedirs(os.path.dirname(data_path), exist_ok=True)

try:
    response = requests.get(url, timeout=10)
    with open(data_path, 'wb') as f:
        f.write(response.content)
    print(f"Downloaded diabetes dataset to {data_path}")
except Exception as e:
    print(f"Error downloading dataset: {e}")
    exit(1)

# Load dataset
column_names = ['pregnancies', 'glucose', 'blood_pressure', 'skin_thickness', 
                'insulin', 'bmi', 'diabetes_pedigree', 'age', 'target']
df = pd.read_csv(data_path, names=column_names, header=None)

# Preprocess: remove rows with 0 values in critical columns (these are missing values)
df = df[(df['glucose'] > 0) & (df['blood_pressure'] > 0) & (df['bmi'] > 0)]

# Features and target
X = df.drop('target', axis=1)
y = df['target']

# Standardize features (important for neural networks)
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# Split
X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42)

# Train neural network model
model = MLPClassifier(hidden_layer_sizes=(64, 32), activation='relu', solver='adam', 
                      max_iter=1000, random_state=42, early_stopping=True, validation_fraction=0.1)
model.fit(X_train, y_train)

# Evaluate
y_pred = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)
precision = precision_score(y_test, y_pred)
recall = recall_score(y_test, y_pred)
f1 = f1_score(y_test, y_pred)

print(f'Diabetes Model - Accuracy: {accuracy:.4f}, Precision: {precision:.4f}, Recall: {recall:.4f}, F1: {f1:.4f}')

# Save model and scaler
model_path = os.path.join(os.path.dirname(__file__), 'diabetes_nn_model.pkl')
scaler_path = os.path.join(os.path.dirname(__file__), 'diabetes_scaler.pkl')
joblib.dump(model, model_path)
joblib.dump(scaler, scaler_path)
print(f'Diabetes Model saved to {model_path}')
print(f'Diabetes Scaler saved to {scaler_path}')
