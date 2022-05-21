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

package org.comixedproject.rest.metadata;

import com.fasterxml.jackson.annotation.JsonView;
import java.util.List;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.auditlog.rest.AuditableRestEndpoint;
import org.comixedproject.metadata.MetadataException;
import org.comixedproject.metadata.model.IssueMetadata;
import org.comixedproject.metadata.model.VolumeMetadata;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.metadata.MetadataAuditLogEntry;
import org.comixedproject.model.net.metadata.LoadIssueMetadataRequest;
import org.comixedproject.model.net.metadata.LoadVolumeMetadataRequest;
import org.comixedproject.model.net.metadata.ScrapeComicRequest;
import org.comixedproject.service.metadata.MetadataCacheService;
import org.comixedproject.service.metadata.MetadataService;
import org.comixedproject.views.View;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * <code>MetadataController</code> processes REST APIs relating to comic metadata events.
 *
 * @author Darryl L. Pierce
 */
@RestController
@Log4j2
public class MetadataController {
  @Autowired private MetadataService metadataService;
  @Autowired private MetadataCacheService metadataCacheService;

  /**
   * Retrieves a single {@link IssueMetadata} for the specified issue of the given volume and issue
   * number.
   *
   * @param sourceId the metadata source id
   * @param volume the volume id
   * @param issue the issue number
   * @param request the request body
   * @return the issue
   * @throws MetadataException if an error occurs
   */
  @PostMapping(
      value = "/api/metadata/sources/{sourceId}/volumes/{volumeId}/issues/{issueId}",
      produces = MediaType.APPLICATION_JSON_VALUE,
      consumes = MediaType.APPLICATION_JSON_VALUE)
  @PreAuthorize("hasRole('ADMIN')")
  @AuditableRestEndpoint(logRequest = true, logResponse = true)
  public IssueMetadata loadScrapingIssue(
      @PathVariable("sourceId") final Long sourceId,
      @PathVariable("volumeId") final Integer volume,
      @PathVariable("issueId") final String issue,
      @RequestBody() final LoadIssueMetadataRequest request)
      throws MetadataException {
    boolean skipCache = request.isSkipCache();
    log.info("Getting scraping issue");
    return this.metadataService.getIssue(sourceId, volume, issue, skipCache);
  }

  /**
   * Retrieves the list of potential volumes for the given series name.
   *
   * @param sourceId the metadata source id
   * @param request the reqwuest body
   * @return the list of volumes
   * @throws MetadataException if an error occurs
   */
  @PostMapping(
      value = "/api/metadata/sources/{sourceId}/volumes",
      produces = MediaType.APPLICATION_JSON_VALUE,
      consumes = MediaType.APPLICATION_JSON_VALUE)
  @PreAuthorize("hasRole('ADMIN')")
  @AuditableRestEndpoint(logRequest = true, logResponse = true)
  public List<VolumeMetadata> loadScrapingVolumes(
      @PathVariable("sourceId") final Long sourceId,
      @RequestBody() final LoadVolumeMetadataRequest request)
      throws MetadataException {
    String series = request.getSeries();
    final int maxRecords = request.getMaxRecords();
    boolean skipCache = request.getSkipCache();

    log.info(
        "Getting scraping volumes: sourceId={} series={} maxRecords={} skipCache={}",
        sourceId,
        series,
        maxRecords,
        skipCache);

    return this.metadataService.getVolumes(sourceId, series, maxRecords, skipCache);
  }

  /**
   * Scrapes a single {@link ComicBook} using the specified source issue.
   *
   * @param sourceId the metadata source id
   * @param comicId the comic id
   * @param request the request body
   * @return the scraped and updated {@link ComicBook}
   * @throws MetadataException if an error occurs
   */
  @PostMapping(
      value = "/api/metadata/sources/{sourceId}/comics/{comicId}",
      produces = MediaType.APPLICATION_JSON_VALUE,
      consumes = MediaType.APPLICATION_JSON_VALUE)
  @PreAuthorize("hasRole('ADMIN')")
  @AuditableRestEndpoint(
      logRequest = true,
      logResponse = true,
      responseView = View.ComicDetailsView.class)
  @JsonView(View.ComicDetailsView.class)
  public ComicBook scrapeComic(
      @PathVariable("sourceId") final Long sourceId,
      @PathVariable("comicId") final Long comicId,
      @RequestBody() final ScrapeComicRequest request)
      throws MetadataException {
    boolean skipCache = request.getSkipCache();
    Integer issueId = request.getIssueId();
    log.info("Scraping comic");
    return this.metadataService.scrapeComic(sourceId, comicId, issueId, skipCache);
  }

  /**
   * Loads all metadata audit log entries.
   *
   * @return the list of entries
   */
  @GetMapping(value = "/api/metadata/log", produces = MediaType.APPLICATION_JSON_VALUE)
  @JsonView(View.MetadataAuditLogEntryList.class)
  @PreAuthorize("hasRole('ADMIN')")
  public List<MetadataAuditLogEntry> loadAuditLog() {
    log.info("Loading metadata audit log");
    return this.metadataService.loadAuditLogEntries();
  }

  /** Clears the metadata audit log. */
  @DeleteMapping(value = "/api/metadata/log")
  @PreAuthorize("hasRole('ADMIN')")
  public void clearAuditLog() {
    log.info("Clearing metadata audit log");
    this.metadataService.clearAuditLog();
  }

  /** Initiates clearing the metadata cache. */
  @DeleteMapping(value = "/api/metadata/cache")
  @PreAuthorize("hasRole('ADMIN')")
  @AuditableRestEndpoint
  public void clearCache() {
    log.info("Clearing the metadata cache");
    this.metadataCacheService.clearCache();
  }
}
