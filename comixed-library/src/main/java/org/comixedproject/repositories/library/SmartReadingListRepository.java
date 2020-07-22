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

package org.comixedproject.repositories.library;

import java.util.List;
import org.comixedproject.model.library.SmartReadingList;
import org.comixedproject.model.user.ComiXedUser;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SmartReadingListRepository extends CrudRepository<SmartReadingList, Long> {
  @Query("SELECT list FROM SmartReadingList list WHERE list.owner = :owner")
  List<SmartReadingList> findAllSmartReadingListsForUser(ComiXedUser owner);

  @Query(
      "SELECT list FROM SmartReadingList list WHERE list.owner = :owner AND list.name = :listName")
  SmartReadingList findSmartReadingListForUser(ComiXedUser owner, String listName);
}
