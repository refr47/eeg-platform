// Alle 5-10 Sekunden ausgeführt
async function runEEGOptimizationLoop() {
    // 1. Daten sammeln (aus der InfluxDB oder dem aktuellen State-Store)
    const members = await getAllActiveMembers(); 
    
    let totalProduction = 0;
    let totalConsumption = 0;
    let availableStorageCapacity = 0; // Gesamt-Lade-Potential (W)
    let availableStorageDischarge = 0; // Gesamt-Entlade-Potential (W)

    // 2. Status-Aggregation
    members.forEach(m => {
        totalProduction += m.last_status.pv_production_w;
        totalConsumption += (m.last_status.grid.p_import_w + m.last_status.pv_production_w);
        
        // Potential berechnen unter Berücksichtigung der User-Policy
        if (m.last_status.storage.soc_pct < 95) {
            availableStorageCapacity += m.last_status.storage.p_max_charge_w;
        }
        if (m.last_status.storage.soc_pct > m.last_status.storage.capacity_eeg_share_pct) {
            availableStorageDischarge += m.last_status.storage.p_max_discharge_w;
        }
    });

    const netDelta = totalProduction - totalConsumption;

    // 3. Entscheidungs-Logik
    if (netDelta > 500) { // Schwellenwert gegen "Flattern" (Deadband)
        // FALL: ÜBERSCHUSS -> Speicher füllen
        distributeSurplus(members, netDelta);
    } else if (netDelta < -500) {
        // FALL: DEFIZIT -> Speicher leeren
        distributeDeficit(members, Math.abs(netDelta));
    } else {
        // FALL: BALANCE -> Nichts tun (Effizienz-Zone)
        keepIdle(members);
    }
}

function distributeSurplus(members, amount) {
    // Einfache Logik: Proportional zum freien Platz (SoC) verteilen
    members.sort((a, b) => a.last_status.storage.soc_pct - b.last_status.storage.soc_pct);
    
    for (let member of members) {
        let chargePower = calculateFairShare(member, amount);
        sendMqttCommand(member.id, { action: "set_storage_mode", params: { setpoint_w: chargePower } });
    }
}

1. Das "Deadband" (Toter Bereich)
Wie im Code angedeutet (> 500W), reagiert das System nicht auf kleinste Schwankungen (z.B. wenn jemand kurz den Wasserkocher einschaltet). Das schont die Relais und Batterien der Mitglieder.

2. Priorisierung (Fairness-Modelle)
Innerhalb der Funktion distributeSurplus kannst du verschiedene Strategien fahren:

Linear: Jeder bekommt den gleichen Anteil am Überschuss.

SoC-Basiert: Die leersten Batterien werden zuerst geladen (maximale Aufnahmebereitschaft).

Verschleiß-Optimiert: Batterien mit hohem SoH (State of Health) werden stärker belastet als alte Batterien.

3. Die "Safety-First" Regel (Watchdog)
Da wir über das Internet steuern, ist die timeout_sec im JSON-Befehl (siehe oben) kritisch. Der ESP32 muss lokal wissen: "Wenn mein Chef (das Backend) seit 30 Sekunden nicht geantwortet hat, schalte ich auf lokalen Modus um, damit meine Hausbatterie nicht leergesaugt wird, nur weil das WLAN weg ist."

Architektur-Übersicht der Datenverarbeitung
Nächste Schritte zur Verfeinerung:
Ein kritischer Punkt bei EEGs in Österreich (AMIS-Zähler) ist die Phasen-Saldirung. Die Zähler saldieren zwar über alle drei Phasen, aber manche Wechselrichter können nur auf einer Phase einspeisen.