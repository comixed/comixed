
import {of as observableOf, Observable} from 'rxjs';


export class MockComicService {
  library_comic_count = 0;

  get_library_comic_count(): Observable<any> {
    return observableOf(this.library_comic_count);
  }
}
