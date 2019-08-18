import { Comic } from 'app/library';
import { ComicFile } from 'app/models/import/comic-file';

export interface SelectionState {
  selected_comics: Comic[];
  selected_comic_files: ComicFile[];
}
