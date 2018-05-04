export class Page {
  id: number;
  comic_id: number;
  filename: string;
  hash: string;
  deleted: boolean;

  constructor(
    id: number,
    comic_id: number,
    filename: string,
    hash: string,
    deleted: boolean
  ) {
    this.id = id;
    this.comic_id = comic_id;
    this.filename = filename;
    this.hash = hash;
    this.deleted = deleted;
  }
}
