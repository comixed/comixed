/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2020, The ComiXed Project
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
 * aLong with this program. If not, see <http://www.gnu.org/licenses>
 */

package org.comixedproject.service.metadata;

import static org.apache.commons.lang3.StringUtils.trim;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.util.*;
import java.util.stream.Collectors;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.metadata.MetadataAdaptorProvider;
import org.comixedproject.metadata.MetadataAdaptorRegistry;
import org.comixedproject.metadata.MetadataException;
import org.comixedproject.metadata.adaptors.MetadataAdaptor;
import org.comixedproject.metadata.model.*;
import org.comixedproject.model.batch.ScrapeMetadataEvent;
import org.comixedproject.model.collections.Issue;
import org.comixedproject.model.collections.ScrapedStory;
import org.comixedproject.model.collections.ScrapedStoryEntry;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.comicbooks.ComicDetail;
import org.comixedproject.model.comicbooks.ComicMetadataSource;
import org.comixedproject.model.comicbooks.ComicTag;
import org.comixedproject.model.comicbooks.ComicTagType;
import org.comixedproject.model.metadata.MetadataSource;
import org.comixedproject.model.net.metadata.ScrapeSeriesResponse;
import org.comixedproject.service.admin.ConfigurationService;
import org.comixedproject.service.collections.IssueService;
import org.comixedproject.service.collections.ScrapedStoryService;
import org.comixedproject.service.comicbooks.ComicBookException;
import org.comixedproject.service.comicbooks.ComicBookService;
import org.comixedproject.service.comicbooks.ImprintService;
import org.comixedproject.service.metadata.action.ProcessComicDescriptionAction;
import org.comixedproject.state.comicbooks.ComicEvent;
import org.comixedproject.state.comicbooks.ComicStateHandler;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

/**
 * <code>MetadataService</code> handles interacting with the selected {@link MetadataAdaptor} and
 * the scraping cache.
 *
 * @author Darryl L. Pierce
 */
@Service
@Log4j2
public class MetadataService {
  @Autowired private MetadataAdaptorRegistry metadataAdaptorRegistry;
  @Autowired private MetadataSourceService metadataSourceService;
  @Autowired private ScrapedStoryService scrapedStoryService;
  @Autowired private ObjectMapper objectMapper;
  @Autowired private MetadataCacheService metadataCacheService;
  @Autowired private ComicBookService comicBookService;
  @Autowired private ComicStateHandler comicStateHandler;
  @Autowired private ImprintService imprintService;
  @Autowired private IssueService issueService;
  @Autowired private ConfigurationService configurationService;
  @Autowired private ProcessComicDescriptionAction processComicDescriptionAction;
  @Autowired private ApplicationEventPublisher applicationEventPublisher;

