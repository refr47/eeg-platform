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

## Datenflüsse

### Upstream (vom Mitglied zum Controller)

Jedes Mitglied sendet zyklisch (z. B. alle 5–10 Sekunden):

Aktueller Verbrauch (W)
Aktuelle Einspeisung (W)
Batteriestatus:
Ladezustand (%)
verfügbare Kapazität (kWh)
Lade-/Entladeleistung

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

Lokal:

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


Verschlüsselte Kommunikation (TLS)
Authentifizierung der Geräte
Ausfallsicherheit:
Logging & Monitoring
Datenschutz (DSGVO-konform)

## Technologievorschlag

**Edge**:

ESP32 (C++ / MicroPython)

***Backend***:

Node.js
MQTT Broker (z. B. Mosquitto)

***Datenbank***:

Mongo

**Frontend (optional):**

Dashboard für Mitglieder:
Verbrauch
Einspeisung
Speicherstatus
