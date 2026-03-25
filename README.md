# EEG-Platform - Zielsetzung

Ziel ist die Entwicklung eines intelligenten Energiemanagementsystems, das den innerhalb einer (lokalen) EEG verfügbaren Strom nicht nur verwaltet, sondern aktiv und vorausschauend steuert. Die Steuerung soll weitgehend automatisiert erfolgen. Je höher der Eigenverbrauch innerhalb der EEG ist, desto effizienter arbeitet das Gesamtsystem.

## Voraussetzungen

Jedes Mitglied der EEG verfügt über folgende technische Ausstattung:

+ einen Smart Meter (AMIS-Zähler)
+ einen IR-Lesekopf ([auf Basis eines ESP32 (mitterbaur)](https://www.mitterbaur.at/amis-leser.html)) mit WLAN-Anbindung und Verbindung zu:
  + dem Internet
  + dem jeweiligen Wechselrichter
  + optional über Akkukapazitäten, die (ganz oder teilweise) der EEG zur Verfügung gestellt werden können

## Systemarchitektur

Im Mittelpunkt steht ein zentraler Software-Controller, in dem sämtliche Verbrauchsdaten (Strombezug) und Einspeisedaten der Mitglieder zusammengeführt werden. Auf dieser Basis erfolgt eine laufende Analyse sowie die automatisierte Steuerung von Erzeugung, Verbrauch und Speicherung.

*Betriebszustände und Logik*

a) Einspeisung ≈ Bezug (nahezu ausgeglichen)
→ Optimalzustand: Der innerhalb der EEG erzeugte Strom wird nahezu vollständig direkt verbraucht.

b) Einspeisung > Bezug (Überschuss)
→ Priorität 1: Speicherung des Überschusses in den innerhalb der EEG verfügbaren Batteriespeichern, sofern Kapazität vorhanden ist.
→ Priorität 2: Einspeisung in das öffentliche Netz gemäß individuellem Einspeisevertrag des jeweiligen Mitglieds, falls keine Speicherkapazität mehr verfügbar ist.

c) Einspeisung < Bezug (Defizit)
→ Priorität 1: Nutzung der innerhalb der EEG verfügbaren Akkureserven (inkl. dynamischer, fairer Verteilung).
→ Priorität 2: Bezug aus dem öffentlichen Netz über den individuellen Energieliefervertrag des jeweiligen Mitglieds.

## Besonderheit:

Mitglieder können physische Akkus haben, die auch für den Betrieb in der EEG vorgesehen sind (oder ein Teil); schwierig sind in diesem Fall die unterschiedlichen Systeme / Wechselrichter, da über diese der AKKUzustand, das Einspeisen und der Bezug zu steuern sind. Als Protokoll bietet sich hier Modbus an, da dies das Protokoll im Energieversorgungsbereich ist.

# Technisches Architekturkonzept – Intelligentes Energiemanagementsystem für EE

## Gesamtarchitektur

Das System besteht aus drei zentralen Ebenen:

### Edge-Ebene (bei den Mitgliedern)

Komponenten vor Ort:

Smart Meter (AMIS-Zähler)
IR-Lesekopf (ESP32)
Wechselrichter-Anbindung
Optional: Batteriespeicher (inkl. Steuerung)

*Funktion:*

**Echtzeit-Erfassung von:**

Strombezug
Einspeisung
Vorverarbeitung der Daten (z. B. Aggregation, Glättung)
Übertragung an den zentralen Controller
Empfang von Steuerbefehlen (z. B. Laden/Entladen von Akkus)

**Kommunikationsschicht**

Protokolle: MQTT oder HTTPS (REST API)
Anforderungen:
geringe Latenz
hohe Ausfallsicherheit
sichere Kommunikation (TLS)
Optional: lokaler Fallback-Modus bei Internet-Ausfall

### Zentrale Steuerung (SW-Controller)

 Zentrale Instanz (Cloud/VServer):

Module:

Datenerfassung (Ingestion Layer)
Echtzeit-Datenbank
Prognosemodul (optional, z. B. PV-Ertrag / Last)
Optimierungs- und Regelalgorithmus
Verteilungslogik (Fairness / Priorisierung)
Schnittstelle zu Mitgliedern (API)