  /**
   * Retrieves a list of volumes for the given series, up to the max records specified.
   *
   * <p>If the match publisher flag is set and a publisher is provided, then only results where the
   * publisher matches the one provided are returned.
   *
   * @param sourceId the metadata source id
   * @param publisher the publisher
   * @param series the series name
   * @param maxRecords the maximum records
   * @param skipCache the skip cache flag
   * @param matchPublisher the match publisher flag
   * @return the volumes
   * @throws MetadataException if an error occurs
   */
  public List<VolumeMetadata> getVolumes(
      final Long sourceId,
      final String publisher,
      final String series,
      final Integer maxRecords,
      final boolean skipCache,
      final boolean matchPublisher)
      throws MetadataException {
    final MetadataSource metadataSource = this.doLoadMetadataSource(sourceId);
    final MetadataAdaptor metadataAdaptor = this.doLoadScrapingAdaptor(metadataSource);
    List<VolumeMetadata> result = new ArrayList<>();
    final String source = metadataAdaptor.getSource();
    final String key = metadataAdaptor.getVolumeKey(series);

    log.debug(
        "Getting volumes: series={} maxRecords={} skipCache={}", series, maxRecords, skipCache);
    if (!skipCache) {
      log.debug("Fetching from the cache: source={} key={}", source, key);
      result = this.doLoadScrapingVolumes(source, key);
    }

    if (result.isEmpty()) {
      log.debug("Fetching from scraping source");
      List<VolumeMetadata> fetched = metadataAdaptor.getVolumes(series, maxRecords, metadataSource);

      log.debug("Fetched {} volume{}", fetched.size(), fetched.size() == 1 ? "" : "s");
      if (fetched.isEmpty()) {
        log.debug("No entries fetched");
      } else {
        result.addAll(fetched);
        log.debug("Encoding fetched entries");
        final List<String> cacheEntries = new ArrayList<>();
        for (VolumeMetadata volume : fetched) {
          try {
            cacheEntries.add(this.objectMapper.writeValueAsString(volume));
          } catch (JsonProcessingException error) {
            throw new MetadataException("Failed to encoded scraping volume", error);
          }
        }
        log.debug("Caching fetched entries: source={} key={}", source, key);
        this.metadataCacheService.saveToCache(source, key, cacheEntries);
      }
    }

    if (matchPublisher && StringUtils.hasLength(publisher)) {
      log.debug("Filtering results by publisher: {}", publisher);
      final String comparablePublisher = publisher.toUpperCase();
      result =
          result.stream()
              .filter(entry -> StringUtils.hasLength(entry.getPublisher()))
              .filter(entry -> entry.getPublisher().toUpperCase().contains(comparablePublisher))
              .collect(Collectors.toList());
    }

    return result;
  }

  private MetadataSource doLoadMetadataSource(final Long sourceId) throws MetadataException {
    try {
      return this.metadataSourceService.getById(sourceId);
    } catch (MetadataSourceException error) {
      throw new MetadataException("Failed to load metadata source", error);
    }
  }

  private MetadataAdaptor doLoadScrapingAdaptor(final MetadataSource metadataSource)
      throws MetadataException {
    log.debug("Loading metadata adaptor: {}", metadataSource.getAdaptorName());
    return this.metadataAdaptorRegistry.getAdaptor(metadataSource.getAdaptorName());
  }

  private List<VolumeMetadata> doLoadScrapingVolumes(final String source, final String key) {
    List<VolumeMetadata> result = new ArrayList<>();
    final List<String> cachedEntries = this.metadataCacheService.getFromCache(source, key);
    if (cachedEntries != null && !cachedEntries.isEmpty()) {
      for (String entry : cachedEntries) {
        try {
          result.add(this.objectMapper.readValue(entry, VolumeMetadata.class));
        } catch (JsonProcessingException error) {
          log.error("Failed to decode scraping volume", error);
          return new ArrayList<>();
        }
      }
    }
    return result;
  }

  /**
   * Retrieves the specified issue for the given volume.
   *
   * @param sourceId the metadata source id
   * @param volumeId the volume id
   * @param issueNumber the issue number
   * @param skipCache the skip cache flag
   * @return the issue
   * @throws MetadataException if an error occurs
   */
  public IssueMetadata getIssue(
      final Long sourceId, final String volumeId, final String issueNumber, final boolean skipCache)
      throws MetadataException {
    final MetadataSource metadataSource = this.doLoadMetadataSource(sourceId);
    final MetadataAdaptor metadataAdaptor = this.doLoadScrapingAdaptor(metadataSource);
    final String source = metadataAdaptor.getSource();
    final String key = metadataAdaptor.getIssueKey(volumeId, issueNumber);
    log.debug(
        "Getting issue: volumeId={} issueNumber={} skipCache={}", volumeId, issueNumber, skipCache);

    IssueMetadata result = null;

    if (!skipCache) {
      log.debug("Fetching from the cache: source={} key={}", source, key);
      final List<String> cachedEntries = this.metadataCacheService.getFromCache(source, key);
      if (cachedEntries != null && !cachedEntries.isEmpty()) {
        log.debug("Decoding cached issue");
        try {
          result = this.objectMapper.readValue(cachedEntries.get(0), IssueMetadata.class);
        } catch (JsonProcessingException error) {
          log.error("Failed to decode cached scraping issue", error);
        }
      }
    }

    if (result == null) {
      log.debug("Fetching from scraping source");
      result = metadataAdaptor.getIssue(volumeId, issueNumber, metadataSource);
      if (result != null) {
        log.debug("Encoding fetched issue");
        final List<String> encodedValues = new ArrayList<>();
        try {
          encodedValues.add(this.objectMapper.writeValueAsString(result));
        } catch (JsonProcessingException error) {
          throw new MetadataException("Failed to encode issue", error);
        }
        log.debug("Caching fetched issue: source={} key={}", source, key);
        this.metadataCacheService.saveToCache(source, key, encodedValues);
      }
    }

    return result;
  }

