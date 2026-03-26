
## 🎯 Zielsetzung

Entwicklung eines vorausschauenden Steuerungssystems für Lokale Energiegemeinschaften (EEG). Das System optimiert den Eigenverbrauch innerhalb der Gemeinschaft durch automatisierte Analyse und aktive Steuerung von Erzeugung, Verbrauch und Speicherung. **Effizienzsteigerung durch maximale interne Nutzung von lokal erzeugtem Strom ist die Kernmetrik.**

---

## 🏗 Systemarchitektur

Das System basiert auf einer dreistufigen Architektur, um Skalierbarkeit und Ausfallsicherheit zu gewährleisten.

### 1. Edge-Ebene (Hardware vor Ort)

Jedes Mitglied ist mit einer standardisierten Hardware-Einheit ausgestattet:

* **Smart Meter:** AMIS-Zähler zur präzisen Datenerfassung.
* **Edge-Gateway:** [ESP32-basierter IR-Lesekopf](https://www.mitterbaur.at/amis-leser.html)

  mit WLAN.
* **Schnittstellen:** Anbindung an Wechselrichter und Batteriespeicher via  **Modbus (TCP/RTU)** .

### 2. Kommunikationsschicht

Um die Instabilität von Modbus über Weitverkehrsnetze (WAN) zu vermeiden, agiert das Edge-Gateway als  **Protokoll-Umsetzer** :

* **Protokoll:** MQTT über TLS (sicher, bidirektional, geringe Latenz).
* **Abstraktion:** Lokale Modbus-Register werden in standardisierte **JSON-Objekte** übersetzt.
* **Resilienz:** Automatischer **Lokal-Fallback** (Eigenverbrauchs-Modus), falls die Verbindung zum zentralen Controller für >60 Sekunden unterbrochen wird.

### 3. Zentraler Software-Controller (VServer)

Die "Intelligenz" des Systems, bestehend aus:

* **Ingestion Layer:**  Datenerfassung via MQTT Broker (Mosquitto).
* **Storage Virtualization Layer:** Abstraktion physischer Speicher in ein  *Standardized Storage Object* .
* **Regelalgorithmus:** Echtzeit-Optimierung basierend auf der globalen EEG-Bilanz.

---

## 🔋 Storage Virtualization & Fairness

Da heterogene Speichersysteme (verschiedene Hersteller/Wechselrichter) zum Einsatz kommen, interagiert der Controller mit einem abstrakten Profil:

| **Parameter**            | **Bedeutung**                                        |
| ------------------------------ | ---------------------------------------------------------- |
| `SoC (%)`                    | Aktueller Füllstand.                                      |
| `Available Capacity (kWh)`   | Nutzbare Nettokapazität (abzgl. Reserven).                |
| `P_Max_Charge/Discharge (W)` | Dynamische Leistungslimits (z.B. temperaturbedingt).       |
| `Owner Policy (%)`           | Definierte Privat-Reserve des Mitglieds.                   |
| `SoH (%)`                    | "State of Health" zur Berücksichtigung der Zell-Alterung. |

### Fairness- & Wear-Leveling-Logik

Um die Akzeptanz bei Mitgliedern zu erhöhen, die private Speicher bereitstellen:

* **Zyklen-Ausgleich:** Priorisierte Nutzung von Speichern mit geringster bisheriger Belastung (analog zu Wear-Leveling bei SSDs).
* **Incentive-Modell:** Virtuelle Vergütung oder Tarifvorteile für bereitgestellte Kapazität.
* **Slew Rate Management:** Sanfte Rampen bei Leistungsänderungen zur Vermeidung von Schwingungen im Netz.

---

## 📊 Datenmodelle (Beispiele)

### Status-Telegramm (Edge → Controller)

Zyklische Übermittlung der lokalen Netzknoten-Daten.

**JSON**

```
{
  "device_id": "EEG_MEMBER_0815",
  "timestamp": "2026-03-25T16:05:00Z",
  "grid": {
    "p_import_w": 450.5,
    "p_export_w": 0.0
  },
  "storage": {
    "state": "charging",
    "soc_pct": 65.2,
    "p_current_w": 1200,
    "soh_pct": 98.5
  },
  "pv_production_w": 1800.0
}
```

### Steuer-Telegramm (Controller → Edge)

Aktive Vorgabe durch den Optimierungs-Algorithmus.

**JSON**

```
{
  "target_device": "EEG_MEMBER_0815",
  "action": "set_storage_mode",
  "params": {
    "mode": "remote_control",
    "setpoint_w": -1500, // Entladen mit 1.5kW zur Stützung der EEG
    "timeout_sec": 30
  }
}
```

---

## 🛠 Tech-Stack

* **Edge:** C++  auf ESP32 (Erweiterung eines bestehenden Projeks)
* **Backend:** Node.js (Runtime), Mosquitto (MQTT Broker).
* **Persistence:
  *** **InfluxDB:** Time-Series Daten für Metriken und Analysen.
* * **MongoDB:** Stammdatenverwaltung und Konfigurationen.
* **Frontend:** Vue.js Dashboard zur Visualisierung für Mitglieder.
