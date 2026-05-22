export type EventConceptId = "botanical";

export interface LoveStoryMoment {
  id: string;
  year: string;
  title: string;
  description: string;
  image: string;
}

export interface ScheduleItem {
  time: string;
  title: string;
  description: string;
  icon: string;
}

export interface DressColor {
  hex: string;
  name: string;
}

export interface DressCode {
  description: string;
  colors: DressColor[];
  moodboardImages: string[];
}

export interface ContactInfo {
  organizerPhone: string; // Номер телефона для WhatsApp
  organizerName: string;
  playlistUrl: string;
  hashtag: string;
}

export interface EventData {
  coupleNames: string;
  groomName: string;
  brideName: string;
  date: string; // "2024-08-24" etc.
  slogan: string;
  heroImage: string;
  loveStory: LoveStoryMoment[];
  schedule: ScheduleItem[];
  dressCode: DressCode;
  contacts: ContactInfo;
  coordinates: {
    lat: string;
    lng: string;
    placeName: string;
    address: string;
    mapQuery: string;
  };
}

export interface RsvpResponse {
  id: string;
  name: string;
  status: "yes" | "no" | "maybe";
  guestsCount: number;
  food: "meat" | "fish" | "vegetarian";
  drinks: string[];
  wishes?: string;
  createdAt?: string;
}
