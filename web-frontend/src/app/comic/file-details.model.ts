export class FileDetails {
  filename: string;
  size: number;
  selected: boolean;

  constructor(
    filename: string,
    size: number,
  ) {
    this.filename = filename;
    this.size = size;
    this.selected = false;
    console.log('Created a FileDetails object for ', this.filename);
  }
  
  toggleSelected(): void {
    this.selected = !this.selected;
    console.log(this.filename, " is now ", (this.selected ? "" : "not"), " selected");
  }
}
