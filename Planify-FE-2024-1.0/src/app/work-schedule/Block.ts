export class Block {
  blockName: string;
  startHour: string;
  endHour: string;

  constructor(blockName: string, startHour: string, endHour: string) {
    this.blockName = blockName;
    this.startHour = startHour;
    this.endHour = endHour;
  }
}
