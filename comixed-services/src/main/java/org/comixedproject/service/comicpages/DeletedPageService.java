/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2023, The ComiXed Project
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

package org.comixedproject.service.comicpages;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.comicpages.DeletedPage;
import org.comixedproject.repositories.comicpages.PageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * <code>DeletedPageService</code> provides methods for working with instances of {@link
 * DeletedPage}.
 *
 * @author Darryl L. Pierce
 */
@Service
@Log4j2
public class DeletedPageService {
  @Autowired private PageRepository pageRepository;

  /**
   * Returns the list of all pages marked for deletion.
   *
   * @return the deleted page list
   */
  public List<DeletedPage> loadAll() {
    log.debug("Loading all deleted pages");
    final Map<String, DeletedPage> result = new HashMap<>();
    this.pageRepository
        .loadAllDeletedPages()
        .forEach(
            deletedPageAndComic -> {
              log.trace(
                  "Processing deleted page: hash={} id={}",
                  deletedPageAndComic.getHash(),
                  deletedPageAndComic.getComicBook().getId());
              if (!result.containsKey(deletedPageAndComic.getHash())) {
                log.trace("Creating new hash entry");
                result.put(
                    deletedPageAndComic.getHash(), new DeletedPage(deletedPageAndComic.getHash()));
              }
              log.trace("Adding comic to hash entry");
              result
                  .get(deletedPageAndComic.getHash())
                  .getComics()
                  .add(deletedPageAndComic.getComicBook().getComicDetail());
            });
    return result.values().stream().toList();
  }
}
