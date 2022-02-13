/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2022, The ComiXed Project
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

package org.comixedproject.service.metadata;

import java.util.List;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.metadata.MetadataSource;
import org.comixedproject.repositories.metadata.MetadataSourceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * <code>MetadataSourceService</code> provides business logic for working with instances of {@link
 * MetadataSource}.
 *
 * @author Darryl L. Pierce
 */
@Service
@Log4j2
public class MetadataSourceService {
  @Autowired private MetadataSourceRepository metadataSourceRepository;

  /**
   * Retrieves the list of metadata sources.
   *
   * @return the sources
   */
  public List<MetadataSource> loadMetadataSources() {
    log.trace("Loading all metadata sources");
    return this.metadataSourceRepository.loadMetadataSources();
  }

  /**
   * Loads a single metadata source by record id.
   *
   * @param id the record id
   * @return the source
   * @throws MetadataSourceException if the id is invalid
   */
  public MetadataSource getById(final long id) throws MetadataSourceException {
    log.debug("Loading metadata source: id={}", id);
    final MetadataSource result = this.metadataSourceRepository.getById(id);
    if (result == null) throw new MetadataSourceException("No such metadata source: id=" + id);
    return result;
  }
}