  /**
   * Scrapes a single comic and updates the comic in the database.
   *
   * @param metadataSourceId the metadata source id
   * @param comicId the comic id
   * @param issueId the issue id
   * @param skipCache the skip cache flag
   * @return the updated comic
   * @throws MetadataException if an error occurs
   */
  public ComicBook scrapeComic(
      final Long metadataSourceId,
      final Long comicId,
      final String issueId,
      final boolean skipCache)
      throws MetadataException {
    this.doScrapeComic(metadataSourceId, comicId, issueId, skipCache);
    try {
      return this.comicBookService.getComic(comicId);
    } catch (ComicBookException error) {
      throw new MetadataException("failed to load comic", error);
    }
  }

  /**
   * Asynchronously scrapes a single comic and updates the comic in the database.
   *
   * @param metadataSourceId the metadata source id
   * @param comicId the comic id
   * @param issueId the issue id
   * @param skipCache the skip cache flag
   * @throws MetadataException if an error occurs
   */
  @Async
  public void asyncScrapeComic(
      final Long metadataSourceId,
      final Long comicId,
      final String issueId,
      final boolean skipCache)
      throws MetadataException {
    this.doScrapeComic(metadataSourceId, comicId, issueId, skipCache);
  }

  private void doScrapeComic(
      final Long metadataSourceId,
      final Long comicId,
      final String issueId,
      final boolean skipCache)
      throws MetadataException {
    log.debug("Scraping comic: id={} issueId={} skipCache={}", comicId, issueId, skipCache);
    ComicBook result = null;
    final MetadataSource metadataSource = this.doLoadMetadataSource(metadataSourceId);
    final MetadataAdaptor metadataAdaptor = this.doLoadScrapingAdaptor(metadataSource);
    final String source = metadataAdaptor.getSource();
    final String key = metadataAdaptor.getIssueDetailsKey(issueId);

    try {
      result = this.comicBookService.getComic(comicId);
    } catch (ComicBookException error) {
      throw new MetadataException("failed to load comic", error);
    }

    IssueDetailsMetadata issueDetails = null;

    if (!skipCache) {
      log.trace("Loading cached issue details: source={} key={}", source, key);
      issueDetails = this.doLoadIssueDetails(source, key);
    }

    if (issueDetails == null) {
      log.debug("Fetching issue details");
      issueDetails = metadataAdaptor.getIssueDetails(issueId, metadataSource);

      if (issueDetails != null) {
        log.debug("Encoding fetched issue details");
        List<String> encodedDetails = new ArrayList<>();
        try {
          encodedDetails.add(this.objectMapper.writeValueAsString(issueDetails));
          log.debug("Caching fetched issue details");
          this.metadataCacheService.saveToCache(source, key, encodedDetails);
        } catch (JsonProcessingException error) {
          log.error("Failed to cache issue details", error);
        }
      }
    }

    if (issueDetails != null) {
      final boolean ignoreEmptyValues =
          this.configurationService.isFeatureEnabled(
              ConfigurationService.CFG_METADATA_IGNORE_EMPTY_VALUES);
      // have to use a final reference here due to the lambdas later in this block
      final ComicBook comicBook = result;
      final ComicDetail detail = comicBook.getComicDetail();
      log.debug("Updating comicBook with scraped data");
      if (!ignoreEmptyValues || StringUtils.hasLength(issueDetails.getPublisher())) {
        detail.setPublisher(trim(issueDetails.getPublisher()));
      }
      if (!ignoreEmptyValues || StringUtils.hasLength(issueDetails.getPublisher())) {
        detail.setImprint(trim(issueDetails.getPublisher()));
      }
      if (!ignoreEmptyValues || StringUtils.hasLength(issueDetails.getSeries())) {
        detail.setSeries(trim(issueDetails.getSeries()));
      }
      if (!ignoreEmptyValues || StringUtils.hasLength(issueDetails.getVolume())) {
        detail.setVolume(trim(issueDetails.getVolume()));
      }
      if (!ignoreEmptyValues || StringUtils.hasLength(issueDetails.getIssueNumber())) {
        detail.setIssueNumber(trim(issueDetails.getIssueNumber()));
      }
      if (issueDetails.getCoverDate() != null) {
        comicBook
            .getComicDetail()
            .setCoverDate(this.adjustForTimezone(issueDetails.getCoverDate()));
      } else {
        detail.setCoverDate(null);
      }
      if (issueDetails.getStoreDate() != null) {
        comicBook
            .getComicDetail()
            .setStoreDate(this.adjustForTimezone(issueDetails.getStoreDate()));
      } else {
        detail.setStoreDate(null);
      }
      if (!ignoreEmptyValues || StringUtils.hasLength(issueDetails.getTitle())) {
        detail.setTitle(trim(issueDetails.getTitle()));
      }
      if (!ignoreEmptyValues && !Objects.isNull(issueDetails.getDescription())
          || StringUtils.hasLength(issueDetails.getDescription())) {
        detail.setDescription(
            this.processComicDescriptionAction.execute(trim(issueDetails.getDescription())));
      }
      if (!ignoreEmptyValues || StringUtils.hasLength(issueDetails.getWebAddress())) {
        detail.setWebAddress(issueDetails.getWebAddress());
      }
      detail.getTags().clear();
      issueDetails
          .getCharacters()
          .forEach(
              character ->
                  detail
                      .getTags()
                      .add(new ComicTag(detail, ComicTagType.CHARACTER, trim(character))));
      issueDetails
          .getTeams()
          .forEach(
              team -> detail.getTags().add(new ComicTag(detail, ComicTagType.TEAM, trim(team))));
      issueDetails
          .getLocations()
          .forEach(
              location ->
                  detail
                      .getTags()
                      .add(new ComicTag(detail, ComicTagType.LOCATION, trim(location))));
      issueDetails
          .getStories()
          .forEach(
              story -> detail.getTags().add(new ComicTag(detail, ComicTagType.STORY, trim(story))));
      issueDetails.getCredits().stream()
          .filter(credit -> ComicTagType.forValue(credit.getRole()) != null)
          .forEach(
              entry ->
                  detail
                      .getTags()
                      .add(
                          new ComicTag(
                              detail,
                              ComicTagType.forValue(entry.getRole()),
                              trim(entry.getName()))));
      log.trace("Creating comicBook metadata record");
      if (Objects.isNull(comicBook.getMetadata())) {
        comicBook.setMetadata(
            new ComicMetadataSource(comicBook, metadataSource, trim(issueDetails.getSourceId())));
      } else {
        comicBook.getMetadata().setMetadataSource(metadataSource);
        comicBook.getMetadata().setReferenceId(trim(issueDetails.getSourceId()));
      }
      comicBook
          .getComicDetail()
          .setNotes(
              String.format(
                  "ComicBook metadata scraped using ComiXed & %s.", metadataAdaptor.getSource()));
      log.trace("Checking for imprint");
      this.imprintService.update(comicBook);
      log.trace("Updating comicBook state: scraped");
      this.comicStateHandler.fireEvent(comicBook, ComicEvent.scraped);
    }
  }

