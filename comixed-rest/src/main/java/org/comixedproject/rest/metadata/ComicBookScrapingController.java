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

import static org.comixedproject.rest.comicbooks.ComicBookSelectionController.LIBRARY_SELECTIONS;

import com.fasterxml.jackson.annotation.JsonView;
import io.micrometer.core.annotation.Timed;
import jakarta.servlet.http.HttpSession;
import java.util.List;
import java.util.stream.Collectors;
import lombok.NonNull;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.batch.metadata.MetadataProcessConfiguration;
import org.comixedproject.metadata.MetadataException;
import org.comixedproject.metadata.model.IssueMetadata;
import org.comixedproject.metadata.model.VolumeMetadata;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.net.metadata.*;
import org.comixedproject.service.comicbooks.ComicBookSelectionException;
import org.comixedproject.service.comicbooks.ComicBookSelectionService;
import org.comixedproject.service.comicbooks.ComicBookService;
import org.comixedproject.service.metadata.MetadataCacheService;
import org.comixedproject.service.metadata.MetadataService;
import org.comixedproject.views.View;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.JobParametersBuilder;
import org.springframework.batch.core.launch.JobLauncher;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * <code>ComicBookScrapingController</code> processes REST APIs relating to comic metadata events.
 *
 * @author Darryl L. Pierce
 */
@RestController
@Log4j2
public class ComicBookScrapingController {
  static final String MULTI_BOOK_SCRAPING_SELECTIONS = "multi-book.selections";

