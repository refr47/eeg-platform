# Schieflast

Das Thema Schieflast und Phasen-Symmetrie ist  relevant, da wir oft große einphasige Verbraucher (z. B. Waschmaschinen auf L1) und gleichzeitig einphasige PV-Einspeiser (z. B. Balkonkraftwerke oder kleine Wechselrichter auf L2) haben.Obwohl der AMIS-Zähler saldiert (also die Summe von L1+L2+L3 bildet), ist es für die Stabilität des Hausnetzes und die Hardware-Schonung sinnvoll, dies in der Logik zu berücksichtigen.1.

### Das Problem der Phasen-Lücke

* l1: Verbrauch 3000 W (E-Herd)
* L2: Einspeisung 3000 W (PV-Anlage)
* L3: 0 WZählerstand: 0 W (da saldiert wird).

In der Theorie ist alles perfekt. In der Praxis fließen aber hohe Ströme über den Neutralleiter. Wenn dein intelligentes System nun einen Speicher auf L3 aktivieren möchte, um ein Defizit in der EEG auszugleichen, muss es wissen, welche Kapazitäten auf welchen Phasen physikalisch verfügbar sind.2. Erweiterung der Abstraktionsschicht für PhasenUm das System "Phasen-bewusst" zu machen, erweitern wir das JSON-Status-Objekt des ESP32. Anstatt nur einen Gesamtwert (p_import_w) zu senden, schlüsseln wir dies auf:

JSON

"grid": {
  "p_total_w": 450.5,
  "phases": {
    "l1_w": 1200.0,  // Bezug auf Phase 1
    "l2_w": -800.0,  // Einspeisung auf Phase 2
    "l3_w": 50.5     // Minimaler Bezug auf Phase 3
  },
  "voltage_v": [231.2, 229.8, 230.5] // Optional: Netzqualität überwachen
}

Logik-Anpassung im Controller (Balancing)Der Controller kann nun eine Schieflast-Optimierung durchführen. Wenn die EEG insgesamt ein Defizit hat, priorisiert er das Entladen von Speichern, die auf den Phasen hängen, die gerade am stärksten belastet sind (z. B. L1 im obigen Beispiel).Der "Phase-Aware" Algorithmus:Berechne das EEG-Gesamt-Delta.Prüfe die Schieflast pro Mitglied.Sende Steuerbefehle bevorzugt an Geräte, die zur Symmetrierung beitragen.Wichtig: Die meisten modernen Hybrid-Wechselrichter (z. B. Fronius Gen24) regeln die Phasen-Symmetrie intern bereits sehr gut (Symmetrische Einspeisung). Unser System dient primär dazu, die logische Verteilung der Energie über die gesamte EEG zu steuern.4. Hardware-Einschränkung: Die Modbus-LatenzEin ESP32, der via IR-Kopf den AMIS-Zähler ausliest, erhält die Daten oft im Sekunden-Takt (oder bei Verschlüsselung alle 5 Sek.).Problem: Wenn die Steuerung zu langsam ist, hinkt sie der Realität hinterher.Lösung: Der ESP32 sollte lokale Autonomie haben. Er bekommt vom zentralen Controller ein "Budget" (z. B. "Du darfst bis zu 2000W für die Gemeinschaft einspeisen"). Die feingranulare Ausregelung von Lastspitzen (z. B. wenn der Herd taktet) macht der ESP32 lokal in Millisekunden, ohne auf die Cloud zu warten.Zusammenfassung der Architektur-EbenenEbeneAufgabeTaktungZentral-CloudStrategie, Fairness, Wetterprognose, EEG-Bilanz10 - 60 Sek.Edge (ESP32)Protokoll-Wandlung, Budget-Einhaltung, Sicherheit1 Sek.Lokal (WR/Speicher)Phasen-Ausgleich, Zellschutz, Sinus-GenerierungMillisekunden

# Realisierung

Die Realisierung der Schieflastanpassung findet technisch auf zwei Ebenen statt: der **physikalischen Ebene** (Hardware des Wechselrichters) und der **logischen Ebene** (dein EMS-Controller).

