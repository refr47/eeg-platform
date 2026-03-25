
# EEG-Platform - Zielsetzung
Ziel ist die Entwicklung eines intelligenten Energiemanagementsystems, das den innerhalb einer (lokalen) EEG verfügbaren Strom nicht nur verwaltet, sondern aktiv und vorausschauend steuert. Die Steuerung soll weitgehend automatisiert erfolgen. Je höher der Eigenverbrauch innerhalb der EEG ist, desto effizienter arbeitet das Gesamtsystem.

## Voraussetzungen
Jedes Mitglied der EEG verfügt über folgende technische Ausstattung:

+ einen Smart Meter (AMIS-Zähler)
+ einen IR-Lesekopf (z. B. auf Basis eines ESP32) mit WLAN-Anbindung und Verbindung zu:
   + dem Internet
   + dem jeweiligen Wechselrichter
   + optional über Akkukapazitäten, die (ganz oder teilweise) der EEG zur Verfügung gestellt werden können

Systemarchitektur
Im Mittelpunkt steht ein zentraler Software-Controller, in dem sämtliche Verbrauchsdaten (Strombezug) und Einspeisedaten der Mitglieder zusammengeführt werden. Auf dieser Basis erfolgt eine laufende Analyse sowie die automatisierte Steuerung von Erzeugung, Verbrauch und Speicherung.

Betriebszustände und Logik

a) Einspeisung ≈ Bezug (nahezu ausgeglichen)
→ Optimalzustand: Der innerhalb der EEG erzeugte Strom wird nahezu vollständig direkt verbraucht.

b) Einspeisung > Bezug (Überschuss)
→ Priorität 1: Speicherung des Überschusses in den innerhalb der EEG verfügbaren Batteriespeichern, sofern Kapazität vorhanden ist.
→ Priorität 2: Einspeisung in das öffentliche Netz gemäß individuellem Einspeisevertrag des jeweiligen Mitglieds, falls keine Speicherkapazität mehr verfügbar ist.

c) Einspeisung < Bezug (Defizit)
→ Priorität 1: Nutzung der innerhalb der EEG verfügbaren Akkureserven (inkl. dynamischer, fairer Verteilung).
→ Priorität 2: Bezug aus dem öffentlichen Netz über den individuellen Energieliefervertrag des jeweiligen Mitglieds.

Datenbasis
Alle Mitglieder der EEG verfügen über digitale Stromzähler (AMIS-Reader), die als zentrale Datengrundlage für das Energiemanagementsystem dienen.

Wenn du willst, kann ich das als technisches Architekturkonzept (mit Datenflüssen, APIs, Regelalgorithmen) oder als Projektantrag/Fördertext weiter ausarbeiten.

ja

Super — ich baue dir das jetzt als technisches Architekturkonzept mit Datenflüssen, Komponenten und Regelalgorithmus aus.

Technisches Architekturkonzept – Intelligentes Energiemanagementsystem für EEG
1. Gesamtarchitektur

Das System besteht aus drei zentralen Ebenen:

1.1 Edge-Ebene (bei den Mitgliedern)

Komponenten vor Ort:

Smart Meter (AMIS-Zähler)
IR-Lesekopf (ESP32)
Wechselrichter-Anbindung
Optional: Batteriespeicher (inkl. Steuerung)

Funktion:

Echtzeit-Erfassung von:
Strombezug
Einspeisung
Vorverarbeitung der Daten (z. B. Aggregation, Glättung)
Übertragung an den zentralen Controller
Empfang von Steuerbefehlen (z. B. Laden/Entladen von Akkus)
1.2 Kommunikationsschicht
Protokolle: MQTT oder HTTPS (REST API)
Anforderungen:
geringe Latenz
hohe Ausfallsicherheit
sichere Kommunikation (TLS)
Optional: lokaler Fallback-Modus bei Internet-Ausfall
1.3 Zentrale Steuerung (SW-Controller)

Zentrale Instanz (Cloud oder lokaler Server):

Module:

Datenerfassung (Ingestion Layer)
Echtzeit-Datenbank
Prognosemodul (optional, z. B. PV-Ertrag / Last)
Optimierungs- und Regelalgorithmus
Verteilungslogik (Fairness / Priorisierung)
Schnittstelle zu Mitgliedern (API)
2. Datenflüsse
2.1 Upstream (vom Mitglied zum Controller)

Jedes Mitglied sendet zyklisch (z. B. alle 5–10 Sekunden):

Aktueller Verbrauch (W)
Aktuelle Einspeisung (W)
Batteriestatus:
Ladezustand (%)
verfügbare Kapazität (kWh)
Lade-/Entladeleistung
2.2 Downstream (Controller → Mitglied)

Der Controller sendet Steuerbefehle:

Batterie laden / entladen (Leistungsvorgabe)
ggf. Steuerung von Verbrauchern (zukünftig, z. B. Wärmepumpen)
3. Regelalgorithmus (Kernlogik)
3.1 Eingangswerte

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

Berechne:

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
4.2 Dynamische Optimierung

Zielgrößen:

Maximierung Eigenverbrauch
Minimierung Kosten
Netzstabilität
4.3 Fairness-Mechanismus

Mögliche Modelle:

proportional zur eingebrachten Energie
Bonus für bereitgestellte Speicher
zeitbasierte Rotation
5. Sicherheits- und Betriebsaspekte
Verschlüsselte Kommunikation (TLS)
Authentifizierung der Geräte
Ausfallsicherheit:
lokaler Fallback (z. B. „keep last state“)
Logging & Monitoring
Datenschutz (DSGVO-konform)
6. Technologievorschlag

Edge:

ESP32 (C++ / MicroPython)

Backend:

Node.js / Python (z. B. FastAPI)
MQTT Broker (z. B. Mosquitto)
Datenbank:
InfluxDB (Zeitreihen)
PostgreSQL (Stammdaten)

Frontend (optional):

Dashboard für Mitglieder:
Verbrauch
Einspeisung
Speicherstatus
7. Nächste sinnvolle Schritte
Definition der Schnittstellen (API / MQTT Topics)
Prototyp mit 2–3 Teilnehmern
Implementierung der Basisregelung (ohne Prognose)
Integration von Batteriespeichern
Erweiterung um Prognosemodelle

Wenn du möchtest, kann ich als nächsten Schritt:

dir konkrete MQTT-Topic-Strukturen definieren
oder den Regelalgorithmus als echten Code (Python/Node.js) schreiben
oder ein Systemdiagramm (visuell) erstellen

Was brauchst du als nächstes?

Get smarter responses, upload files and images, and more.
