/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  X, 
  Search, 
  MapPin, 
  Truck, 
  Compass, 
  Calendar, 
  ShieldCheck, 
  ThermometerSnowflake, 
  Droplet, 
  Scale, 
  Sparkles, 
  Clock, 
  PackageCheck 
} from "lucide-react";
import ThreeDTshirt from "./ThreeDTshirt";

interface TrackingPortalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TrackingUpdate {
  time: string;
  date: string;
  location: string;
  status: string;
  description: string;
  completed: boolean;
}

interface TrackingData {
  id: string;
  statusText: string;
  estimatedDelivery: string;
  origin: string;
  destination: string;
  weight: string;
  temp: string;
  humidity: string;
  integrity: string;
  progressPercent: number;
  updates: TrackingUpdate[];
  items?: any[];
  timestamp?: number;
}

const SAMPLE_TRACKING_DATA: { [key: string]: TrackingData } = {
  "LX-7489-IN": {
    id: "LX-7489-IN",
    statusText: "PRIORITY EN-ROUTE VIA DHL AIR EXPRESS",
    estimatedDelivery: "JULY 22, 2026",
    origin: "LUXEVRA ATELIER (MUMBAI)",
    destination: "NEW DELHI RESIDENCE",
    weight: "1.45 KG",
    temp: "21.6°C",
    humidity: "42% RH",
    integrity: "SEALED & ENCRYPTED",
    progressPercent: 75,
    updates: [
      {
        time: "14:32",
        date: "JULY 18, 2026",
        location: "MUMBAI AIRPORT HUB",
        status: "DEPARTED PORT OF EMIGRATION",
        description: "Passed outbound customs inspection. Scheduled on flight LX-402 Priority Cargo.",
        completed: true
      },
      {
        time: "10:15",
        date: "JULY 18, 2026",
        location: "ATELIER DESPATCH PORT",
        status: "HANDED OVER TO DHL PRIORITY COURIER",
        description: "Registered into DHL international logistics chain. Signature required upon delivery.",
        completed: true
      },
      {
        time: "18:45",
        date: "JULY 17, 2026",
        location: "LUXEVRA MUMBAI LAB",
        status: "SOPHISTICATED SECURE PACKAGING COMPLETED",
        description: "Garment hand-finished, placed in rigid slide-out box with active environmental sensors.",
        completed: true
      },
      {
        time: "11:20",
        date: "JULY 17, 2026",
        location: "LUXEVRA MUMBAI LAB",
        status: "ATELIER CERTIFICATE OF AUTHENTICITY ISSUED",
        description: "Inspected by lead couturier. Unique serial tag #792-LV-2026 generated and secured.",
        completed: true
      }
    ]
  },
  "LX-2094-AT": {
    id: "LX-2094-AT",
    statusText: "ATELIER PACKAGING & QUALITY CALIBRATION",
    estimatedDelivery: "JULY 25, 2026",
    origin: "LUXEVRA ATELIER (MUMBAI)",
    destination: "BENGALURU EXECUTIVE SUITE",
    weight: "0.85 KG",
    temp: "20.2°C",
    humidity: "38% RH",
    integrity: "PRE-TRANSIT SCAN COMPLETE",
    progressPercent: 35,
    updates: [
      {
        time: "09:12",
        date: "JULY 18, 2026",
        location: "LUXEVRA MUMBAI LAB",
        status: "DOUBLE-FACED RIGID BOX ASSEMBLY",
        description: "Garment is nested into specialized tissue layout, sprayed with signature atelier fragrance.",
        completed: true
      },
      {
        time: "16:30",
        date: "JULY 17, 2026",
        location: "LUXEVRA MUMBAI LAB",
        status: "COUTURIER REFINING & SEAM INSPECTION",
        description: "Precision double-needle check. Perfect score awarded on garment structure diagnostics.",
        completed: true
      },
      {
        time: "14:00",
        date: "JULY 17, 2026",
        location: "LUXEVRA DATABASE",
        status: "ORDER COMMITTED & INITIALIZED",
        description: "Garment allocation complete. Handover queued to packaging specialists.",
        completed: true
      }
    ]
  },
  "LX-8893-DL": {
    id: "LX-8893-DL",
    statusText: "HAND-DELIVERED & SECURE SIGNATURE CAPTURED",
    estimatedDelivery: "DELIVERED TODAY",
    origin: "LUXEVRA ATELIER (MUMBAI)",
    destination: "MUMBAI PENTHOUSE RESIDENCE",
    weight: "2.10 KG",
    temp: "23.1°C",
    humidity: "40% RH",
    integrity: "SEALS BROKEN (SUCCESSFULLY OPENED)",
    progressPercent: 100,
    updates: [
      {
        time: "09:45",
        date: "JULY 18, 2026",
        location: "MUMBAI RESIDENCE",
        status: "DELIVERED WITH PRIVATE SIGNATURE",
        description: "Secure handover successfully completed. Signed by recipient 'U.S.'",
        completed: true
      },
      {
        time: "08:00",
        date: "JULY 18, 2026",
        location: "DHL LOCAL EXPRESS HUB",
        status: "OUT FOR LUXURY COURIER COLD-CHAIN DISPATCH",
        description: "Assigned to elite local courier. Packaged inside climate-controlled vehicle compartment.",
        completed: true
      },
      {
        time: "19:15",
        date: "JULY 17, 2026",
        location: "DHL TRANSIT CENTRAL",
        status: "ARRIVED AT HUB FOR LOCAL SORTING",
        description: "Unloaded and registered. Verified temperature logs are well within acceptable parameters.",
        completed: true
      }
    ]
  }
};

