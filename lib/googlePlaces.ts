export const CAPE_TOWN_COORDS = {
  lat: -33.9249,
  lng: 18.4241,
} as const;

export const SEARCH_RADIUS = 35000; // 35km in meters

export const categoryQueries: Record<string, string> = {
  Bowling: "bowling alley",
  "Combat Sports": "martial arts|boxing gym|mma gym",
  Football: "football field|soccer field",
  Golf: "golf course|driving range",
  Gym: "fitness center|health club|gymnasium -yoga -pilates -boxing -mma -martial -combat",
  "Horse Riding": "horse riding|equestrian center|stables",
  "Massage Studio": "massage studio|massage therapist",
  Padel: "padel court",
  Paintball: "paintball field",
  Pilates: "pilates studio",
  "Spa & Wellness Centers": "spa|wellness center",
  Squash: "squash court",
  Tennis: "tennis court",
  Yoga: "yoga studio",
};
