import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.neural_network import MLPClassifier
from sklearn.metrics import accuracy_score
import joblib
import requests
import os

# Download heart disease dataset from UCI
url = 'https://archive.ics.uci.edu/ml/machine-learning-databases/heart-disease/processed.cleveland.data'
response = requests.get(url)
data_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'heart_disease.csv')
os.makedirs(os.path.dirname(data_path), exist_ok=True)
with open(data_path, 'wb') as f:
    f.write(response.content)

# Load dataset
column_names = ['age', 'sex', 'cp', 'trestbps', 'chol', 'fbs', 'restecg', 'thalach', 'exang', 'oldpeak', 'slope', 'ca', 'thal', 'target']
df = pd.read_csv(data_path, names=column_names, na_values='?')

# Preprocess
df = df.dropna()
df['target'] = df['target'].apply(lambda x: 1 if x > 0 else 0)  # Binary classification

# Features and target
X = df.drop('target', axis=1)
y = df['target']

# Split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train neural network model
model = MLPClassifier(hidden_layer_sizes=(64, 32), activation='relu', solver='adam', max_iter=1000, random_state=42)
model.fit(X_train, y_train)

# Evaluate
y_pred = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)
print(f'Heart Disease NN Model accuracy: {accuracy:.2f}')

# Save model
model_path = os.path.join(os.path.dirname(__file__), 'heart_disease_nn_model.pkl')
joblib.dump(model, model_path)
print(f'Heart Disease NN Model saved to {model_path}')