function getDynamicOrderTracking(order: any, nowTimestamp: number): TrackingData {
  const elapsed = Math.max(0, nowTimestamp - order.timestamp);
  const elapsedSeconds = Math.floor(elapsed / 1000);

  const allPotentialUpdates = [
    {
      triggerSeconds: 0,
      timeOffset: 0,
      status: "ORDER SECURELY LOGGED & FILED",
      location: "LUXEVRA SECURE DATABASE",
      description: `Payment protocol verified. Bespoke transaction ledger entry registered for Order ID ${order.id}.`
    },
    {
      triggerSeconds: 15,
      timeOffset: 15,
      status: "ATELIER COUTURIER ASSIGNED",
      location: "LUXEVRA MUMBAI LAB",
      description: `Lead couturier commissioned for final fabrication audits. Material diagnostics commenced.`
    },
    {
      triggerSeconds: 45,
      timeOffset: 45,
      status: "FIBER INTEGRITY SCAN COMPLETED",
      location: "QUALITY CALIBRATION DEPT",
      description: "Micro-dye inspection and weave continuity scored at 100%. Thread tension metrics verified."
    },
    {
      triggerSeconds: 90,
      timeOffset: 90,
      status: "FRAGRANCE INFUSION & SILK LINING",
      location: "ATELIER PACKAGING PORT",
      description: "Garment carefully wrapped in double-faced rigid tissue, infused with Lvxevra's signature cedar-wood essence."
    },
    {
      triggerSeconds: 150,
      timeOffset: 150,
      status: "ACTIVE ENVIRONMENTAL CHIP SEALED",
      location: "LUXEVRA DISPATCH CHAMBER",
      description: "Placed into rigid slide-out casing. GPS telemetry receiver and climate sensor chip successfully locked and initialized."
    },
    {
      triggerSeconds: 240,
      timeOffset: 240,
      status: "HANDED OVER TO DHL COURIER SERVICE",
      location: "ATELIER DESPATCH PORT",
      description: "Secure transit handover completed. Outbound logistics tracking registered inside global air network."
    },
    {
      triggerSeconds: 360,
      timeOffset: 360,
      status: "MUMBAI AIRPORT HUB ARRIVAL",
      location: "PORT OF EMIGRATION",
      description: "Passed high-priority customs screening. Handed over to DHL Express Flight LX-402 priority manifest."
    }
  ];

  const triggered = allPotentialUpdates.filter(u => elapsedSeconds >= u.triggerSeconds);
  
  const updates = triggered.map(u => {
    const updateTime = new Date(order.timestamp + u.timeOffset * 1000);
    return {
      time: updateTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }),
      date: updateTime.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }).toUpperCase(),
      location: u.location,
      status: u.status,
      description: u.description,
      completed: true
    };
  });

  updates.reverse();

  if (updates.length === 0) {
    const updateTime = new Date(order.timestamp);
    updates.push({
      time: updateTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }),
      date: updateTime.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }).toUpperCase(),
      location: "LUXEVRA SECURE DATABASE",
      status: "ORDER SECURELY LOGGED & FILED",
      description: `Payment protocol verified. Bespoke transaction ledger entry registered for Order ID ${order.id}.`,
      completed: true
    });
  }

  let progressPercent = 10;
  if (elapsedSeconds >= 360) progressPercent = 95;
  else if (elapsedSeconds >= 240) progressPercent = 85;
  else if (elapsedSeconds >= 150) progressPercent = 70;
  else if (elapsedSeconds >= 90) progressPercent = 55;
  else if (elapsedSeconds >= 45) progressPercent = 40;
  else if (elapsedSeconds >= 15) progressPercent = 25;

  let statusText = "ORDER REGISTERED & CALIBRATING WITH ATELIER QUEUE";
  if (elapsedSeconds >= 360) statusText = "DEPARTED PORT OF EMIGRATION VIA DHL AIR PRIORITY";
  else if (elapsedSeconds >= 240) statusText = "TRANSIT HANDOVER COMPLETED - DHL EXPEDITED BAY";
  else if (elapsedSeconds >= 150) statusText = "RFID ENVIRONMENTAL MONITORING CHIP ACTIVE";
  else if (elapsedSeconds >= 90) statusText = "HAND-FINISHED BOX PACKAGING UNDERWAY";
  else if (elapsedSeconds >= 45) statusText = "ARTISAN FINISHING & REFINING TESTS COMMENCED";
  else if (elapsedSeconds >= 15) statusText = "COUTURIER TEAM COMMISSIONED FOR FABRIC CHECKS";

  const targetDeliveryDate = new Date(order.timestamp + 4 * 24 * 60 * 60 * 1000);
  const estimatedDelivery = targetDeliveryDate.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  }).toUpperCase();

  return {
    id: order.id,
    statusText,
    estimatedDelivery,
    origin: "LUXEVRA ATELIER (MUMBAI)",
    destination: order.address ? `${order.address.city.toUpperCase()} RESIDENCE` : "SECURE DESTINATION",
    weight: order.weight || "1.20 KG",
    temp: "21.6°C",
    humidity: "42% RH",
    integrity: "SEALED & SECURITY PROTECTED",
    progressPercent,
    updates,
    items: order.items || [],
    timestamp: order.timestamp
  };
}

