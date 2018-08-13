/*
 * ComixEd - A digital comic book library management application.
 * Copyright (C) 2018, The ComiXed Project
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.package
 * org.comixed;
 */

import {Injectable} from '@angular/core';
import {
  HttpClient,
  HttpParams,
} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';

import {AlertService} from './alert.service';

@Injectable()
export class UserService {
  private api_url = '/api';
  constructor(
    private http: HttpClient,
    private alert_service: AlertService,
  ) {}

  get_user_preference(name: String): Observable<any> {
    return this.http.get(`${this.api_url}/user/property?name=${name}`);
  }

  set_user_preference(name: string, value: string): void {
    const params = new HttpParams().set('name', name).set('value', value);
    this.http.post(`${this.api_url}/user/property`, params).subscribe(
      (response: Response) => {
        console.log('Preference saved: ' + name + '=' + value);
      },
      (error: Error) => {
        this.alert_service.show_error_message('Failed to set user preference: ' + name + '=' + value, error);
      }
    );
  }
}
