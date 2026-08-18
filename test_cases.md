# Test Cases for Northstar Homes AI Agent

## Test Case 1: Happy Path - English (High Intent & Booking)
**Scenario:** Customer interacts in English, provides requirements, agrees to a site visit, and successfully books it.
**Input 1:** "Hi, I am looking for a flat in Gurgaon."
**Agent:** "Hi! I'm Ria from Northstar Homes. We have Project Northstar One located in Sector 79, Gurugram. Are you looking for a 2 BHK or a 3 BHK?"
**Input 2:** "I need a 3 BHK. My budget is around 2 crores."
**Agent:** "That perfectly aligns with our offerings. Our 3 BHKs at Northstar One start from ₹1.75 crore onwards. Would you like to schedule a site visit to experience the project yourself?"
**Input 3:** "Tomorrow at 4 PM, number is 9876543210."
**Agent:** "SUCCESS: Site visit booked for tomorrow at 4 PM at Sector 79, Gurugram." (Tool result simulated). "Your site visit is confirmed for tomorrow at 4:00 PM at Northstar One, Sector 79. Our team will contact you shortly."
**Analytics Output:** 
```json
{
  "customer_name": null,
  "language_used": "English",
  "configuration_interest": "3 BHK",
  "budget_range": "2 crores",
  "interest_level": "High",
  "objections_raised": [],
  "site_visit_status": "Booked",
  "site_visit_datetime": "tomorrow at 4 PM",
  "follow_up_required": true,
  "follow_up_reason": "Follow up for scheduled site visit",
  "escalation_required": false,
  "opted_out": false,
  "conversation_summary": "Customer is highly interested in a 3 BHK with a 2 Cr budget and booked a site visit for tomorrow at 4 PM."
}
```

---

## Test Case 2: Language Switching & Hinglish
**Scenario:** Customer starts in Hindi, switches to Hinglish, and agent mirrors correctly.
**Input 1:** "Namaste, mujhe ek ghar kharidna hai."
**Agent:** "Namaste! Main Ria bol rahi hoon, Northstar Homes se. Aap Sector 79, Gurugram mein Project Northstar One ke liye 2 BHK dekh rahe hain ya 3 BHK?"
**Input 2:** "Project kahan par hai exactly?"
**Agent:** "Project Northstar One, Sector 79, Gurugram mein located hai. Aapka budget kis range mein hai?"

---

## Test Case 3: Handling Out-of-Scope Questions
**Scenario:** Customer asks about amenities or possession date which are NOT in the confirmed facts.
**Input 1:** "What are the amenities? Is there a swimming pool?"
**Agent:** "Main abhi exactly amenities confirm nahi kar sakti kyunki mere paas woh details nahi hain. Aap chahein toh main sales team ko bol sakti hoon aapse connect karne ke liye, ya hum site visit par saari details discuss kar sakte hain."
**Input 2:** "When is the possession date?"
**Agent:** "Possession date ki exactly confirmation mere paas abhi nahi hai. Kya main aapka number note kar loon taaki sales team aapko exactly bata sake?"

---

## Test Case 4: Opt-Out / Stop Communication
**Scenario:** Customer is annoyed and wants to opt out.
**Input 1:** "Stop messaging me, I am not interested."
**Agent:** "Main samajh sakti hoon. Main aapka number apne records se hata rahi hoon aur aage se aapko contact nahi kiya jayega. Thank you for your time."
**Analytics Output:**
```json
{
  "customer_name": null,
  "language_used": "English",
  "configuration_interest": null,
  "budget_range": null,
  "interest_level": "Opt-Out",
  "objections_raised": ["Not interested"],
  "site_visit_status": null,
  "site_visit_datetime": null,
  "follow_up_required": false,
  "follow_up_reason": null,
  "escalation_required": false,
  "opted_out": true,
  "conversation_summary": "Customer explicitly requested to stop communication and opted out."
}
```

---

## Test Case 5: Objection Handling - Price Too High
**Scenario:** Customer says the price is too high.
**Input 1:** "1.35 Cr is too expensive for a 2 BHK. I have a budget of 1 Cr."
**Agent:** "Main samajh sakti hoon ki budget ek important factor hai. Humara starting price 2 BHK ke liye ₹1.35 crore hai, par agar aap chahein toh main sales team se request kar sakti hoon ki wo aapke budget ke hisaab se koi option dekhein. Kya main unhe follow-up karne ko kahoon?"

---

## Test Case 6: Human Escalation & Failed Booking
**Scenario:** Booking a site visit on a Monday triggers a deterministic failure, simulating slot unavailability.
**Input 1:** "Let's book a visit for next Monday at 11 AM."
**Agent:** "FAILURE: The requested slot (Monday, 11 AM) is unavailable..." (Tool result simulated). "Mujhe khed hai par Monday 11 AM ka slot abhi available nahi hai. Kya aap kisi aur din aa sakte hain, ya main hamari sales team se request karun ki wo aapse connect karke ek suitable time fix kar lein?"
