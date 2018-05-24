export class Page {
  id: number;
  comic_id: number;
  filename: string;
  width: number;
  height: number;
  hash: string;
  deleted: boolean;

  constructor(
    id: number,
    comic_id: number,
    filename: string,
    width: number,
    height: number,
    hash: string,
    deleted: boolean
  ) {
    this.id = id;
    this.comic_id = comic_id;
    this.filename = filename;
    this.width = width;
    this.height = height;
    this.hash = hash;
    this.deleted = deleted;
  }
}
