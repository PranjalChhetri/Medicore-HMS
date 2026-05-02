#!/usr/bin/env python
"""
train_all_models.py — Train all disease prediction models at once
Trains: Heart Disease, Breast Cancer, Diabetes, Kidney Disease, Liver Disease
"""

import subprocess
import sys
import os

def run_script(script_name):
    """Run a training script and report status"""
    print(f"\n{'='*70}")
    print(f"Training {script_name}...")
    print(f"{'='*70}\n")
    
    script_path = os.path.join(os.path.dirname(__file__), script_name)
    
    try:
        result = subprocess.run([sys.executable, script_path], check=True)
        print(f"\n✅ {script_name} completed successfully!\n")
        return True
    except subprocess.CalledProcessError as e:
        print(f"\n❌ {script_name} failed with error code {e.returncode}\n")
        return False
    except Exception as e:
        print(f"\n❌ {script_name} failed: {e}\n")
        return False

if __name__ == '__main__':
    print("\n" + "="*70)
    print("MediCore HMS - All Disease Model Training Pipeline")
    print("="*70)
    
    scripts = [
        'train_model.py',                # Heart Disease
        'train_breast_model.py',         # Breast Cancer
        'train_diabetes_model.py',       # Diabetes
        'train_kidney_disease_model.py', # Kidney Disease
        'train_liver_disease_model.py',  # Liver Disease
    ]
    
    results = {}
    for script in scripts:
        results[script] = run_script(script)
    
    # Summary
    print("\n" + "="*70)
    print("TRAINING SUMMARY")
    print("="*70)
    
    successful = sum(1 for v in results.values() if v)
    total = len(results)
    
    for script, success in results.items():
        status = "✅ SUCCESS" if success else "❌ FAILED"
        print(f"{status}: {script}")
    
    print(f"\nTotal: {successful}/{total} models trained successfully")
    
    if successful == total:
        print("\n🎉 All models trained successfully! Ready for predictions.")
    else:
        print(f"\n⚠️ {total - successful} model(s) failed. Check the logs above.")
    
    print("="*70 + "\n")
