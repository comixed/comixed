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
import io.micrometer.core.annotation.Timed;
import java.util.List;
import lombok.NonNull;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.batch.metadata.MetadataProcessConfiguration;
import org.comixedproject.metadata.MetadataException;
import org.comixedproject.metadata.model.IssueMetadata;
import org.comixedproject.metadata.model.VolumeMetadata;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.net.metadata.LoadIssueMetadataRequest;
import org.comixedproject.model.net.metadata.LoadVolumeMetadataRequest;
import org.comixedproject.model.net.metadata.ScrapeComicRequest;
import org.comixedproject.model.net.metadata.StartMetadataUpdateProcessRequest;
import org.comixedproject.service.comicbooks.ComicBookException;
import org.comixedproject.service.comicbooks.ComicBookService;
import org.comixedproject.service.metadata.MetadataCacheService;
import org.comixedproject.service.metadata.MetadataService;
import org.comixedproject.views.View;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.JobParametersBuilder;
import org.springframework.batch.core.JobParametersInvalidException;
import org.springframework.batch.core.launch.JobLauncher;
import org.springframework.batch.core.repository.JobExecutionAlreadyRunningException;
import org.springframework.batch.core.repository.JobInstanceAlreadyCompleteException;
import org.springframework.batch.core.repository.JobRestartException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
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
  @Autowired private ComicBookService comicBookService;

  @Autowired
  @Qualifier("batchJobLauncher")
  private JobLauncher jobLauncher;

  @Autowired
  @Qualifier("updateComicBookMetadata")
  private Job updateComicBookMetadata;

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
  @Timed(value = "comixed.metadata.load-issue")
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
  @Timed(value = "comixed.metadata.load-volumes")
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
  @Timed(value = "comixed.metadata.scrape-comic")
  @JsonView(View.ComicDetailsView.class)
  public ComicBook scrapeComic(
      @PathVariable("sourceId") final Long sourceId,
      @PathVariable("comicId") final Long comicId,
      @RequestBody() final ScrapeComicRequest request)
      throws MetadataException {
    boolean skipCache = request.getSkipCache();
    String issueId = request.getIssueId();
    log.info("Scraping comic");
    return this.metadataService.scrapeComic(sourceId, comicId, issueId, skipCache);
  }

  /**
   * Initiates a metadata update batch process of the provided comic book IDs.
   *
   * @param request the request body
   * @throws ComicBookException if an id is invalid
   */
  @PostMapping(value = "/api/metadata/batch", consumes = MediaType.APPLICATION_JSON_VALUE)
  @PreAuthorize("hasRole('ADMIN')")
  @Timed(value = "comixed.metadata.batch-update")
  public void startBatchMetadataUpdate(
      @RequestBody() final StartMetadataUpdateProcessRequest request)
      throws ComicBookException, JobInstanceAlreadyCompleteException,
          JobExecutionAlreadyRunningException, JobParametersInvalidException, JobRestartException {
    log.info("Starting batch metadata update process");
    @NonNull final List<Long> ids = request.getIds();
    @NonNull final Boolean skipCache = request.getSkipCache();
    log.trace(
        "Marking {} comic book{} for batch metadadata update",
        ids.size(),
        ids.size() == 1 ? "" : "s");
    this.comicBookService.markComicBooksForBatchMetadataUpdate(ids);
    log.trace("Launching add comics process");
    this.jobLauncher.run(
        updateComicBookMetadata,
        new JobParametersBuilder()
            .addLong(
                MetadataProcessConfiguration.PARAM_METADATA_UPDATE_STARTED,
                System.currentTimeMillis())
            .addString(MetadataProcessConfiguration.PARAM_SKIP_CACHE, String.valueOf(skipCache))
            .toJobParameters());
  }

  /** Initiates clearing the metadata cache. */
  @DeleteMapping(value = "/api/metadata/cache")
  @PreAuthorize("hasRole('ADMIN')")
  @Timed(value = "comixed.metadata.clear-cache")
  public void clearCache() {
    log.info("Clearing the metadata cache");
    this.metadataCacheService.clearCache();
  }
}
