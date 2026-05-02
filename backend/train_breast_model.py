import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.neural_network import MLPClassifier
from sklearn.metrics import accuracy_score
import joblib
import requests
import os

# Download breast cancer dataset from UCI
url = 'https://archive.ics.uci.edu/ml/machine-learning-databases/breast-cancer-wisconsin/breast-cancer-wisconsin.data'
response = requests.get(url)
data_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'breast_cancer.csv')
os.makedirs(os.path.dirname(data_path), exist_ok=True)
with open(data_path, 'wb') as f:
    f.write(response.content)

# Load dataset
column_names = ['id', 'clump_thickness', 'uniformity_cell_size', 'uniformity_cell_shape', 'marginal_adhesion', 'single_epithelial_cell_size', 'bare_nuclei', 'bland_chromatin', 'normal_nucleoli', 'mitoses', 'class']
df = pd.read_csv(data_path, names=column_names, na_values='?')

# Preprocess
df = df.dropna()
df['class'] = df['class'].apply(lambda x: 1 if x == 4 else 0)  # 2=benign, 4=malignant -> 0=benign, 1=malignant

# Features and target
X = df.drop(['id', 'class'], axis=1)
y = df['class']

# Split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train neural network model
model = MLPClassifier(hidden_layer_sizes=(64, 32), activation='relu', solver='adam', max_iter=1000, random_state=42)
model.fit(X_train, y_train)

# Evaluate
y_pred = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)
print(f'Breast Cancer NN Model accuracy: {accuracy:.2f}')

# Save model
model_path = os.path.join(os.path.dirname(__file__), 'breast_cancer_nn_model.pkl')
joblib.dump(model, model_path)
print(f'Breast Cancer NN Model saved to {model_path}')