  /**
   * Fetches the issues for a given volume from the specified metadata source. It uses the original
   * publisher, series, and volume to find the existing comic books to be updated.
   *
   * @param originalPublisher the original publisher value
   * @param originalSeries the original series value
   * @param originalVolume the original volume value
   * @param metadataSourceId the metadata source id
   * @param volumeId the volume id
   * @return the response content
   * @throws MetadataException if an error occurs
   */
  //  @Async
  public ScrapeSeriesResponse scrapeSeries(
      final String originalPublisher,
      final String originalSeries,
      final String originalVolume,
      final Long metadataSourceId,
      final String volumeId)
      throws MetadataException {
    log.debug(
        "Fetching issues for series: metadata source id={} volume id={}",
        metadataSourceId,
        volumeId);
    final MetadataSource metadataSource = this.doLoadMetadataSource(metadataSourceId);
    final MetadataAdaptor metadataAdaptor = this.doLoadScrapingAdaptor(metadataSource);

    final List<IssueDetailsMetadata> issues =
        metadataAdaptor.getAllIssues(volumeId, metadataSource);
    if (issues.isEmpty()) {
      log.debug("No issues found");
      return new ScrapeSeriesResponse(
          trim(originalPublisher), trim(originalSeries), trim(originalVolume));
    }

    log.debug("Deleting existing issues");
    this.issueService.deleteSeriesAndVolume(issues.get(0).getSeries(), issues.get(0).getVolume());
    log.debug("Saving {} issue{}", issues.size(), issues.size() == 1 ? "" : "s");
    this.issueService.saveAll(
        issues.stream()
            .map(
                metadata -> {
                  log.trace(
                      "Mapping metadata for issue: {} {} v{} #{} [{}]",
                      metadata.getPublisher(),
                      metadata.getSeries(),
                      metadata.getVolume(),
                      metadata.getIssueNumber(),
                      metadata.getCoverDate());
                  final Issue result =
                      new Issue(
                          trim(metadata.getPublisher()),
                          trim(metadata.getSeries()),
                          trim(metadata.getVolume()),
                          trim(metadata.getIssueNumber()));
                  result.setTitle(trim(metadata.getTitle()));

                  if (metadata.getCoverDate() != null) {
                    result.setCoverDate(metadata.getCoverDate());
                  }
                  if (metadata.getStoreDate() != null) {
                    result.setStoreDate(metadata.getStoreDate());
                  }
                  return result;
                })
            .toList());

    log.debug("Creating comic metadata sources");
    for (int index = 0; index < issues.size(); index++) {
      final IssueDetailsMetadata issue = issues.get(index);
      log.debug(
          "Processing comic {} of {}: issue number={}",
          index + 1,
          issues.size(),
          issue.getIssueNumber());
      final List<ComicBook> comicBooks =
          this.comicBookService.findComic(
              originalPublisher, originalSeries, originalVolume, trim(issue.getIssueNumber()));
      if (!comicBooks.isEmpty()) {
        comicBooks.forEach(
            comicBook -> {
              log.trace("Updating comic details");
              comicBook.getComicDetail().setPublisher(trim(issue.getPublisher()));
              comicBook.getComicDetail().setSeries(trim(issue.getSeries()));
              comicBook.getComicDetail().setVolume(trim(issue.getVolume()));
              if (comicBook.getMetadata() != null) {
                log.trace("Updating existing comic metadata source");
                comicBook.getMetadata().setMetadataSource(metadataSource);
                comicBook.getMetadata().setReferenceId(trim(issue.getSourceId()));
              } else {
                log.trace("Creating comic metadata source", comicBook.getComicBookId());
                comicBook.setMetadata(
                    new ComicMetadataSource(comicBook, metadataSource, trim(issue.getSourceId())));
              }
              log.debug("Firing comic book event: id={}", comicBook.getComicBookId());
              this.comicStateHandler.fireEvent(comicBook, ComicEvent.detailsUpdated);
            });
      } else {
        log.trace("No comic books found");
      }
    }
    log.debug("Returning scraped series details");
    return new ScrapeSeriesResponse(
        trim(issues.get(0).getPublisher()),
        trim(issues.get(0).getSeries()),
        trim(issues.get(0).getVolume()));
  }

