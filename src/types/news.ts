export interface NewsItem {
  id: string;
  title: string;
  shortDescription: string;
  fullContent: string;
  image: any; // require() image
  date: string;
  category: string;
  isNew?: boolean;
}
