/*
 * ComiXed - A digital comic book library management application.
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
 * along with this program. If not, see <http://www.gnu.org/licenses>
 */

package org.comixed.repositories.library;

import java.util.List;
import org.comixed.model.comic.Comic;
import org.comixed.model.user.ComiXedUser;
import org.comixed.model.user.LastReadDate;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

public interface LastReadDatesRepository extends CrudRepository<LastReadDate, Long> {
  List<LastReadDate> findAllForUser(@Param("userId") long userId);

  List<LastReadDate> findByComicInAndUserIn(List<Comic> comics, ComiXedUser user);
}
