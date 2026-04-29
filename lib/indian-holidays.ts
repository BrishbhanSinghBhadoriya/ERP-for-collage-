import moment from 'moment';

export interface HolidayEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: 'national' | 'regional' | 'optional';
  description?: string;
  isIndianHoliday: boolean;
}

// Indian National Holidays for 2024
export const indianNationalHolidays: HolidayEvent[] = [
  {
    id: 'new-year-2025',
    title: 'New Year’s Day',
    start: moment('2025-01-01').toDate(),
    end: moment('2025-01-01').toDate(),
    type: 'optional',
    description: 'New Year’s Day',
    isIndianHoliday: true,
  },
  {
    id: 'republic-day-2025',
    title: 'Republic Day',
    start: moment('2025-01-26').toDate(),
    end: moment('2025-01-26').toDate(),
    type: 'national',
    description: 'Republic Day',
    isIndianHoliday: true,
  },
  {
    id: 'maha-shivaratri-2025',
    title: 'Maha Shivaratri',
    start: moment('2025-02-26').toDate(),
    end: moment('2025-02-26').toDate(),
    type: 'optional',
    description: 'Maha Shivaratri',
    isIndianHoliday: true,
  },
  {
    id: 'holi-2025',
    title: 'Holi',
    start: moment('2025-03-14').toDate(),
    end: moment('2025-03-14').toDate(),
    type: 'optional',
    description: 'Holi / Festival of Colors',
    isIndianHoliday: true,
  },
  {
    id: 'ugadi-2025',
    title: 'Ugadi / Gudi Padwa / Chetichand',
    start: moment('2025-03-30').toDate(),
    end: moment('2025-03-30').toDate(),
    type: 'optional',
    description: 'Regional New Year festival',
    isIndianHoliday: true,
  },
 
  {
    id: 'ram-navami-2025',
    title: 'Ram Navami',
    start: moment('2025-04-06').toDate(),
    end: moment('2025-04-06').toDate(),
    type: 'optional',
    description: 'Lord Rama’s Birth',
    isIndianHoliday: true,
  },
  {
    id: 'mahavir-jayanti-2025',
    title: 'Mahavir Jayanti',
    start: moment('2025-04-10').toDate(),
    end: moment('2025-04-10').toDate(),
    type: 'optional',
    description: 'Mahavir Jayanti',
    isIndianHoliday: true,
  },
  {
    id: 'ambedkar-jayanti-2025',
    title: 'Dr B R Ambedkar Jayanti',
    start: moment('2025-04-14').toDate(),
    end: moment('2025-04-14').toDate(),
    type: 'optional',
    description: 'Ambedkar Jayanti / Tamil New Year in some states',
    isIndianHoliday: true,
  },
  {
    id: 'good-friday-2025',
    title: 'Good Friday',
    start: moment('2025-04-18').toDate(),
    end: moment('2025-04-18').toDate(),
    type: 'optional',
    description: 'Good Friday',
    isIndianHoliday: true,
  },
  {
    id: 'buddha-purnima-2025',
    title: 'Buddha Purnima',
    start: moment('2025-05-12').toDate(),
    end: moment('2025-05-12').toDate(),
    type: 'optional',
    description: 'Buddha Purnima',
    isIndianHoliday: true,
  },
  {
    id: 'eid-ul-adha-2025',
    title: 'Eid-ul-Adha (Bakrid)',
    start: moment('2025-06-07').toDate(),
    end: moment('2025-06-07').toDate(),
    type: 'optional',
    description: 'Bakrid / Festival of Sacrifice',
    isIndianHoliday: true,
  },
  {
    id: 'independence-day-2025',
    title: 'Independence Day',
    start: moment('2025-08-15').toDate(),
    end: moment('2025-08-15').toDate(),
    type: 'national',
    description: 'Independence Day of India',
    isIndianHoliday: true,
  },
  {
    id: 'dussehra-2025',
    title: 'Dussehra / Vijayadashami',
    start: moment('2025-10-02').toDate(),
    end: moment('2025-10-02').toDate(),
    type: 'optional',
    description: 'Dussehra / Festival of Victory',
    isIndianHoliday: true,
  },
  {
    id: 'gandhi-jayanti-2025',
    title: 'Gandhi Jayanti',
    start: moment('2025-10-02').toDate(),
    end: moment('2025-10-02').toDate(),
    type: 'national',
    description: 'Mahatma Gandhi’s Birth Anniversary',
    isIndianHoliday: true,
  },
  {
    id: 'diwali-2025',
    title: 'Diwali (Deepawali)',
    start: moment('2025-10-20').toDate(),
    end: moment('2025-10-20').toDate(),
    type: 'optional',
    description: 'Diwali / Festival of Lights',
    isIndianHoliday: true,
  },
  
  {
    id: 'christmas-2025',
    title: 'Christmas Day',
    start: moment('2025-12-25').toDate(),
    end: moment('2025-12-25').toDate(),
    type: 'national',
    description: 'Christmas',
    isIndianHoliday: true,
  },
];


// Generate holidays for multiple years
export const generateIndianHolidays = (startYear: number, endYear: number): HolidayEvent[] => {
  const holidays: HolidayEvent[] = [];
  
  for (let year = startYear; year <= endYear; year++) {
    indianNationalHolidays.forEach(holiday => {
      const newHoliday: HolidayEvent = {
        ...holiday,
        id: `${holiday.id}-${year}`,
        start: moment(holiday.start).year(year).toDate(),
        end: moment(holiday.end).year(year).toDate(),
      };
      holidays.push(newHoliday);
    });
  }
  
  return holidays;
};
