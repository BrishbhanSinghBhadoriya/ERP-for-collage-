declare module 'react-big-calendar' {
  import { ComponentType } from 'react';
  
  export type View = 'month' | 'week' | 'day' | 'agenda';
  
  export interface CalendarProps {
    localizer: any;
    events: any[];
    startAccessor: string;
    endAccessor: string;
    style?: React.CSSProperties;
    view?: View;
    onView?: (view: View) => void;
    date?: Date;
    onNavigate?: (date: Date) => void;
    defaultDate?: Date;
    scrollToTime?: Date;
    eventPropGetter?: (event: any) => any;
    onSelectEvent?: (event: any) => void;
    onSelectSlot?: (slotInfo: any) => void;
    selectable?: boolean;
    popup?: boolean;
    showMultiDayTimes?: boolean;
  }
  
  export const Calendar: ComponentType<CalendarProps>;
  export const momentLocalizer: (moment: any) => any;
  export const Views: {
    MONTH: View;
    WEEK: View;
    DAY: View;
    AGENDA: View;
  };
}