  Date adjustForTimezone(final Date date) {
    final LocalDateTime localDateTime =
        LocalDateTime.ofInstant(date.toInstant(), ZoneId.systemDefault());
    return new Date(localDateTime.atOffset(ZoneOffset.UTC).toInstant().toEpochMilli());
  }

  private IssueDetailsMetadata doLoadIssueDetails(final String source, final String key)
      throws MetadataException {
    final List<String> cachedEntries = this.metadataCacheService.getFromCache(source, key);
    if (cachedEntries != null && !cachedEntries.isEmpty()) {
      log.debug("Decoding cached issue details");
      try {
        return this.objectMapper.readValue(cachedEntries.get(0), IssueDetailsMetadata.class);
      } catch (JsonProcessingException error) {
        throw new MetadataException("Failed to decoded cached issue details", error);
      }
    }
    log.trace("No cached entries found");
    return null;
  }

  /**
   * Returns the metadata provider that supports that uses the provided web address.
   *
   * @param webAddress the web address
   * @return the provider
   */
  public MetadataAdaptorProvider findForWebAddress(final String webAddress) {
    final Optional<MetadataAdaptorProvider> result =
        this.metadataAdaptorRegistry.getAdaptors().stream()
            .filter(adaptor -> adaptor.supportedReference(webAddress))
            .findFirst();
    if (result.isEmpty()) {
      log.debug("Web address not supported by any adaptor");
      return null;
    }
    log.debug("Found supporting metadata adaptor");
    return result.get();
  }