In Österreich ist wichtig zu verstehen: Der AMIS-Zähler ist ein  **saldirender Zähler** . Er bildet die Summe über alle drei Phasen (**$P_{Gesamt} = P_{L1} + P_{L2} + P_{L3}$**). Dem Netzbetreiber ist es für die Abrechnung egal, ob du auf L1 beziehst und auf L2 einspeist, solange die Summe Null ergibt. Dennoch gibt es technische Grenzen für die Schieflast (meist **4,6 kVA** Differenz zwischen den Phasen).

---

### 1. Physikalische Realisierung (Der Wechselrichter)

Moderne dreiphasige Hybrid-Wechselrichter (wie z. B. von Fronius, SMA oder Kostal) setzen die Schieflastanpassung heute meist durch **Symmetrische Einspeisung** um:

* **Arbeitsweise:** Der Wechselrichter misst über sein eigenes Smart Meter am Hausanschlusspunkt die Lasten auf L1, L2 und L3.
* **Ausgleich:** Wenn auf L1 ein 3 kW Herd läuft, speist der Wechselrichter nicht 3 kW nur auf L1 ein, sondern verteilt die Batterieleistung gleichmäßig (1 kW auf L1, 1 kW auf L2, 1 kW auf L3).
* **Ergebnis:** Am saldirenden Zähler steht physikalisch "Null", obwohl auf L1 noch 2 kW Bezug und auf L2/L3 jeweils 1 kW Einspeisung herrscht.

---

### 2. Logische Realisierung im Smart-EMS ( Controller)

Hier wird es für deine Spezifikation spannend. Wenn du eine EEG steuerst, die aus vielen einphasigen und dreiphasigen Speichern besteht, realisierst du die Anpassung über das  **"Phasen-Matching"** .

#### Der Algorithmus-Ablauf:

1. **Zustands-Scan:** Der Controller sieht im JSON-Status, welches Mitglied auf welcher Phase "drückt" (Einspeisung) oder "zieht" (Last).
2. **Vektorielles Delta:** Er berechnet nicht nur das Leistungs-Delta (**$W$**), sondern das Delta pro Phase (**$W_{L1}, W_{L2}, W_{L3}$**).
3. **Gezielte Aktivierung:**
   * Hast du in der EEG einphasige Batterien (z. B. Victron MultiPlus auf L1)?
   * Der Controller aktiviert bevorzugt den Speicher auf L1, wenn die EEG-Gesamtlast primär auf L1 liegt.
   * **Ziel:** Minimierung der Ausgleichsströme über den Neutralleiter im lokalen Ortsnetz-Transformator.

---

### Die praktische Umsetzung im Code (Edge-Device)

Damit der ESP32 die Schieflast regeln kann, nutzt er meist das **Modbus-Register 40087** (oder ähnlich, je nach SunSpec-Modell), um die Wirkleistungsvorgabe zu machen.

**Beispiel für die "Phasen-Korrektur" am ESP32:**

**C++**

```
// Pseudocode für den ESP32 zur Schieflast-Kompensation
void adjustPhaseLoad(float targetTotalPower) {
  // 1. Hole aktuelle Phasenlasten vom AMIS-Zähler
  float l1 = amis.getL1(); 
  float l2 = amis.getL2();
  float l3 = amis.getL3();

  // 2. Wenn der Wechselrichter einphasig ist (z.B. an L1)
  if (inverter.isSinglePhase() && inverter.getPhase() == 1) {
    // Regle nur so viel, dass L1 nicht über 4.6kW von den anderen abweicht
    float safePower = calculateSafeLimit(l1, l2, l3, targetTotalPower);
    inverter.writeModbus(REG_WATT_LIMIT, safePower);
  } else {
    // Dreiphasige WR regeln das meist intern autark (Symmetrie-Mode)
    inverter.writeModbus(REG_WATT_LIMIT, targetTotalPower);
  }
}
```

---
