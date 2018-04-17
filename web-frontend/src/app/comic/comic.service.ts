import {Injectable} from '@angular/core';

import {Http, Response} from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import {Observable} from 'rxjs/Observable';

import {Comic} from './comic';

@Injectable()
export class ComicService {

  private apiUrl = 'http://localhost:7171';

  constructor(private http: Http) {}

  findAll(): Observable<Comic[]> {
    return this.http.get(this.apiUrl + "/comics")
      .map((res: Response) => res.json())
      .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
  }

  getComicCount(): Observable<number> {
    return this.http.get(this.apiUrl + "/comics/count")
      .map((res: Response) => res.json())
      .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
  }
}
