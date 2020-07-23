/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2018, The ComiXed Project.
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

package org.comixedproject.adaptors;

import org.comixedproject.model.comic.Comic;
import org.springframework.stereotype.Component;

@Component
public class ComicDataAdaptor {
  /**
   * Clears all metadata scraped from a remove database.
   *
   * @param comic the comic
   */
  public void clear(Comic comic) {
    comic.setComicVineId("");
    comic.setComicVineURL("");
    comic.setPublisher("");
    comic.setImprint("");
    comic.setSeries("");
    comic.setCoverDate(null);
    comic.setVolume("");
    comic.setIssueNumber("");
    comic.setTitle("");
    comic.setDescription("");
    comic.setNotes("");
    comic.setSummary("");
    comic.getStoryArcs().clear();
    comic.getTeams().clear();
    comic.getCharacters().clear();
    comic.getLocations().clear();
    comic.getCredits().clear();
  }
}