  /**
   * Marks comics for batch scraping based on the provided list of ids, then initiates the batch
   * scraping process.
   *
   * @param ids the comic ids
   */
  @Async
  public void batchScrapeComicBooks(final List<Long> ids) {
    log.debug("Marking comics for batch scraping");
    this.comicBookService.markComicBooksForBatchScraping(ids);
    log.debug("Starting batch scraping process");
    this.applicationEventPublisher.publishEvent(ScrapeMetadataEvent.instance);
  }

  /**
   * Retrieves a list of story candidates from the specified metadata source.
   *
   * @param storyName the story name
   * @param maxRecords the maximum records
   * @param sourceId the metadata source id
   * @param skipCache skips cache if true
   * @return the list of candidates
   * @throws MetadataException if an error occurs
   */
  public List<StoryMetadata> getStories(
      final String storyName,
      final Integer maxRecords,
      final Long sourceId,
      final boolean skipCache)
      throws MetadataException {
    log.debug(
        "Loading stories: storyName={} maxRecords={} sourceId={}", storyName, maxRecords, sourceId);

    final MetadataSource metadataSource = this.doLoadMetadataSource(sourceId);
    final MetadataAdaptor metadataAdaptor = this.doLoadScrapingAdaptor(metadataSource);
    final String key = metadataAdaptor.getStoryListKey(storyName);

    List<StoryMetadata> result = new ArrayList<>();
    final String source = metadataAdaptor.getSource();

    if (!skipCache) {
      result = this.doLoadScrapingStories(source, key);
    }

    if (result.isEmpty()) {
      result = metadataAdaptor.getStories(storyName, maxRecords, metadataSource);

      log.debug("Encoding fetched entries");
      final List<String> cacheEntries = new ArrayList<>();
      for (StoryMetadata volume : result) {
        try {
          cacheEntries.add(this.objectMapper.writeValueAsString(volume));
        } catch (JsonProcessingException error) {
          throw new MetadataException("Failed to encoded scraping volume", error);
        }
      }
      log.debug("Caching fetched entries: source={} key={}", source, key);
      this.metadataCacheService.saveToCache(source, key, cacheEntries);
    }

    return result;
  }

