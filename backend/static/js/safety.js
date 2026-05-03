/* ═══════════════════════════════════════════════════════════
   safety.js — Drug-Drug Interaction & Pharmacy Safety Engine
   ═══════════════════════════════════════════════════════════ */

window.Safety = {
  // Common clinical interactions
  INTERACTIONS: [
    { drugs: ['Aspirin', 'Warfarin'], level: 'Critical', msg: 'Increased risk of severe bleeding.' },
    { drugs: ['Amlodipine', 'Simvastatin'], level: 'Moderate', msg: 'Risk of muscle pain and damage (rhabdomyolysis).' },
    { drugs: ['Metformin', 'Contrast'], level: 'High', msg: 'Risk of lactic acidosis. Stop metformin 48hrs before scan.' },
    { drugs: ['Ibuprofen', 'Lisinopril'], level: 'Moderate', msg: 'Reduced kidney function and blood pressure control.' },
    { drugs: ['Sildenafil', 'Nitroglycerin'], level: 'Critical', msg: 'Severe, life-threatening drop in blood pressure.' },
    { drugs: ['Warfarin', 'Ciprofloxacin'], level: 'High', msg: 'Greatly increased blood thinning effect.' },
    { drugs: ['Digoxin', 'Furosemide'], level: 'Moderate', msg: 'Risk of digoxin toxicity due to potassium loss.' },
  ],

  /**
   * Checks for interactions in a list of drugs
   * @param {string[]} drugList 
   * @returns {object[]} Found interactions
   */
  checkConflicts(drugList) {
    const found = [];
    if (!drugList || drugList.length < 2) return found;

    // Standardize names
    const names = drugList.map(d => d.trim().toLowerCase());

    this.INTERACTIONS.forEach(inter => {
      const matchCount = inter.drugs.filter(d => 
        names.some(n => n.includes(d.toLowerCase()))
      ).length;

      if (matchCount >= 2) {
        found.push(inter);
      }
    });

    return found;
  }
};
