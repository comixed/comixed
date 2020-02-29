/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2019, The ComiXed Project
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
 * along with this program. If not, see <http://www.gnu.org/licenses>
 */

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { interpolate } from 'app/app.functions';
import {
  DELETE_USER_URL,
  GET_USERS_URL,
  SAVE_NEW_USER_URL,
  SAVE_USER_URL
} from 'app/user/user.constants';
import { User } from 'app/user';
import { SaveUserDetails } from 'app/user/models/save-user-details';

@Injectable({
  providedIn: 'root'
})
export class UserAdminService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<any> {
    return this.http.get(interpolate(GET_USERS_URL));
  }

  save(details: SaveUserDetails): Observable<any> {
    const encoded = {
      email: details.email,
      password: details.password,
      isAdmin: details.isAdmin
    };
    if (!details.id) {
      return this.http.post(interpolate(SAVE_NEW_USER_URL), encoded);
    } else {
      return this.http.put(
        interpolate(SAVE_USER_URL, { id: details.id }),
        encoded
      );
    }
  }

  deleteUser(user: User): Observable<any> {
    return this.http.delete(interpolate(DELETE_USER_URL, { id: user.id }));
  }
}
