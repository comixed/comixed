export class Comic {

  id: number;
  filename: string;
  series: string;
  volume: string;
  issueNumber: string;
  publisher: string;

  constructor(id: number, filename: string, series: string, volume: string, issueNumber: string, publisher: string) {
    this.id = id;
    this.filename = filename;
    this.series = series;
    this.volume = volume;
    this.issueNumber = issueNumber;
    this.publisher = publisher;
  }
}
