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

package org.comixedproject.rest.metadata;

import com.fasterxml.jackson.annotation.JsonView;
import java.util.List;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.metadata.MetadataSource;
import org.comixedproject.service.metadata.MetadataSourceException;
import org.comixedproject.service.metadata.MetadataSourceService;
import org.comixedproject.views.View;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * <code>MetadataSourceController</code> provides endpoints for working with comic metadata sources.
 *
 * @author Darryl L. Pierce
 */
@RestController
@Log4j2
public class MetadataSourceController {
  @Autowired private MetadataSourceService metadataSourceService;

  /**
   * Retrieves the list of metadata sources.
   *
   * @return the sources
   */
  @GetMapping(value = "/api/metadata/sources", produces = MediaType.APPLICATION_JSON_VALUE)
  @PreAuthorize("hasRole('ADMIN')")
  @JsonView(View.MetadataSourceList.class)
  public List<MetadataSource> loadMetadataSources() {
    log.info("Loading metadata source list");
    return this.metadataSourceService.loadMetadataSources();
  }

  /**
   * Creates a new metadata source.
   *
   * @param source the new source
   * @return the saved source
   * @throws MetadataSourceException if an error occurs
   */
  @PostMapping(
      value = "/api/metadata/sources",
      produces = MediaType.APPLICATION_JSON_VALUE,
      consumes = MediaType.APPLICATION_JSON_VALUE)
  @PreAuthorize("hasRole('ADMIN')")
  @JsonView(View.MetadataSourceDetail.class)
  public MetadataSource create(@RequestBody() final MetadataSource source)
      throws MetadataSourceException {
    log.info("Saving new metadata source: {}", source.getName());
    return this.metadataSourceService.create(source);
  }

  /**
   * Loads an existing metadata source.
   *
   * @param id the record id
   * @return the saved source
   * @throws MetadataSourceException if an error occurs
   */
  @GetMapping(value = "/api/metadata/sources/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
  @PreAuthorize("hasRole('ADMIN')")
  @JsonView(View.MetadataSourceDetail.class)
  public MetadataSource getOne(@PathVariable("id") final Long id) throws MetadataSourceException {
    log.info("Getting metadata source: id={}", id);
    return this.metadataSourceService.getById(id);
  }

  /**
   * Updates an existing metadata source.
   *
   * @param id the record id
   * @param source the updated source
   * @return the saved source
   * @throws MetadataSourceException if an error occurs
   */
  @PutMapping(
      value = "/api/metadata/sources/{id}",
      produces = MediaType.APPLICATION_JSON_VALUE,
      consumes = MediaType.APPLICATION_JSON_VALUE)
  @PreAuthorize("hasRole('ADMIN')")
  @JsonView(View.MetadataSourceDetail.class)
  public MetadataSource update(
      @PathVariable("id") final Long id, @RequestBody() final MetadataSource source)
      throws MetadataSourceException {
    log.info("Updating metadata source: id={}", id);
    return this.metadataSourceService.update(id, source);
  }

  /**
   * Deletes the metadata source with the given record id.
   *
   * @param id the record id
   * @throws MetadataSourceException if an error occurs
   */
  @DeleteMapping(value = "/api/metadata/sources/{id}")
  @PreAuthorize("hasRole('ADMIN')")
  public void delete(@PathVariable("id") final Long id) throws MetadataSourceException {
    log.info("Deleting metadata source: id={}", id);
    this.metadataSourceService.delete(id);
  }
}
