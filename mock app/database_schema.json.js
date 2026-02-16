{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "ABA_Medical_Necessity_Assessment",
  "type": "object",
  "required": ["client_age", "primary_diagnosis", "fii_score"],
  "properties": {
    "client_age": { "type": "integer", "minimum": 0, "maximum": 21 },
    "primary_diagnosis": { 
      "type": "string", 
      "enum": ["ASD_Level_1", "ASD_Level_2", "ASD_Level_3", "Unspecified"] 
    },
    "fii_score": { "type": "integer", "minimum": 0, "maximum": 36 },
    "adaptive_functioning": {
      "type": "object",
      "properties": {
        "vineland_composite": { "type": "integer", "minimum": 20, "maximum": 160 },
        "vb_mapp_milestones": { "type": "integer", "minimum": 0, "maximum": 170 },
        "vb_mapp_barriers": { "type": "integer", "minimum": 0, "maximum": 100 }
      }
    },
    "behavioral_risk": {
      "type": "object",
      "properties": {
        "aggression_frequency": { "type": "integer" },
        "self_injury_severity": { "type": "string", "enum": ["none", "mild", "moderate", "severe"] },
        "elopement_risk": { "type": "boolean" }
      }
    },
    "claim_metadata": {
      "type": "object",
      "properties": {
        "insurance_payer_id": { "type": "string" },
        "actual_outcome": { "type": "string", "enum": ["pending", "approved", "denied", "partial"] },
        "denial_reason_tags": { "type": "array", "items": { "type": "string" } }
      }
    }
  }
}