export default function TrackingPortal({ isOpen, onClose }: TrackingPortalProps) {
  const [trackingId, setTrackingId] = useState("");
  const [activeTracking, setActiveTracking] = useState<TrackingData | null>(null);
  const [error, setError] = useState(false);

  // Real-time telemetry & log states
  const [now, setNow] = useState<number>(Date.now());
  const [realtimeTemp, setRealtimeTemp] = useState<number>(21.6);
  const [realtimeHumidity, setRealtimeHumidity] = useState<number>(42);
  const [cryptoToken, setCryptoToken] = useState<string>("SEALED-74A9");
  const [secondsToScan, setSecondsToScan] = useState<number>(15);
  const [countdownText, setCountdownText] = useState<string>("");
  const [logLines, setLogLines] = useState<string[]>([
    "INITIALIZING COUTURE DISPATCH TELEMETRY CHANNEL...",
    "WAITING FOR ATELIER PROTOCOL SIGN-IN"
  ]);

  if (!isOpen) return null;

  // Initialize and synchronize states when active tracking changes
  useEffect(() => {
    if (activeTracking) {
      setRealtimeTemp(parseFloat(activeTracking.temp) || 21.6);
      setRealtimeHumidity(parseFloat(activeTracking.humidity) || 42);
      setCryptoToken(activeTracking.integrity.split(" ")[0] || "SEALED-74A9");
      setSecondsToScan(15);
    }
  }, [activeTracking]);

  // Update countdown clock every second
  useEffect(() => {
    if (!activeTracking || !isOpen) return;

    const interval = setInterval(() => {
      const currentNow = Date.now();
      setNow(currentNow);

      let targetTime = 0;
      if (activeTracking.id === "LX-7489-IN") {
        targetTime = new Date("2026-07-22T18:00:00").getTime();
      } else if (activeTracking.id === "LX-2094-AT") {
        targetTime = new Date("2026-07-25T18:00:00").getTime();
      } else if (activeTracking.id === "LX-8893-DL") {
        setCountdownText("DELIVERED & VERIFIED");
        return;
      } else if (activeTracking.timestamp) {
        targetTime = activeTracking.timestamp + 4 * 24 * 60 * 60 * 1000;
      } else {
        targetTime = Date.now() + 3 * 24 * 60 * 60 * 1000;
      }

      const diff = targetTime - currentNow;
      if (diff <= 0) {
        setCountdownText("DELIVERED & VERIFIED");
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        setCountdownText(
          `${days}D : ${hours.toString().padStart(2, '0')}H : ${minutes.toString().padStart(2, '0')}M : ${seconds.toString().padStart(2, '0')}S`
        );
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTracking, isOpen]);

  // Fluctuate telemetry values and update live logs
  useEffect(() => {
    if (!activeTracking || !isOpen || activeTracking.id === "LX-8893-DL") return;

    const interval = setInterval(() => {
      setSecondsToScan((prev) => {
        if (prev <= 1) {
          // Fluctuate stats
          setRealtimeTemp((curr) => {
            const delta = (Math.random() - 0.5) * 0.4;
            const targetBase = parseFloat(activeTracking.temp) || 21.6;
            const updated = curr + delta;
            return Math.abs(updated - targetBase) > 1.5 ? targetBase + (delta > 0 ? 0.4 : -0.4) : updated;
          });

          setRealtimeHumidity((curr) => {
            const delta = Math.floor(Math.random() * 3) - 1;
            const targetBase = parseFloat(activeTracking.humidity) || 42;
            const updated = curr + delta;
            return Math.abs(updated - targetBase) > 5 ? targetBase + (delta > 0 ? 1 : -1) : updated;
          });

          const hexToken = Math.floor(0x1000 + Math.random() * 0xefff).toString(16).toUpperCase();
          setCryptoToken(`SEALED-${hexToken}`);

          // Append log line
          const timeStr = new Date().toLocaleTimeString("en-US", { hour12: false });
          const telemetryEvents = [
            `CRITICAL ENCRYPTION HANDSHAKE: Verification signature verified with TLS 1.3 Key Exchange. Token: SEALED-${hexToken}`,
            `TELEMETRY CHECK: Sensors reporting stable state. Temperature: ${realtimeTemp.toFixed(1)}°C, Humidity: ${realtimeHumidity}% RH.`,
            `GPS TRACKING: Orbital relay verified coordinates at Latitude 19.0760, Longitude 72.8777 (Signal Strong).`,
            `HEARTBEAT: Environmental containment unit seal is fully pressurized and secure.`,
            `DIAGNOSTIC: Active cold-chain flow regulator check returned status SUCCESS.`
          ];
          const randomEvent = telemetryEvents[Math.floor(Math.random() * telemetryEvents.length)];
          setLogLines((prev) => [`[${timeStr}] ${randomEvent}`, ...prev.slice(0, 8)]);

          // If tracking a user's local order, we can dynamically reload to grab any newly elapsed milestones
          try {
            const savedOrders = JSON.parse(localStorage.getItem("luxevra_orders") || "[]");
            const matchedOrder = savedOrders.find((o: any) => o.id.toUpperCase() === activeTracking.id.toUpperCase());
            if (matchedOrder) {
              const reloaded = getDynamicOrderTracking(matchedOrder, Date.now());
              setActiveTracking(prev => ({
                ...reloaded,
                temp: activeTracking.temp,
                humidity: activeTracking.humidity,
                integrity: activeTracking.integrity
              }));
            }
          } catch (e) {
            console.error(e);
          }

          return 15;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTracking, isOpen, realtimeTemp, realtimeHumidity]);

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const idClean = trackingId.toUpperCase().trim();
    if (!idClean) return;

    // 1. Check user orders first
    try {
      const savedOrders = JSON.parse(localStorage.getItem("luxevra_orders") || "[]");
      const matchedOrder = savedOrders.find((o: any) => o.id.toUpperCase() === idClean);
      if (matchedOrder) {
        const tracking = getDynamicOrderTracking(matchedOrder, Date.now());
        setActiveTracking(tracking);
        setError(false);
        setLogLines([
          `[${new Date().toLocaleTimeString("en-US", { hour12: false })}] INITIALIZED STATUS CHECK FOR SECURE CONSIGNMENT ${idClean}.`,
          `[${new Date().toLocaleTimeString("en-US", { hour12: false })}] USER ORDER LOOKUP: Matches active checkout session payload.`,
          `[${new Date().toLocaleTimeString("en-US", { hour12: false })}] GPS LINK: Core coordinates resolved at Latitude 19.0760, Longitude 72.8777.`
        ]);
        return;
      }
    } catch (e) {
      console.error(e);
    }

    // 2. Check presets
    if (SAMPLE_TRACKING_DATA[idClean]) {
      const preset = SAMPLE_TRACKING_DATA[idClean];
      let timestamp = Date.now();
      if (idClean === "LX-7489-IN") {
        timestamp = Date.now() - 12 * 60 * 60 * 1000;
      } else if (idClean === "LX-2094-AT") {
        timestamp = Date.now() - 2 * 60 * 60 * 1000;
      }
      setActiveTracking({
        ...preset,
        timestamp
      });
      setError(false);
      setLogLines([
        `[${new Date().toLocaleTimeString("en-US", { hour12: false })}] SECURE ENCRYPTED CHANNEL ESTABLISHED FOR PRESET ${idClean}.`,
        `[${new Date().toLocaleTimeString("en-US", { hour12: false })}] VERIFIED SIGNATURE BY DISPATCH AUTHORITY.`
      ]);
    } else if (idClean.length > 3) {
      // 3. Generate dynamic simulated tracker
      const mockOrder = {
        id: idClean,
        timestamp: Date.now() - 3.5 * 60 * 60 * 1000,
        weight: "1.32 KG",
        items: []
      };
      const tracking = getDynamicOrderTracking(mockOrder, Date.now());
      setActiveTracking(tracking);
      setError(false);
      setLogLines([
        `[${new Date().toLocaleTimeString("en-US", { hour12: false })}] COURIER SYSTEM MATCH FOUND: Dynamic telemetry synchronization complete.`,
        `[${new Date().toLocaleTimeString("en-US", { hour12: false })}] ESTABLISHING HEARTBEAT SCAN WITH SECURE COLD-CHAIN LOCKER.`
      ]);
    } else {
      setError(true);
      setActiveTracking(null);
    }
  };

  const handleSelectPreset = (id: string) => {
    setTrackingId(id);
    const idClean = id.toUpperCase().trim();
    const preset = SAMPLE_TRACKING_DATA[idClean];
    let timestamp = Date.now();
    if (idClean === "LX-7489-IN") {
      timestamp = Date.now() - 12 * 60 * 60 * 1000;
    } else if (idClean === "LX-2094-AT") {
      timestamp = Date.now() - 2 * 60 * 60 * 1000;
    }
    setActiveTracking({
      ...preset,
      timestamp
    });
    setError(false);
    setLogLines([
      `[${new Date().toLocaleTimeString("en-US", { hour12: false })}] SECURE ENCRYPTED CHANNEL ESTABLISHED FOR PRESET ${idClean}.`,
      `[${new Date().toLocaleTimeString("en-US", { hour12: false })}] VERIFIED SIGNATURE BY DISPATCH AUTHORITY.`
    ]);
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-luxury-black/98 flex items-center justify-center p-4 backdrop-blur-md"
      id="tracking-portal-overlay"
    >
      {/* 3D T-SHIRT ROTATING VISUALIZER IN BACKGROUND SPLASH */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20 sm:opacity-[0.25] overflow-hidden">
        <ThreeDTshirt width={650} height={650} autoRotate={true} interactive={false} />
      </div>

      <div className="relative w-full max-w-4xl bg-[#070707] border border-zinc-900 shadow-2xl overflow-hidden min-h-[550px] flex flex-col md:flex-row z-10">
        
        {/* LEFT COLUMN: INTERACTIVE INPUT & SEARCH CONSOLE */}
        <div className="w-full md:w-[40%] p-6 md:p-8 border-b md:border-b-0 md:border-r border-zinc-900 bg-[#0c0c0c] flex flex-col justify-between relative">
          <div>
            {/* Header branding */}
            <div className="flex items-center gap-2 mb-8">
              <Compass className="w-5 h-5 text-gold-mid animate-spin-slow" />
              <span className="text-[10px] font-sans font-bold tracking-[0.3em] text-white uppercase">
                LUXEVRA COUTURE TRACKING
              </span>
            </div>

            <h3 className="text-xl md:text-2xl font-sans font-light tracking-tight text-white mb-2 leading-tight">
              SECURE DISPATCH <br />
              <span className="text-gold-mid font-semibold italic">TELEMETRY SYSTEM</span>
            </h3>
            <p className="text-xs text-zinc-500 font-sans font-light leading-relaxed mb-6">
              Enter your Atelier Priority Dispatch Code to retrieve real-time environmental status, GPS position logs, and signature-verified delivery metrics.
            </p>

            <form onSubmit={handleTrackSubmit} className="space-y-4 mb-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. LX-7489-IN"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 text-sm font-mono text-white placeholder-zinc-700 px-4 py-3.5 focus:outline-none focus:border-gold-mid transition-colors uppercase tracking-widest"
                  id="tracking-id-input"
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-gold-mid transition-colors"
                  aria-label="Submit search"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>

              {error && (
                <p className="text-[10px] font-mono text-red-500 tracking-wider uppercase">
                  ⚠️ INVALID DISPATCH CODE. TRY AN ACTIVE TRACKER BELOW.
                </p>
              )}

              <button
                type="submit"
                className="w-full bg-gold-mid hover:bg-gold-light text-black text-xs font-sans font-bold tracking-[0.2em] py-3.5 transition-all uppercase"
                id="tracking-search-submit-btn"
              >
                ACCESS HIGH-SECURITY STATUS
              </button>
            </form>

            {/* PRESETS FOR DEMONSTRATION */}
            <div className="space-y-3">
              <span className="text-[9px] font-sans tracking-widest text-zinc-500 block uppercase">
                ACTIVE COUTURE CONSIGNMENTS:
              </span>
              <div className="grid grid-cols-1 gap-2">
                <button
                  onClick={() => handleSelectPreset("LX-7489-IN")}
                  className="text-left bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 hover:border-gold-mid/30 p-2.5 transition-all text-xs flex justify-between items-center group"
                >
                  <div className="font-mono text-zinc-300">
                    <span className="text-gold-mid">★</span> LX-7489-IN
                    <span className="block text-[8px] text-zinc-600 font-sans tracking-widest uppercase">AIR EXPRESS - EN-ROUTE</span>
                  </div>
                  <span className="text-[10px] text-zinc-500 group-hover:text-gold-mid font-sans tracking-wider font-semibold uppercase">TRACK</span>
                </button>

                <button
                  onClick={() => handleSelectPreset("LX-2094-AT")}
                  className="text-left bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 hover:border-gold-mid/30 p-2.5 transition-all text-xs flex justify-between items-center group"
                >
                  <div className="font-mono text-zinc-300">
                    <span className="text-gold-mid">★</span> LX-2094-AT
                    <span className="block text-[8px] text-zinc-600 font-sans tracking-widest uppercase">LAB ASSEMBLY & CALIBRATION</span>
                  </div>
                  <span className="text-[10px] text-zinc-500 group-hover:text-gold-mid font-sans tracking-wider font-semibold uppercase">TRACK</span>
                </button>

                <button
                  onClick={() => handleSelectPreset("LX-8893-DL")}
                  className="text-left bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 hover:border-gold-mid/30 p-2.5 transition-all text-xs flex justify-between items-center group"
                >
                  <div className="font-mono text-zinc-300">
                    <span className="text-gold-mid">★</span> LX-8893-DL
                    <span className="block text-[8px] text-zinc-600 font-sans tracking-widest uppercase">VERIFIED HAND-DELIVERED</span>
                  </div>
                  <span className="text-[10px] text-zinc-500 group-hover:text-gold-mid font-sans tracking-wider font-semibold uppercase">TRACK</span>
                </button>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-zinc-900/60 text-[9px] text-zinc-600 font-sans tracking-widest uppercase flex justify-between">
            <span>SECURE CONNECTION</span>
            <span className="text-gold-mid">TLS 1.3 SHA-256</span>
          </div>
        </div>

        {/* RIGHT COLUMN: DETAILED VISUAL STATUS */}
        <div className="flex-1 p-6 md:p-8 flex flex-col justify-between relative bg-black/40">
          
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full border border-zinc-900 hover:border-zinc-700 bg-zinc-950 text-zinc-400 hover:text-white transition-all cursor-pointer z-20"
            aria-label="Close portal"
            id="close-tracking-portal-btn"
          >
            <X className="w-4 h-4" />
          </button>

          {activeTracking ? (
            <div className="space-y-5 md:space-y-6 animate-fade-in">
              
              {/* CURRENT CONSIGNMENT STATUS OVERVIEW */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-gold-mid/10 text-gold-mid font-mono text-[9px] tracking-[0.2em] uppercase font-bold border border-gold-mid/20">
                    {activeTracking.id}
                  </span>
                  <span className="text-zinc-600 text-xs">|</span>
                  <span className="text-[10px] text-zinc-400 font-mono uppercase">ATELIER DISPATCH CHANNEL</span>
                </div>

                <h4 className="text-base md:text-lg font-sans font-medium text-white tracking-wider uppercase leading-snug">
                  {activeTracking.statusText}
                </h4>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-2 border-t border-zinc-900/60">
                  <div className="space-y-0.5 font-sans">
                    <span className="text-[8px] tracking-widest text-zinc-500 uppercase block">ESTIMATED ARRIVAL</span>
                    <p className="text-xs text-gold-light font-semibold uppercase font-mono">{activeTracking.estimatedDelivery}</p>
                    {activeTracking.id !== "LX-8893-DL" && (
                      <span className="text-[9px] text-zinc-400 font-mono font-medium block mt-1 tracking-wider text-emerald-400 animate-pulse">
                        ⏳ {countdownText}
                      </span>
                    )}
                  </div>
                  <div className="space-y-0.5 font-sans">
                    <span className="text-[8px] tracking-widest text-zinc-500 uppercase block">ORIGIN POINT</span>
                    <p className="text-xs text-zinc-300 font-medium uppercase font-mono">{activeTracking.origin.split(" (")[0]}</p>
                  </div>
                  <div className="space-y-0.5 font-sans hidden md:block">
                    <span className="text-[8px] tracking-widest text-zinc-500 uppercase block">DESTINATION PORT</span>
                    <p className="text-xs text-zinc-300 font-medium uppercase font-mono">{activeTracking.destination.split(" ")[0]}</p>
                  </div>
                </div>
              </div>

              {/* REAL-TIME PRODUCT CONSIGNMENT CHECKLIST */}
              {activeTracking.items && activeTracking.items.length > 0 && (
                <div className="bg-zinc-950/40 border border-zinc-900/60 p-3 rounded-sm space-y-2">
                  <div className="flex justify-between items-center text-[8px] text-zinc-500 tracking-widest font-sans uppercase font-bold">
                    <span>CONSIGNMENT CONTENT LIST</span>
                    <span className="text-gold-mid">{activeTracking.items.reduce((acc, item) => acc + item.quantity, 0)} INDIVIDUALS</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[100px] overflow-y-auto custom-scrollbar">
                    {activeTracking.items.map((item: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-2 bg-black/60 border border-zinc-900/80 px-2 py-1.5 rounded-sm">
                        <img 
                          src={item.product.image} 
                          alt={item.product.name} 
                          className="w-6 h-7 object-cover bg-zinc-900/60 border border-zinc-900/30 rounded-sm"
                          referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-[9px] text-zinc-200 font-sans font-medium uppercase truncate">
                            {item.product.name}
                          </p>
                          <p className="text-[7px] text-zinc-500 font-mono uppercase tracking-wider">
                            SIZE: {item.selectedSize} | QUANTITY: {item.quantity}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* EN-ROUTE CLIMATE DIAGNOSTICS & SENSORS FEED */}
              <div className="bg-zinc-950/60 border border-zinc-900 p-4 rounded-sm space-y-3.5">
                <div className="flex items-center justify-between border-b border-zinc-900/80 pb-2">
                  <div className="flex items-center gap-1.5 text-[8px] text-zinc-400 tracking-widest font-sans uppercase font-semibold">
                    <Sparkles className="w-3.5 h-3.5 text-gold-mid animate-pulse" />
                    <span>ACTIVE ENVIRONMENTAL SENSOR CHIP FEED</span>
                  </div>
                  {activeTracking.id !== "LX-8893-DL" && (
                    <div className="flex items-center gap-1.5 text-[8px] font-mono text-zinc-500">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>NEXT RE-CALIBRATION: <b className="text-emerald-400">{secondsToScan}s</b></span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="flex items-center gap-2.5 p-2 bg-[#0c0c0c] border border-zinc-900">
                    <Scale className="w-4 h-4 text-zinc-500" />
                    <div>
                      <span className="text-[7px] text-zinc-600 uppercase block font-sans tracking-widest">WEIGHT</span>
                      <span className="text-xs text-white font-mono font-medium">{activeTracking.weight}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 p-2 bg-[#0c0c0c] border border-zinc-900">
                    <ThermometerSnowflake className="w-4 h-4 text-zinc-500 animate-pulse" />
                    <div>
                      <span className="text-[7px] text-zinc-600 uppercase block font-sans tracking-widest">TEMPERATURE</span>
                      <span className="text-xs text-white font-mono font-medium transition-all duration-300">
                        {activeTracking.id === "LX-8893-DL" ? activeTracking.temp : `${realtimeTemp.toFixed(1)}°C`}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 p-2 bg-[#0c0c0c] border border-zinc-900">
                    <Droplet className="w-4 h-4 text-zinc-500" />
                    <div>
                      <span className="text-[7px] text-zinc-600 uppercase block font-sans tracking-widest">HUMIDITY</span>
                      <span className="text-xs text-white font-mono font-medium transition-all duration-300">
                        {activeTracking.id === "LX-8893-DL" ? activeTracking.humidity : `${realtimeHumidity}% RH`}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 p-2 bg-[#0c0c0c] border border-zinc-900">
                    <ShieldCheck className="w-4 h-4 text-gold-mid" />
                    <div>
                      <span className="text-[7px] text-zinc-600 uppercase block font-sans tracking-widest">RFID SEAL</span>
                      <span className="text-[9px] text-gold-light font-mono truncate max-w-[80px] font-medium block">
                        {activeTracking.id === "LX-8893-DL" ? activeTracking.integrity.split(" ")[0] : cryptoToken}
                      </span>
                    </div>
                  </div>
                </div>

                {/* LIVE DIAGNOSTICS CONSOLE TERMINAL */}
                <div className="border-t border-zinc-900 pt-2.5 space-y-1.5">
                  <div className="flex justify-between items-center text-[7px] font-mono text-zinc-500 tracking-wider">
                    <span>SECURITY CONSOLE LOG OUTPUT</span>
                    <span className="text-gold-mid font-semibold tracking-normal">TLS v1.3 SIGNED</span>
                  </div>
                  <div className="bg-black/80 border border-zinc-900/60 p-2 h-[60px] overflow-y-auto font-mono text-[8px] text-zinc-400 space-y-1 custom-scrollbar leading-relaxed">
                    {logLines.map((line, idx) => (
                      <div key={idx} className="flex gap-1.5">
                        <span className="text-gold-mid select-none">&gt;&gt;</span>
                        <span className={`${idx === 0 ? "text-zinc-200" : "text-zinc-600 font-light"}`}>{line}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* DYNAMIC TIMELINE UPDATES */}
              <div className="space-y-3">
                <span className="text-[9px] font-sans tracking-widest text-zinc-500 block uppercase font-bold">
                  TIMELINE LOG & GEOLOCATION FEED:
                </span>
                
                <div className="space-y-4 max-h-[140px] overflow-y-auto pr-2 custom-scrollbar">
                  {activeTracking.updates.map((update, index) => (
                    <div key={index} className="flex gap-4 relative group">
                      
                      {/* Left timeline status/time */}
                      <div className="w-16 flex-shrink-0 text-right font-mono">
                        <span className="text-[10px] text-white block">{update.time}</span>
                        <span className="text-[8px] text-zinc-600 block">{update.date.split(",")[0]}</span>
                      </div>

                      {/* Timeline dot & vertical connecting line */}
                      <div className="flex flex-col items-center">
                        <div className="w-2.5 h-2.5 bg-gold-mid rounded-full flex items-center justify-center border-2 border-black z-10 group-hover:scale-125 transition-transform"></div>
                        {index < activeTracking.updates.length - 1 && (
                          <div className="w-px flex-grow bg-zinc-900 my-1"></div>
                        )}
                      </div>

                      {/* Content descriptive blocks */}
                      <div className="flex-1 pb-1">
                        <div className="flex items-baseline gap-2">
                          <h5 className="text-[11px] font-sans font-bold tracking-wider text-white uppercase">
                            {update.status}
                          </h5>
                          <span className="text-[8px] font-mono text-zinc-500 uppercase">
                            @{update.location}
                          </span>
                        </div>
                        <p className="text-[10px] text-zinc-500 font-sans font-light leading-relaxed mt-0.5">
                          {update.description}
                        </p>
                      </div>

                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            /* DEFAULT PLAIN INSTRUCTION VIEW */
            <div className="flex-1 flex flex-col justify-center items-center text-center p-6 space-y-4 min-h-[300px]">
              <div className="w-16 h-16 rounded-full bg-zinc-950 border border-zinc-900 flex items-center justify-center text-gold-mid relative">
                <Truck className="w-7 h-7" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-gold-mid rounded-full animate-ping"></span>
              </div>
              <div className="space-y-1 max-w-sm">
                <h4 className="text-sm font-sans font-semibold tracking-widest text-white uppercase">
                  WAITING FOR COUTURE SIGN-IN
                </h4>
                <p className="text-xs text-zinc-500 font-sans font-light leading-relaxed">
                  Enter an active tracking code in the telemetry console, or click any of the luxury demo presets to observe real-time dispatch telemetry.
                </p>
              </div>

              {/* SMALL WIREFRAME ACCENT FOR 3D GARMENT FOCUS */}
              <div className="text-[8px] text-zinc-600 font-mono tracking-widest uppercase pt-6">
                ★ MODEL ROTATION DETECTED // DRAG TO ORBIT COUTURE OBJ
              </div>
            </div>
          )}

          <div className="pt-6 border-t border-zinc-900/40 text-[9px] text-zinc-600 font-sans tracking-widest uppercase text-center flex flex-col sm:flex-row justify-between gap-2 mt-4">
            <span>LUXEVRA LOGISTICS CENTER (MUMBAI HUB)</span>
            <span className="text-gold-mid tracking-wide">SECURE COURIER COLD-CHAIN DISPATCH</span>
          </div>

        </div>

      </div>
    </div>
  );
}