  /**
   * Scrapes the details for a story.
   *
   * @param sourceId the metadata source id
   * @param referenceId the story reference id
   * @param skipCache skips cache if true
   * @throws MetadataException if an error occurs
   */
  @Async
  public void scrapeStory(final Long sourceId, final String referenceId, final boolean skipCache)
      throws MetadataException {
    log.debug("Scraping story: sourceId={} reference id={}", sourceId, referenceId);

    final MetadataSource metadataSource = this.doLoadMetadataSource(sourceId);
    final MetadataAdaptor metadataAdaptor = this.doLoadScrapingAdaptor(metadataSource);
    final String key = metadataAdaptor.getStoryDetailKey(referenceId);
    final String source = metadataAdaptor.getSource();

    StoryDetailMetadata storyDetailMetadata = null;
    if (!skipCache) {
      storyDetailMetadata = this.doLoadStory(source, key);
    }

    if (Objects.isNull(storyDetailMetadata)) {
      storyDetailMetadata = metadataAdaptor.getStory(referenceId, metadataSource);

      log.debug("Encoding fetched story");
      final List<String> cacheEntries = new ArrayList<>();
      try {
        cacheEntries.add(this.objectMapper.writeValueAsString(storyDetailMetadata));
      } catch (JsonProcessingException error) {
        throw new MetadataException("Failed to encoded scraping volume", error);
      }

      log.debug("Caching fetched story: source={} key={}", source, key);
      this.metadataCacheService.saveToCache(source, key, cacheEntries);
    }

    ScrapedStory story = this.scrapedStoryService.getForName(storyDetailMetadata.getName());
    if (Objects.isNull(story)) {
      story = new ScrapedStory();
      story.setMetadataSource(metadataSource);
      story.setReferenceId(referenceId);
    } else {
      while (!story.getEntries().isEmpty()) {
        final ScrapedStoryEntry entry = story.getEntries().removeFirst();
        entry.setStory(null);
      }
      story = this.scrapedStoryService.saveStory(story);
    }

    if (Objects.isNull(storyDetailMetadata.getPublisher())) {
      story.setPublisher("");
    } else {
      story.setPublisher(storyDetailMetadata.getPublisher());
    }
    if (Objects.isNull(storyDetailMetadata.getDescription())) {
      story.setDescription("");
    } else {
      story.setDescription(storyDetailMetadata.getDescription());
    }
    for (int index = 0; index < storyDetailMetadata.getIssues().size(); index++) {
      final StoryIssueMetadata issue = storyDetailMetadata.getIssues().get(index);
      log.debug(
          "Adding issue entry: {} {} {} {} [order={}]",
          issue.getName(),
          issue.getVolume(),
          issue.getIssueNumber(),
          issue.getCoverDate(),
          issue.getReadingOrder());
      final ScrapedStoryEntry storyIssue = new ScrapedStoryEntry();
      storyIssue.setStory(story);
      storyIssue.setSeries(issue.getName());
      storyIssue.setVolume(issue.getVolume());
      storyIssue.setIssueNumber(issue.getIssueNumber());
      storyIssue.setReadingOrder(issue.getReadingOrder());
      storyIssue.setCoverDate(issue.getCoverDate());
      story.getEntries().add(storyIssue);
    }

    log.debug("Saving scraped story");
    this.scrapedStoryService.saveStory(story);
  }

  private StoryDetailMetadata doLoadStory(final String source, final String key) {
    final List<String> cachedEntries = this.metadataCacheService.getFromCache(source, key);

    StoryDetailMetadata result = null;
    if (cachedEntries != null && !cachedEntries.isEmpty()) {
      try {
        result = this.objectMapper.readValue(cachedEntries.get(0), StoryDetailMetadata.class);
      } catch (JsonProcessingException error) {
        log.error("Failed to decode scraping story", error);
        return null;
      }
    }

    return result;
  }

  private List<StoryMetadata> doLoadScrapingStories(final String source, final String key) {
    List<StoryMetadata> result = new ArrayList<>();
    final List<String> cachedEntries = this.metadataCacheService.getFromCache(source, key);
    if (cachedEntries != null && !cachedEntries.isEmpty()) {
      for (String entry : cachedEntries) {
        try {
          result.add(this.objectMapper.readValue(entry, StoryMetadata.class));
        } catch (JsonProcessingException error) {
          log.error("Failed to decode scraping stories", error);
          return new ArrayList<>();
        }
      }
    }
    return result;
  }
}
