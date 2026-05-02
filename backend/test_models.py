#!/usr/bin/env python
"""
Test script to verify all disease prediction models are loaded and working
"""

import sys
import os

# Add backend to path
sys.path.insert(0, os.path.dirname(__file__))

from api.ml_engine import disease_risk

def test_disease_predictions():
    """Test predictions for all 5 diseases"""
    
    print("\n" + "="*70)
    print("Testing Multi-Disease Prediction System")
    print("="*70)
    
    # Test data for each disease
    test_cases = [
        {
            'disease': 'heart',
            'name': 'Heart Disease',
            'data': {
                'age': 55,
                'gender': 'male',
                'cp': 2,
                'trestbps': 140,
                'chol': 250,
                'fbs': 0,
                'restecg': 0,
                'thalach': 120,
                'exang': 1,
                'oldpeak': 1.5,
                'slope': 1,
                'ca': 1,
                'thal': 2,
            }
        },
        {
            'disease': 'breast',
            'name': 'Breast Cancer',
            'data': {
                'clump_thickness': 6,
                'uniformity_cell_size': 3,
                'uniformity_cell_shape': 3,
                'marginal_adhesion': 2,
                'single_epithelial_cell_size': 3,
                'bare_nuclei': 2,
                'bland_chromatin': 3,
                'normal_nucleoli': 2,
                'mitoses': 1,
            }
        },
        {
            'disease': 'diabetes',
            'name': 'Diabetes',
            'data': {
                'pregnancies': 3,
                'glucose': 140,
                'blood_pressure': 75,
                'skin_thickness': 25,
                'insulin': 120,
                'bmi': 28.5,
                'diabetes_pedigree': 0.6,
                'age': 42,
            }
        },
        {
            'disease': 'kidney',
            'name': 'Kidney Disease',
            'data': {
                'age': 65,
                'blood_pressure_systolic': 145,
                'blood_pressure_diastolic': 95,
                'glucose': 130,
                'blood_urea_nitrogen': 35,
                'serum_creatinine': 2.1,
                'sodium': 135,
                'potassium': 5.2,
            }
        },
        {
            'disease': 'liver',
            'name': 'Liver Disease',
            'data': {
                'age': 50,
                'total_bilirubin': 1.5,
                'direct_bilirubin': 0.8,
                'alkaline_phosphatase': 120,
                'alamine_aminotransferase': 80,
                'aspartate_aminotransferase': 75,
                'total_protiens': 6.2,
                'albumin': 3.0,
            }
        }
    ]
    
    results = []
    for test_case in test_cases:
        disease = test_case['disease']
        name = test_case['name']
        data = test_case['data']
        
        try:
            prediction = disease_risk(data, disease)
            results.append({
                'disease': name,
                'success': True,
                'result': prediction
            })
            
            print(f"\n✅ {name} Model")
            print(f"   Risk Score: {prediction['risk_score']}")
            print(f"   Risk Label: {prediction['risk_label']}")
            print(f"   Probability: {prediction['probability']}")
            
        except Exception as e:
            results.append({
                'disease': name,
                'success': False,
                'error': str(e)
            })
            print(f"\n❌ {name} Model")
            print(f"   Error: {e}")
    
    # Summary
    print("\n" + "="*70)
    print("TEST SUMMARY")
    print("="*70)
    
    successful = sum(1 for r in results if r['success'])
    total = len(results)
    
    for r in results:
        status = "✅ PASS" if r['success'] else "❌ FAIL"
        print(f"{status}: {r['disease']}")
        if not r['success']:
            print(f"   Error: {r['error']}")
    
    print(f"\n{successful}/{total} models loaded successfully\n")
    
    if successful == total:
        print("🎉 All disease prediction models are working correctly!")
        return 0
    else:
        print(f"⚠️ {total - successful} model(s) failed to load.")
        return 1

if __name__ == '__main__':
    exit(test_disease_predictions())
