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
import java.security.Principal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import lombok.NonNull;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.batch.metadata.MetadataProcessConfiguration;
import org.comixedproject.metadata.MetadataException;
import org.comixedproject.metadata.model.IssueMetadata;
import org.comixedproject.metadata.model.StoryMetadata;
import org.comixedproject.metadata.model.VolumeMetadata;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.net.metadata.*;
import org.comixedproject.service.comicbooks.ComicBookSelectionException;
import org.comixedproject.service.comicbooks.ComicBookService;
import org.comixedproject.service.comicbooks.ComicSelectionService;
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
  @Autowired private ComicSelectionService comicSelectionService;

  @Autowired
  @Qualifier("batchJobLauncher")
  private JobLauncher jobLauncher;

  @Autowired
  @Qualifier("updateComicBookMetadata")
  private Job updateComicBookMetadata;

  @Autowired private HttpSession httpSession;

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
    final String publisher = request.getPublisher().strip();
    boolean skipCache = request.isSkipCache();
    boolean matchPublisher = request.isMatchPublisher();

    log.info(
        "Getting scraping volumes: sourceId={} publisher={} series={} maxRecords={} skipCache={} matchPublisher={}",
        sourceId,
        series,
        maxRecords,
        skipCache,
        matchPublisher);

    return this.metadataService.getVolumes(
        sourceId, publisher, series, maxRecords, skipCache, matchPublisher);
  }

  /**
   * Scrapes a single {@link ComicBook} using the specified source issue.
   *
   * @param sourceId the metadata source id
   * @param comicId the comic id
   * @param request the request body
   * @throws MetadataException if an error occurs
   */
  @PutMapping(
      value = "/api/metadata/sources/{sourceId}/comics/single/{comicId}",
      produces = MediaType.APPLICATION_JSON_VALUE,
      consumes = MediaType.APPLICATION_JSON_VALUE)
  @PreAuthorize("hasRole('ADMIN')")
  @Timed(value = "comixed.metadata.scrape-comic")
  public void scrapeComic(
      @PathVariable("sourceId") final Long sourceId,
      @PathVariable("comicId") final Long comicId,
      @RequestBody() final ScrapeComicRequest request)
      throws MetadataException {
    boolean skipCache = request.getSkipCache();
    String issueId = request.getIssueId();
    log.info("Scraping comic");
    this.metadataService.asyncScrapeComic(sourceId, comicId, issueId, skipCache);
  }

  /**
   * Initiates a metadata update batch process of the provided comic book IDs.
   *
   * @param session the session
   * @param principal the user principal
   * @param request the request body
   * @throws Exception if an id is invalid
   */
  @PostMapping(value = "/api/metadata/batch/start", consumes = MediaType.APPLICATION_JSON_VALUE)
  @PreAuthorize("hasRole('ADMIN')")
  @Timed(value = "comixed.metadata.batch-update")
  public void startBatchMetadataUpdate(
      final HttpSession session,
      final Principal principal,
      @RequestBody() final StartMetadataUpdateProcessRequest request)
      throws Exception {
    final String email = principal.getName();
    log.info("Starting batch metadata update process: email={}", email);
    @NonNull
    final List<Long> selectedComicBookIdList =
        this.comicSelectionService.decodeSelections(session.getAttribute(LIBRARY_SELECTIONS));
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
    this.comicSelectionService.clearSelectedComicBooks(email, selectedComicBookIdList);
    session.setAttribute(
        LIBRARY_SELECTIONS, this.comicSelectionService.encodeSelections(selectedComicBookIdList));
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
   * Scrapes the metadata for a series.
   *
   * @param sourceId the metadata source id
   * @param request the request body
   * @return the scrape series response
   * @throws MetadataException if an error occurs
   */
  @PostMapping(
      value = "/api/metadata/sources/{sourceId}/series",
      consumes = MediaType.APPLICATION_JSON_VALUE)
  @PreAuthorize("hasRole('ADMIN')")
  @Timed(value = "comixed.metadata.fetch-issues")
  public ScrapeSeriesResponse scrapeSeries(
      @PathVariable("sourceId") final Long sourceId,
      @RequestBody() final ScrapeSeriesRequest request)
      throws MetadataException {
    final String originalPublisher = request.getOriginalPublisher();
    final String originalSeries = request.getOriginalSeries();
    final String originalVolume = request.getOriginalVolume();
    final String volumeId = request.getVolumeId();
    log.info(
        "Scraping series: original publisher={} origial series={} original volume={} metadata source={} volume={}",
        originalPublisher,
        originalSeries,
        originalVolume,
        sourceId,
        volumeId);
    return this.metadataService.scrapeSeries(
        originalPublisher, originalSeries, originalVolume, sourceId, volumeId);
  }

  /**
   * Starts, or returns, the multi-book comic scraping state.
   *
   * @param session the session
   * @param principal the user principal
   * @return the scraping state
   * @throws MetadataException if an error occurs
   */
  @PutMapping(
      value = "/api/metadata/scraping/selected",
      consumes = MediaType.APPLICATION_JSON_VALUE)
  @PreAuthorize("hasRole('ADMIN')")
  @Timed(value = "comixed.metadata.multi-book-start")
  @JsonView(View.ComicListView.class)
  public StartMultiBookScrapingResponse startMultiBookScraping(
      final HttpSession session,
      final Principal principal,
      @RequestBody final StartMultiBookScrapingRequest request)
      throws MetadataException {
    try {
      final String email = principal.getName();
      final List<Long> selectedIds =
          this.comicSelectionService.decodeSelections(session.getAttribute(LIBRARY_SELECTIONS));
      final List<Long> comicDetailIds =
          this.comicSelectionService.decodeSelections(
              session.getAttribute(MULTI_BOOK_SCRAPING_SELECTIONS));

      if (!selectedIds.isEmpty()) {
        comicDetailIds.addAll(selectedIds);

        this.comicSelectionService.clearSelectedComicBooks(email, selectedIds);
        session.setAttribute(
            LIBRARY_SELECTIONS, this.comicSelectionService.encodeSelections(selectedIds));
      }

      session.setAttribute(
          MULTI_BOOK_SCRAPING_SELECTIONS,
          this.comicSelectionService.encodeSelections(comicDetailIds));

      final int pageSize = request.getPageSize();
      final List<ComicBook> comicBooks =
          this.comicBookService.loadByComicBookId(comicDetailIds, pageSize, 0);

      return new StartMultiBookScrapingResponse(pageSize, 0, comicDetailIds.size(), comicBooks);
    } catch (ComicBookSelectionException error) {
      throw new MetadataException("Failed to start multi-book scraping", error);
    }
  }

  /**
   * Loads a page of multi-scraping comic books.
   *
   * @param session the user session
   * @param request the request body
   * @return the resonse body
   */
  @PostMapping(
      value = "/api/metadata/scraping/load",
      produces = MediaType.APPLICATION_JSON_VALUE,
      consumes = MediaType.APPLICATION_JSON_VALUE)
  @PreAuthorize("hasRole('ADMIN')")
  @Timed(value = "comixed.metadata.multi-book-load")
  @JsonView(View.ComicListView.class)
  public LoadMultiBookScrapingResponse loadMultiBookScrapingPage(
      final HttpSession session, @RequestBody() final LoadMultiBookScrapingRequest request)
      throws ComicBookSelectionException {
    final int pageSize = request.getPageSize();
    final int pageNumber = request.getPageNumber();

    log.info(
        "Loading a page of multi-scraping comic books: page size={} page number={}",
        pageSize,
        pageNumber);

    final List<Long> comicBookIds =
        this.comicSelectionService.decodeSelections(
            session.getAttribute(MULTI_BOOK_SCRAPING_SELECTIONS));

    final List<ComicBook> comicBooks =
        this.comicBookService.loadByComicBookId(comicBookIds, pageSize, pageNumber);

    return new LoadMultiBookScrapingResponse(pageSize, pageNumber, comicBookIds.size(), comicBooks);
  }

  /**
   * Scrapes the specified comic.
   *
   * @param session the user session
   * @param request the request body
   * @param metadataSourceId the metadata source id
   * @param comicBookId the comic book id
   * @return the response body
   * @throws MetadataException if an error occurs
   */
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
    this.metadataService.asyncScrapeComic(metadataSourceId, comicBookId, issueId, skipCache);

    try {
      log.debug("Removing comic book from multi-book state");
      return this.doRemoveComicBook(
          session, comicBookId, request.getPageSize(), request.getPageNumber());
    } catch (ComicBookSelectionException error) {
      throw new MetadataException("Failed to remove comic from multi-book state", error);
    }
  }

  /**
   * Removes a comic book from the scraping list.
   *
   * @param session the http session
   * @param comicBookId the comic book id
   * @return the response body
   * @throws MetadataException
   */
  @DeleteMapping(
      value = "/api/metadata/scraping/{comicBookId}",
      produces = MediaType.APPLICATION_JSON_VALUE)
  @PreAuthorize("hasRole('ADMIN')")
  @Timed(value = "comixed.metadata.multi-book-remove")
  @JsonView(View.ComicListView.class)
  public StartMultiBookScrapingResponse removeMultiBookComic(
      final HttpSession session,
      @PathVariable("comicBookId") final long comicBookId,
      @RequestParam(name = "pageSize", required = true) final int pageSize)
      throws MetadataException {
    try {
      return this.doRemoveComicBook(session, comicBookId, pageSize, 0);
    } catch (ComicBookSelectionException error) {
      throw new MetadataException("Failed to remove comic book from multi-book scraping", error);
    }
  }

  /**
   * Starts batch scraping comic books.
   *
   * @param session the user session
   * @param principal the user principal
   * @throws ComicBookSelectionException if an error occurs
   */
  @PostMapping(
      value = "/api/metadata/scraping/selected/batch",
      consumes = MediaType.APPLICATION_JSON_VALUE)
  @PreAuthorize("hasRole('ADMIN')")
  @Timed(value = "comixed.metadata.batch-scrape-selected")
  public void batchScrapeSelected(final HttpSession session, final Principal principal)
      throws ComicBookSelectionException {
    final String email = principal.getName();
    log.info("Preparing to batch scrape selected comic books: email={}", email);
    final List<Long> ids =
        this.comicSelectionService.decodeSelections(session.getAttribute(LIBRARY_SELECTIONS));
    this.metadataService.batchScrapeComicBooks(new ArrayList<>(ids));
    this.comicSelectionService.clearSelectedComicBooks(email, ids);
    session.setAttribute(LIBRARY_SELECTIONS, this.comicSelectionService.encodeSelections(ids));
  }

  /**
   * Loads a set of candidates for scraping a story.
   *
   * @param request the request body
   * @param sourceId the metadata source id
   * @return the list of story candidates
   * @throws MetadataException if an error occurs
   */
  @PostMapping(
      value = "/api/metadata/sources/{sourceId}/stories",
      produces = MediaType.APPLICATION_JSON_VALUE,
      consumes = MediaType.APPLICATION_JSON_VALUE)
  @PreAuthorize("hasRole('ADMIN')")
  @Timed(value = "comixed.metadata.get-stories")
  public List<StoryMetadata> loadStoryCandidates(
      @RequestBody LoadScrapingStoriesRequest request,
      @PathVariable("sourceId") final Long sourceId)
      throws MetadataException {
    final String name = request.getName();
    final int maxRecords = request.getMaxRecords();
    final boolean skipCache = request.isSkipCache();

    log.info(
        "Getting story candidates: name={} maxRecords={} skipCache={}",
        name,
        maxRecords,
        skipCache);

    return this.metadataService.getStories(name, maxRecords, sourceId, skipCache);
  }

  /**
   * Scrapes a story.
   *
   * @param request the request body
   * @param sourceId the metadata source id
   * @param referenceId the story reference id
   * @throws MetadataException if an error occurs
   */
  @PostMapping(
      value = "/api/metadata/sources/{sourceId}/stories/scrape/{referenceId}",
      produces = MediaType.APPLICATION_JSON_VALUE,
      consumes = MediaType.APPLICATION_JSON_VALUE)
  @PreAuthorize("hasRole('ADMIN')")
  @Timed(value = "comixed.metadata.get-stories")
  public void scrapeStory(
      @RequestBody ScrapeStoryRequest request,
      @PathVariable("sourceId") final Long sourceId,
      @PathVariable("referenceId") final String referenceId)
      throws MetadataException {
    final boolean skipCache = request.isSkipCache();

    log.info(
        "Scraping story: source id={} reference id={} skipCache={}",
        sourceId,
        referenceId,
        skipCache);

    this.metadataService.scrapeStory(sourceId, referenceId, skipCache);
  }

  private StartMultiBookScrapingResponse doRemoveComicBook(
      final HttpSession session, final long comicBookId, final int pageSize, final int pageNumber)
      throws ComicBookSelectionException {
    log.debug(
        "Removing scraped comic book id from multi-book scraping selections: id={}", comicBookId);
    final List<Long> comicDetailIds =
        this.comicSelectionService
            .decodeSelections(session.getAttribute(MULTI_BOOK_SCRAPING_SELECTIONS))
            .stream()
            .filter(id -> id != comicBookId)
            .collect(Collectors.toList());
    log.debug("Updating multi-book scraping selections");
    session.setAttribute(
        MULTI_BOOK_SCRAPING_SELECTIONS,
        this.comicSelectionService.encodeSelections(comicDetailIds));

    log.debug("Loading page of comic books still to be scraped");
    final List<ComicBook> comicBooks =
        this.comicBookService.loadByComicBookId(comicDetailIds, pageSize, pageNumber);
    return new StartMultiBookScrapingResponse(
        pageSize, pageNumber, comicDetailIds.size(), comicBooks);
  }
}
