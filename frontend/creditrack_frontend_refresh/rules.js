const RULES = {
  "Sports & Games Participation": {
    activities: {
      "Sports": { type: "LEVEL", pointsByLevel: { I: 8, II: 15, III: 25, IV: 40, V: 60 }, max: 60, hasPrize: true },
      "Games":  { type: "LEVEL", pointsByLevel: { I: 8, II: 15, III: 25, IV: 40, V: 60 }, max: 60, hasPrize: true },
    },
    prizeBonus: {
      "First Prize":  { I: 10, II: 10, III: 10, IV: 20, V: 20 },
      "Second Prize": { I: 8,  II: 8,  III: 8,  IV: 16, V: 16 },
      "Third Prize":  { I: 5,  II: 5,  III: 5,  IV: 12, V: 12 },
    },
    winningCapEnhanceLevels: ["IV", "V"],
    winningEnhancedMax: 80,
  },

  "Cultural Activities Participation": {
    activities: {
      "Music":           { type: "LEVEL", pointsByLevel: { I: 8, II: 12, III: 20, IV: 40, V: 60 }, max: 60, hasPrize: true },
      "Performing arts": { type: "LEVEL", pointsByLevel: { I: 8, II: 12, III: 20, IV: 40, V: 60 }, max: 60, hasPrize: true },
      "Literary arts":   { type: "LEVEL", pointsByLevel: { I: 8, II: 12, III: 20, IV: 40, V: 60 }, max: 60, hasPrize: true },
    },
    prizeBonus: {
      "First Prize":  { I: 10, II: 10, III: 10, IV: 20, V: 20 },
      "Second Prize": { I: 8,  II: 8,  III: 8,  IV: 16, V: 16 },
      "Third Prize":  { I: 5,  II: 5,  III: 5,  IV: 12, V: 12 },
    },
    winningCapEnhanceLevels: ["IV", "V"],
    winningEnhancedMax: 80,
  },

  "Professional Self Initiatives": {
    activities: {
      "Tech Fest / Tech Quiz":                                                { type: "LEVEL", pointsByLevel: { I: 10, II: 20, III: 30, IV: 40, V: 50 }, max: 50 },
      "MOOC with final assessment certificate":                               { type: "FIXED", points: 50, max: 50 },
      "Competitions by Professional Societies (IEEE/IET/ASME/SAE/NASA etc.)": { type: "LEVEL", pointsByLevel: { I: 10, II: 15, III: 20, IV: 30, V: 40 }, max: 40 },
      "Full time Conference/Seminar/Exhibition/Workshop (IIT/NIT)":           { type: "FIXED", points: 20, max: 40 },
      "Paper presentation/publication (IIT/NIT)":                             { type: "FIXED", points: 30, max: 40 },
      "Poster presentation (IIT/NIT)":                                        { type: "FIXED", points: 20, max: 30 },
      "Industrial Training/Internship (>=5 full days)":                       { type: "FIXED", points: 20, max: 20 },
      "Industrial/Exhibition visits":                                          { type: "FIXED", points: 5,  max: 10 },
      "Foreign Language Skill (TOEFL/IELTS/BEC etc.)":                       { type: "FIXED", points: 50, max: 50 },
      "Workshop / Seminar Participation":                                      { type: "FIXED", points: 10, max: 20 },
    },
  },

  "Entrepreneurship and Innovation": {
    activities: {
      "Start-up Company (Registered legally)":                                    { type: "FIXED", points: 60, max: 60 },
      "Patent - Filed":                                                           { type: "FIXED", points: 30, max: 60 },
      "Patent - Published":                                                       { type: "FIXED", points: 35, max: 60 },
      "Patent - Approved":                                                        { type: "FIXED", points: 50, max: 60 },
      "Patent - Licensed":                                                        { type: "FIXED", points: 80, max: 80 },
      "Prototype developed and tested":                                           { type: "FIXED", points: 60, max: 60 },
      "Awards for products developed":                                            { type: "FIXED", points: 60, max: 60 },
      "Innovative technologies developed and used by industries/users":           { type: "FIXED", points: 60, max: 60 },
      "Venture capital funding for innovative ideas/products":                    { type: "FIXED", points: 80, max: 80 },
      "Startup Employment (Offering jobs >=2 persons >=15000/month)":            { type: "FIXED", points: 80, max: 80 },
      "Societal innovations":                                                     { type: "FIXED", points: 50, max: 50 },
    },
  },

  "Leadership & Management": {
    activities: {
      "Student Professional Societies (IEEE/IET/ASME/SAE/NASA etc.)": { type: "ROLE", pointsByRole: { "Core coordinator": 15, "Sub coordinator": 10, "Volunteer": 5 }, max: 40 },
      "College Association Chapters (Mech/Civil/EEE etc.)":           { type: "ROLE", pointsByRole: { "Core coordinator": 15, "Sub coordinator": 10, "Volunteer": 5 }, max: 40 },
      "Festival & Technical Events (College approved)":               { type: "ROLE", pointsByRole: { "Core coordinator": 15, "Sub coordinator": 10, "Volunteer": 5 }, max: 40 },
      "Hobby Clubs":                                                  { type: "ROLE", pointsByRole: { "Core coordinator": 15, "Sub coordinator": 10, "Volunteer": 5 }, max: 40 },
      "Special Initiatives (College & University approval mandatory)": { type: "ROLE", pointsByRole: { "Core coordinator": 15, "Sub coordinator": 10, "Volunteer": 5 }, max: 40 },
    },
  },

  "National Initiatives Participation": {
    activities: {
      "NCC":                 { type: "FIXED", points: 60, max: 60 },
      "NSS":                 { type: "FIXED", points: 60, max: 60 },
      "NSS Activities":      { type: "FIXED", points: 30, max: 30 },
      "Swachh Bharat":       { type: "FIXED", points: 30, max: 30 },
      "Blood Donation Camp": { type: "FIXED", points: 20, max: 20 },
    },
  },
};