## Die Virtuelle Speicher-Abstraktionsschicht (Storage Virtualization Layer)

Anstatt dass der Controller direkt "mit einer Batterie" spricht, interagiert er mit einem  **Standardized Storage Object** .

**Das Konzept:**

Jeder physische Speicher meldet sich am System an und "mapped" seine herstellerspezifischen Register (via Modbus/TCP oder SunSpec) auf ein einheitliches Profil.

| **Parameter (abstrakt)** | **Bedeutung für den Controller**                                      |
| ------------------------------ | ---------------------------------------------------------------------------- |
| `State of Charge (SoC)`      | Aktueller Füllstand in %                                                    |
| `Available Capacity`         | Netto-Kapazität in kWh (unter Berücksichtigung von Entladetiefe/Reserve)   |
| `Max Charge/Discharge Power` | Aktuelles Limit (W) – wichtig, da Batterien bei 90% SoC oft langsamer laden |
| `Health Status (SoH)`        | Zustand der Batterie (wichtig für die Fairness/Abnutzungs-Logik)            |
| `Owner Policy`               | "Privat-Reserve": Wie viel % darf die EEG maximal nutzen?                    |

## Fairness & Degradation"

Wenn Mitglieder ihre privaten Akkus der EEG zur Verfügung stellen, verschleißen diese schneller (Ladezyklen). Dein System braucht hierfür einen Anreiz- oder Ausgleichsmechanismus:

* **Wear-Leveling:** Der Controller priorisiert beim Entladen Speicher, die bisher am wenigsten Zyklen geleistet haben (ähnlich wie bei SSDs).
* **Virtuelle Vergütung:** Wer Speicher bereitstellt, bekommt im internen Verrechnungsmodell der EEG einen besseren Tarif oder Vorrang beim Bezug von günstigem Überschussstrom.

## Modbus

Hier gibt es eine technische Falle: Modbus RTU (seriell) ist auf der Edge-Ebene super, aber über das Internet (WAN) ist es eventuell instabil und unsicher (==> Feasability soll dies klären!!)

* **Lösung:** Der ESP32 agiert als  **Modbus-Gateway** . Er liest lokal die Register aus (Modbus TCP oder RTU) und übersetzt diese in  **JSON-Objekte** , die per **MQTT** an den Controller gesendet werden.
* **Vorteil:** MQTT ist bidirektional, zustandsorientiert ("Last Will") und durch TLS einfach abzusichern. Der Controller sendet nur ein `{"cmd": "discharge", "power": 1500}`, und der ESP32 setzt dies lokal in den passenden Modbus-Schreibbefehl für den spezifischen Wechselrichter um.

## Datenflüsse

### Upstream (vom Mitglied zum Controller)

Jedes Mitglied sendet zyklisch (z. B. alle 5–10 Sekunden):

Aktueller Verbrauch (W)
Aktuelle Einspeisung (W)
Batteriestatus:
Ladezustand (%)
verfügbare Kapazität (kWh)
Lade-/Entladeleistung

**Beispiel**:

. Status-Telegramm (Edge → Controller)
Dieses Paket sendet der ESP32 zyklisch (z.B. alle 5 Sek.). Es kapselt alle relevanten Informationen in ein einheitliches Format.

