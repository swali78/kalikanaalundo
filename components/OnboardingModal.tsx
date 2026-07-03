"use client";

import React, { useState } from "react";
import { User, Sport, SkillLevel, District } from "@/lib/types";
import { getSportEmoji } from "@/lib/mockData";
import { ShieldCheck, MapPin, Sparkles, Check, ArrowRight } from "lucide-react";
import { InstagramIcon as Instagram } from "@/components/ui/InstagramIcon";

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (profileData: {
    name: string;
    age: number;
    district: District;
    city: string;
    skillLevel: SkillLevel;
    sports: Sport[];
    instagram?: string;
    privacyFuzzLocation?: boolean;
    latitude?: number;
    longitude?: number;
    role?: 'player' | 'admin';
  }) => void;
  initialName?: string;
}

const AVAILABLE_SPORTS: Sport[] = [
  "Badminton",
  "Football",
  "Cricket",
  "Pickleball",
  "Volleyball",
  "Basketball",
  "Tennis",
  "Table Tennis",
  "Running",
  "Cycling",
];

const DISTRICTS: District[] = [
  "Ernakulam",
  "Thiruvananthapuram",
  "Kozhikode",
  "Thrissur",
  "Alappuzha",
  "Kollam",
  "Kottayam",
  "Palakkad",
  "Malappuram",
  "Kannur",
];

