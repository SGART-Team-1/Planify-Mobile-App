export class Meeting {
  id: any;
  title: string;
  startDate: Date;
  endDate: Date;
  allDay: boolean;
  role: string;
  // isOrganizer: boolean | undefined; // true si es organizador, false si es asistente
  color?: any;

  constructor(
    id: any,
    title: string,
    startDate: Date,
    endDate: Date,
    allDay: boolean,
    role: string
    // isOrganizer: boolean
  ) {
    this.id = id;
    this.title = title;
    this.startDate = startDate;
    this.endDate = endDate;
    this.allDay = allDay;
    this.role = role;
    //this.role = role;
    // this.color = isOrganizer ? '#00ff00' : '#0000ff';
  }
}
