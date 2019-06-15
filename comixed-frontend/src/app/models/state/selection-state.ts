import { Comic } from 'app/models/comics/comic';
import { ComicFile } from 'app/models/import/comic-file';

export interface SelectionState {
  selected_comics: Comic[];
  selected_comic_files: ComicFile[];
}