export default function OnboardingModal({
  isOpen,
  onClose,
  onComplete,
  initialName = "",
}: OnboardingModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [name, setName] = useState(initialName || "");
  const [role, setRole] = useState<'player' | 'admin'>('player');
  const [age, setAge] = useState<number>(24);
  const [district, setDistrict] = useState<District>("Ernakulam");
  const [city, setCity] = useState("Kochi");
  const [skillLevel, setSkillLevel] = useState<SkillLevel>("Beginner");
  const [selectedSports, setSelectedSports] = useState<Sport[]>(["Badminton", "Football"]);
  const [instagram, setInstagram] = useState("");
  const [privacyFuzzLocation, setPrivacyFuzzLocation] = useState(true);
  const [coords, setCoords] = useState<{ lat?: number; lng?: number }>({});
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsGranted, setGpsGranted] = useState(false);

  if (!isOpen) return null;

  const toggleSport = (sport: Sport) => {
    if (selectedSports.includes(sport)) {
      if (selectedSports.length > 1) {
        setSelectedSports(selectedSports.filter((s) => s !== sport));
      }
    } else {
      setSelectedSports([...selectedSports, sport]);
    }
  };

  const handleRequestGps = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGpsGranted(true);
        setGpsLoading(false);
      },
      (err) => {
        console.warn("GPS permission denied or errored:", err);
        setGpsLoading(false);
        alert("Location access denied. We will default to your district center coordinates.");
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Clean instagram handle (remove @ or full URL if pasted)
    let cleanInsta = instagram.trim();
    if (cleanInsta.startsWith("http")) {
      cleanInsta = cleanInsta.split("/").pop() || cleanInsta;
    }
    cleanInsta = cleanInsta.replace(/^@/, "");

    onComplete({
      name: name.trim(),
      age: Number(age) || 25,
      district,
      city: city.trim() || district,
      skillLevel,
      sports: selectedSports,
      instagram: cleanInsta || undefined,
      privacyFuzzLocation,
      latitude: coords.lat,
      longitude: coords.lng,
      role,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm fade-in">
      <div className="glass-modal w-full max-w-lg p-6 sm:p-8 bg-white dark:bg-[#121212] relative max-h-[90vh] overflow-y-auto">
        {/* Step indicator */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#22C55E]/15 text-[#22C55E] flex items-center justify-center font-bold text-sm">
              {step}
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#71717A]">
              Step {step} of 3
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-sm text-[#71717A] hover:text-[#171717] dark:hover:text-white"
          >
            Skip for now
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* STEP 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-4 fade-in">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-[#171717] dark:text-white">
                  Welcome to CIRCLE! 👋
                </h2>
                <p className="text-sm text-[#71717A] mt-1">
                  Let&apos;s build your player profile so nearby players can find you.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#71717A] mb-1.5">
                  Your Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Swalih M."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#71717A] mb-1.5">
                  Your Primary Role on Circle
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setRole("player")}
                    className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                      role === "player"
                        ? "border-[#22C55E] bg-[#22C55E]/10 text-[#171717] dark:text-white font-bold shadow-sm"
                        : "border-[#E4E4E7] dark:border-[#262626] hover:border-[#71717A] text-[#71717A]"
                    }`}
                  >
                    <span className="text-sm font-bold flex items-center gap-1.5">
                      <span>⚽</span>
                      <span>Normal Player</span>
                    </span>
                    <span className="text-[10px] mt-1 opacity-80 leading-snug font-normal">
                      Discover games & join turfs
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("admin")}
                    className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                      role === "admin"
                        ? "border-[#22C55E] bg-[#22C55E]/10 text-[#171717] dark:text-white font-bold shadow-sm"
                        : "border-[#E4E4E7] dark:border-[#262626] hover:border-[#71717A] text-[#71717A]"
                    }`}
                  >
                    <span className="text-sm font-bold flex items-center gap-1.5">
                      <span>🛡️</span>
                      <span>Community Host</span>
                    </span>
                    <span className="text-[10px] mt-1 opacity-80 leading-snug font-normal">
                      Organize hubs & turfs
                    </span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#71717A] mb-1.5">
                    Age
                  </label>
                  <input
                    type="number"
                    min={13}
                    max={99}
                    required
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#71717A] mb-1.5">
                    Skill Level
                  </label>
                  <select
                    value={skillLevel}
                    onChange={(e) => setSkillLevel(e.target.value as SkillLevel)}
                    className="w-full font-medium"
                  >
                    <option value="Beginner">Beginner (Casual)</option>
                    <option value="Intermediate">Intermediate (Regular)</option>
                    <option value="Advanced">Advanced (Competitive)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#71717A] mb-1.5">
                    District
                  </label>
                  <select
                    value={district}
                    onChange={(e) => {
                      const d = e.target.value as District;
                      setDistrict(d);
                      if (d === "Ernakulam") setCity("Kochi");
                      else if (d === "Kozhikode") setCity("Calicut");
                      else setCity(d);
                    }}
                    className="w-full font-medium"
                  >
                    {DISTRICTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#71717A] mb-1.5">
                    City / Area
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kakkanad"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full font-medium"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (name.trim()) setStep(2);
                }}
                className="w-full primary-btn flex items-center justify-center gap-2 mt-4"
              >
                <span>Continue to Sports</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 2: Sports & Instagram Social Handle */}
          {step === 2 && (
            <div className="space-y-5 fade-in">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-[#171717] dark:text-white flex items-center gap-2">
                  <span>Sports & Social</span>
                  <Sparkles className="w-5 h-5 text-[#22C55E]" />
                </h2>
                <p className="text-sm text-[#71717A] mt-1">
                  Pick your favorite sports and add your Instagram so players can easily chat with you!
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#71717A] mb-2">
                  Select Sports You Play
                </label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_SPORTS.map((sport) => {
                    const active = selectedSports.includes(sport);
                    return (
                      <button
                        key={sport}
                        type="button"
                        onClick={() => toggleSport(sport)}
                        className={`sport-chip ${active ? "active font-semibold shadow-sm" : ""}`}
                      >
                        <span>{getSportEmoji(sport)}</span>
                        <span>{sport}</span>
                        {active && <Check className="w-3.5 h-3.5 ml-0.5" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#F4F4F5] dark:bg-[#1F1F1F] border border-[#E4E4E7] dark:border-[#262626] space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-[#171717] dark:text-white">
                  <Instagram className="w-4 h-4 text-pink-500" />
                  <span>Instagram Handle (Recommended)</span>
                </div>
                <p className="text-xs text-[#71717A] leading-relaxed">
                  When you join games or post a &quot;Play Now&quot; broadcast, nearby players can tap to view your profile and send an instant DM to coordinate!
                </p>
                <div className="relative mt-2">
                  <span className="absolute left-4 top-3.5 text-sm font-semibold text-[#71717A]">@</span>
                  <input
                    type="text"
                    placeholder="username"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    className="w-full !pl-8 font-medium"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="secondary-btn w-1/3 text-center"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="primary-btn w-2/3 flex items-center justify-center gap-2"
                >
                  <span>Continue to GPS</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Real-Time GPS & Privacy Consent */}
          {step === 3 && (
            <div className="space-y-5 fade-in">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-[#171717] dark:text-white flex items-center gap-2">
                  <span>Enable Nearby GPS</span>
                  <MapPin className="w-5 h-5 text-[#22C55E]" />
                </h2>
                <p className="text-sm text-[#71717A] mt-1">
                  We use your location to calculate distance to games and players in real time.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#22C55E]/5 border border-[#22C55E]/20 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#22C55E]/20 flex items-center justify-center text-[#22C55E] shrink-0 mt-0.5">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#171717] dark:text-white">
                      Safety-First Location Fuzzing
                    </h4>
                    <p className="text-xs text-[#71717A] mt-1 leading-relaxed">
                      Your exact GPS coordinates are never displayed publicly. We apply a ~300m random offset on public cards so people see distance without knowing your exact location.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#22C55E]/10">
                  <span className="text-xs font-semibold text-[#171717] dark:text-white">
                    Enable Fuzzed Privacy Mode
                  </span>
                  <input
                    type="checkbox"
                    checked={privacyFuzzLocation}
                    onChange={(e) => setPrivacyFuzzLocation(e.target.checked)}
                    className="w-4 h-4 accent-[#22C55E] rounded cursor-pointer"
                  />
                </div>
              </div>

              <div className="text-center py-2">
                {gpsGranted ? (
                  <div className="p-3 rounded-xl bg-[#22C55E]/15 text-[#16A34A] dark:text-[#22C55E] text-xs font-bold flex items-center justify-center gap-2">
                    <Check className="w-4 h-4" />
                    <span>GPS Location Confirmed ({coords.lat?.toFixed(2)}, {coords.lng?.toFixed(2)})</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleRequestGps}
                    disabled={gpsLoading}
                    className="w-full py-3 px-4 rounded-2xl border-2 border-dashed border-[#22C55E] hover:bg-[#22C55E]/5 text-[#16A34A] dark:text-[#22C55E] font-bold text-sm transition-all flex items-center justify-center gap-2"
                  >
                    <MapPin className={`w-4 h-4 ${gpsLoading ? "animate-spin" : "animate-bounce"}`} />
                    <span>{gpsLoading ? "Detecting GPS..." : "Grant GPS Location Access"}</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="secondary-btn w-1/3 text-center"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="primary-btn w-2/3 flex items-center justify-center gap-2 shadow-lg shadow-[#22C55E]/25"
                >
                  <span>Complete Onboarding</span>
                  <Check className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