  @Autowired private MetadataService metadataService;
  @Autowired private MetadataCacheService metadataCacheService;
  @Autowired private ComicBookService comicBookService;
  @Autowired private ComicBookSelectionService comicBookSelectionService;

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
      @PathVariable("volumeId") final String volume,
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
  @PutMapping(
      value = "/api/metadata/sources/{sourceId}/comics/single/{comicId}",
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
   * @param session the session
   * @param request the request body
   * @throws Exception if an id is invalid
   */
  @PostMapping(value = "/api/metadata/batch/start", consumes = MediaType.APPLICATION_JSON_VALUE)
  @PreAuthorize("hasRole('ADMIN')")
  @Timed(value = "comixed.metadata.batch-update")
  public void startBatchMetadataUpdate(
      final HttpSession session, @RequestBody() final StartMetadataUpdateProcessRequest request)
      throws Exception {
    log.info("Starting batch metadata update process");
    @NonNull
    final List<Long> selectedComicBookIdList =
        this.comicBookSelectionService.decodeSelections(session.getAttribute(LIBRARY_SELECTIONS));
    @NonNull final Boolean skipCache = request.getSkipCache();
    log.trace(
        "Marking {} comic book{} for batch metadadata update",
        selectedComicBookIdList.size(),
        selectedComicBookIdList.size() == 1 ? "" : "s");
    this.comicBookService.markComicBooksForBatchMetadataUpdate(selectedComicBookIdList);
    log.trace("Launching add comics process");
    this.jobLauncher.run(
        updateComicBookMetadata,
        new JobParametersBuilder()
            .addLong(
                MetadataProcessConfiguration.PARAM_METADATA_UPDATE_STARTED,
                System.currentTimeMillis())
            .addString(MetadataProcessConfiguration.PARAM_SKIP_CACHE, String.valueOf(skipCache))
            .toJobParameters());
    this.comicBookSelectionService.clearSelectedComicBooks(selectedComicBookIdList);
    session.setAttribute(
        LIBRARY_SELECTIONS,
        this.comicBookSelectionService.encodeSelections(selectedComicBookIdList));
  }

  /** Initiates clearing the metadata cache. */
  @DeleteMapping(value = "/api/metadata/cache")
  @PreAuthorize("hasRole('ADMIN')")
  @Timed(value = "comixed.metadata.clear-cache")
  public void clearCache() {
    log.info("Clearing the metadata cache");
    this.metadataCacheService.clearCache();
  }

  /**
   * Fetches the issues for a given series from a given metadata source.
   *
   * @param sourceId the metadata source id
   * @param request the request body
   * @throws MetadataException if an error occurs
   */
  @PostMapping(
      value = "/api/metadata/sources/{sourceId}/series/issues",
      consumes = MediaType.APPLICATION_JSON_VALUE)
  @PreAuthorize("hasRole('ADMIN')")
  @Timed(value = "comixed.metadata.fetch-issues")
  public void fetchIssuesForSeries(
      @PathVariable("sourceId") final Long sourceId,
      @RequestBody() final FetchIssuesForSeriesRequest request)
      throws MetadataException {
    final String volumeId = request.getVolumeId();
    log.info("Fetching issues for series: metadata source={} volume={}", sourceId, volumeId);
    this.metadataService.fetchIssuesForSeries(sourceId, volumeId);
  }

  /**
   * Starts, or returns, the multi-book comic scraping state.
   *
   * @param session the session
   * @return the scraping state
   * @throws MetadataException if an error occurs
   */
  @PutMapping(
      value = "/api/metadata/scraping/selected",
      consumes = MediaType.APPLICATION_JSON_VALUE)
  @PreAuthorize("hasRole('ADMIN')")
  @Timed(value = "comixed.metadata.multi-book-start")
  @JsonView(View.ComicListView.class)
  public StartMultiBookScrapingResponse startMultiBookScraping(final HttpSession session)
      throws MetadataException {
    try {
      final List selectedIds =
          this.comicBookSelectionService.decodeSelections(session.getAttribute(LIBRARY_SELECTIONS));
      final List comicDetailIds =
          this.comicBookSelectionService.decodeSelections(
              session.getAttribute(MULTI_BOOK_SCRAPING_SELECTIONS));

      if (!selectedIds.isEmpty()) {
        comicDetailIds.addAll(selectedIds);

        this.comicBookSelectionService.clearSelectedComicBooks(selectedIds);
        session.setAttribute(
            LIBRARY_SELECTIONS, this.comicBookSelectionService.encodeSelections(selectedIds));
      }

      session.setAttribute(
          MULTI_BOOK_SCRAPING_SELECTIONS,
          this.comicBookSelectionService.encodeSelections(comicDetailIds));

      return new StartMultiBookScrapingResponse(
          this.comicBookService.loadByComicDetailId(comicDetailIds));
    } catch (ComicBookSelectionException error) {
      throw new MetadataException("Failed to start multi-book scraping", error);
    }
  }

  @PostMapping(
      value = "/api/metadata/sources/{metadataSourceId}/comics/multi/{comicBookId}",
      consumes = MediaType.APPLICATION_JSON_VALUE)
  @PreAuthorize("hasRole('ADMIN')")
  @Timed(value = "comixed.metadata.multi-book-scrape")
  @JsonView(View.ComicListView.class)
  public StartMultiBookScrapingResponse scrapeMultiBookComic(
      final HttpSession session,
      @RequestBody() final ScrapeComicRequest request,
      @PathVariable("metadataSourceId") final long metadataSourceId,
      @PathVariable("comicBookId") final long comicBookId)
      throws MetadataException {
    final String issueId = request.getIssueId();
    final Boolean skipCache = request.getSkipCache();
    log.info(
        "Scraping multi-book comic: id={} source id={} issue id={} skip cache={}",
        comicBookId,
        metadataSourceId,
        issueId,
        skipCache);
    this.metadataService.scrapeComic(metadataSourceId, comicBookId, issueId, skipCache);

    try {
      log.debug("Removing comic book from multi-book state");
      return this.doRemoveComicBook(session, comicBookId);
    } catch (ComicBookSelectionException error) {
      throw new MetadataException("Failed to remove comic from multi-book state", error);
    }
  }

  @DeleteMapping(
      value = "/api/metadata/scraping/{comicBookId}",
      produces = MediaType.APPLICATION_JSON_VALUE)
  @PreAuthorize("hasRole('ADMIN')")
  @Timed(value = "comixed.metadata.multi-book-remove")
  @JsonView(View.ComicListView.class)
  public StartMultiBookScrapingResponse removeMultiBookComic(
      final HttpSession session, @PathVariable("comicBookId") final long comicBookId)
      throws MetadataException {
    try {
      return this.doRemoveComicBook(session, comicBookId);
    } catch (ComicBookSelectionException error) {
      throw new MetadataException("Failed to remove comic book from multi-book scraping", error);
    }
  }

  private StartMultiBookScrapingResponse doRemoveComicBook(
      final HttpSession session, final long comicBookId) throws ComicBookSelectionException {
    final List comicDetailIds =
        this.comicBookSelectionService.decodeSelections(
            session.getAttribute(MULTI_BOOK_SCRAPING_SELECTIONS));
    final List<ComicBook> comicBooks =
        this.comicBookService.loadByComicDetailId(comicDetailIds).stream()
            .filter(comicBook -> !comicBook.getId().equals(comicBookId))
            .collect(Collectors.toList());
    session.setAttribute(
        MULTI_BOOK_SCRAPING_SELECTIONS,
        this.comicBookSelectionService.encodeSelections(
            comicBooks.stream()
                .map(comicBook -> comicBook.getComicDetail().getId())
                .collect(Collectors.toList())));

    return new StartMultiBookScrapingResponse(comicBooks);
  }
}
