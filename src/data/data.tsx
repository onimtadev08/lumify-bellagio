import DeviceInfo from 'react-native-device-info';
import { NewsItem } from '../types/news';

export const ColorFirst = '#1a1a1a';
export const ColorSecond = '#B6771D';
export const Domain = 'https://bty.world';
export const appVersion = DeviceInfo.getVersion();
export type MessageType = 'success' | 'error' | 'info' | 'confirmation';
export const newsData: NewsItem[] = [
  {
    id: '1',
    title: 'Bellagio Colombo',
    shortDescription:
      "Sri Lanka's premier nightlife & gaming destination. Open 24/7 at R. A. De Mel Mawatha, Colombo 03.",
    fullContent: `Established in 1998, Bellagio Colombo (officially Bellagio Entertainment) is one of Sri Lanka's leading nightlife and gaming destinations.

Located on R. A. De Mel Mawatha (Duplication Road) in Colombo 03, Bellagio operates 24 hours a day, 7 days a week, providing world-class entertainment and gaming experiences.

Our Facilities:
• State-of-the-art gaming floor
• Premium dining experiences
• Live entertainment venues
• VIP lounges and private gaming areas
• Professional and courteous staff

Operating Hours: 24/7
Location: R. A. De Mel Mawatha, Colombo 03
Contact: +94 11 234 5678

Visit us today and experience the finest in entertainment and hospitality!`,
    image: require('../assets/images/bellagio.jpg'),
    date: '2024-12-20',
    category: 'Announcement',
    isNew: true,
  },
  {
    id: '2',
    title: 'New Year Special Events',
    shortDescription:
      'Join us for exclusive New Year celebrations with special performances, prizes, and entertainment.',
    fullContent: `Ring in the New Year with Bellagio Colombo!

We're excited to announce our grand New Year celebration with exclusive events planned throughout the evening.

Event Highlights:
• Live band performances from 8 PM
• Special New Year countdown at midnight
• Champagne toast for all guests
• Lucky draw with amazing prizes
• Gourmet dinner buffet
• Complimentary welcome drinks

Date: December 31st, 2024
Time: 8 PM onwards
Dress Code: Smart Casual

Reserve your spot now! Limited seating available.
Call: +94 11 234 5678
Email: events@bellagio.lk`,
    image: require('../assets/images/bellagio1.jpg'),
    date: '2024-12-18',
    category: 'Events',
    isNew: true,
  },
  {
    id: '3',
    title: 'VIP Membership Program',
    shortDescription:
      'Exclusive benefits and rewards for our valued members. Apply now for premium access.',
    fullContent: `Introducing the Bellagio VIP Membership Program!

Enjoy exclusive privileges and benefits designed for our most valued guests.

Membership Benefits:
• Priority access to all venues
• Complimentary valet parking
• Special member-only events
• Dedicated VIP host
• Birthday rewards and surprises
• Exclusive dining discounts
• Access to private gaming areas
• Earn points on every visit

Membership Tiers:
- Gold Member: Entry level benefits
- Platinum Member: Enhanced privileges
- Diamond Member: Ultimate VIP experience

Application Process:
Visit our membership desk or apply online at www.bellagio.lk/membership

For more information:
Call: +94 11 234 5678
Email: vip@bellagio.lk`,
    image: require('../assets/images/images.jpeg'),
    date: '2024-12-15',
    category: 'Program',
    isNew: false,
  },
  {
    id: '4',
    title: 'Weekend Entertainment Schedule',
    shortDescription:
      'Live music, DJ performances, and special shows every weekend. Check out our lineup!',
    fullContent: `Your Weekend Destination for Entertainment!

Every weekend at Bellagio brings exciting live performances and entertainment.

This Weekend's Schedule:

Friday Night:
• 8 PM - DJ Ravi Live
• 10 PM - Live Band Performance
• 12 AM - Late Night DJ Session

Saturday Night:
• 7 PM - Acoustic Sessions
• 9 PM - Special Guest Performance
• 11 PM - DJ Party till Dawn

Sunday:
• 6 PM - Jazz Evening
• 8 PM - Karaoke Night
• 10 PM - Closing DJ Set

All performances include:
- No cover charge
- Happy hour specials
- Complimentary snacks
- Photo opportunities

Join us for an unforgettable weekend experience!

Location: Bellagio Colombo, Duplication Road
Info: +94 11 234 5678`,
    image: require('../assets/images/imagesr.jpeg'),
    date: '2024-12-12',
    category: 'Entertainment',
    isNew: false,
  },
];