{
  "device_id": "EEG_MEMBER_0815",
  "timestamp": "2026-03-25T16:05:00Z",
  "grid": {
    "p_import_w": 450.5,      // Aktueller Bezug vom Netz (Watt)
    "p_export_w": 0.0         // Aktuelle Einspeisung ins Netz (Watt)
  },
  "storage": {
    "type": "li-ion",
    "state": "charging",      // charging, discharging, idle, full, empty
    "soc_pct": 65.2,          // State of Charge in %
    "capacity_total_kwh": 10.0,
    "capacity_eeg_share_pct": 80, // Wie viel % der Kapazität darf die EEG nutzen?
    "p_max_charge_w": 3000,   // Aktuelles Ladelimit (chemisch/technisch)
    "p_max_discharge_w": 3000,
    "p_current_w": 1200,      // + für Laden, - für Entladen
    "soh_pct": 98.5           // State of Health (Verschleißprüfung)
  },
  "pv_production_w": 1800.0   // Aktuelle Erzeugung vor Ort
}```


### Downstream (Controller → Mitglied)

Der Controller sendet Steuerbefehle:

Batterie laden / entladen (Leistungsvorgabe)
ggf. Steuerung von Verbrauchern (zukünftig, z. B. Wärmepumpen)

### Regelalgorithmus (Kernlogik)

#### Eingangswerte

Global:

Gesamt-Einspeisung EEG
Gesamt-Verbrauch EEG
Gesamte verfügbare Speicherkapazität

### Steuer-Telegramm (Controller → Edge)

Der Controller berechnet die Lastverteilung in der EEG und sendet spezifische Anweisungen zurück.

**JSON**

```
{
  "target_device": "EEG_MEMBER_0815",
  "command_id": "CMD_99281",
  "action": "set_storage_mode",
  "params": {
    "mode": "remote_control", // Schaltet den WR in den externen Steuermodus
    "setpoint_w": -1500,      // Zielwert: 1500W entladen zur Stützung der EEG
    "priority": "high",       // Falls lokale Lasten Vorrang haben sollen
    "timeout_sec": 30         // Sicherheits-Fallback: Wenn 30s kein neuer Befehl kommt, geh in Lokal-Modus
  }
}
```

**Lokal**:

individuelle Batteriestände
individuelle Vertragsparameter
3.2 Entscheidungslogik
Fall A: Balance (± Toleranzbereich)
|Einspeisung - Verbrauch| < Schwelle
→ Keine Aktion erforderlich
Fall B: Überschuss (Einspeisung > Verbrauch)

#### Berechne:

Überschuss = Einspeisung - Verbrauch
Verteile auf Speicher:
Priorisierung:
freie Kapazität
technische Limits
Fairness (z. B. rotierend oder proportional)
Falls Speicher voll:
→ Einspeisung ins Netz
Fall C: Defizit (Einspeisung < Verbrauch)

Berechne:

Defizit = Verbrauch - Einspeisung
Entlade Speicher:
gleichmäßige oder optimierte Verteilung
Berücksichtigung:
Mindestladezustand
Eigentümerregeln
Falls nicht ausreichend:
→ Netzbezug
4. Erweiterte Intelligenz (optional, aber sehr sinnvoll)
4.1 Prognosen
PV-Erzeugung (Wetterdaten)
Verbrauchsmuster (Machine Learning)

→ ermöglicht:

vorausschauendes Laden/Entladen
Vermeidung unnötiger Netzbezüge

## Dynamische Optimierung

**Zielgrößen**:

Maximierung Eigenverbrauch
Minimierung Kosten
Netzstabilität

####Fairness-Mechanismus

Mögliche Modelle:

proportional zur eingebrachten Energie
Bonus für bereitgestellte Speicher
zeitbasierte Rotation

## Sicherheits- und Betriebsaspekte

+ Verschlüsselte Kommunikation (TLS)
+ Authentifizierung der Geräte
+ Ausfallsicherheit:
+ Logging & Monitoring
+ **+ Latenz-Management:** In einer EEG kann es zu Schwingungen kommen, wenn alle Speicher gleichzeitig auf eine Wolke reagieren. Die Abstraktionsschicht sollte eine **"Slew Rate"** (Rampe) für Leistungsänderungen vorgeben.

* **Blackout-Resilienz:** Was passiert, wenn die Cloud weg ist? Der ESP32 sollte eine Logik besitzen: "Wenn 60 Sekunden kein Befehl vom Controller kommt -> Fallback auf lokalen Eigenverbrauch-Modus (Prio: Hausversorgung)".
* **Phasen-Symmetrie:** Falls die EEG dreiphasig bilanziert wird, sollte der Controller (sofern die Hardware es kann) auch Schieflasten ausgleichen können.

## Technologievorschlag

**Edge**:

ESP32 (C++ / MicroPython)

***Backend***:

+ Node.js
+ MQTT Broker (z. B. Mosquitto)

***Datenbank***:

+ InfluxDB (MqTT)
+ Mongo (Restlichen Daten)

**Frontend (optional):**

+ Dashboard für Mitglieder:
+ Verbrauch
+ Einspeisung
+ Speicherstatus
