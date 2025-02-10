export interface Project {
  projectName: string;
  beraAmount: number;
  twitterHandle: string;
  profileImageUrl?: string;
}

export interface TwitterProfile {
  profile_image_url: string;
}

export interface CsvRecord {
  project_name: string;
  bera_amount: string;
}
