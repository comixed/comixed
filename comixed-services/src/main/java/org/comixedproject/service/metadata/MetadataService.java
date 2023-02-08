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

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.metadata.MetadataException;
import org.comixedproject.metadata.adaptors.MetadataAdaptor;
import org.comixedproject.metadata.model.IssueDetailsMetadata;
import org.comixedproject.metadata.model.IssueMetadata;
import org.comixedproject.metadata.model.VolumeMetadata;
import org.comixedproject.model.collections.Issue;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.comicbooks.ComicDetail;
import org.comixedproject.model.comicbooks.ComicMetadataSource;
import org.comixedproject.model.comicbooks.ComicTag;
import org.comixedproject.model.comicbooks.ComicTagType;
import org.comixedproject.model.metadata.MetadataSource;
import org.comixedproject.service.collections.IssueService;
import org.comixedproject.service.comicbooks.ComicBookException;
import org.comixedproject.service.comicbooks.ComicBookService;
import org.comixedproject.service.comicbooks.ImprintService;
import org.comixedproject.state.comicbooks.ComicEvent;
import org.comixedproject.state.comicbooks.ComicStateHandler;
import org.springframework.beans.BeansException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Service;

/**
 * <code>MetadataService</code> handles interacting with the selected {@link MetadataAdaptor} and
 * the scraping cache.
 *
 * @author Darryl L. Pierce
 */
@Service
@Log4j2
public class MetadataService {
  @Autowired private ApplicationContext applicationContext;
  @Autowired private MetadataSourceService metadataSourceService;
  @Autowired private ObjectMapper objectMapper;
  @Autowired private MetadataCacheService metadataCacheService;
  @Autowired private ComicBookService comicBookService;
  @Autowired private ComicStateHandler comicStateHandler;
  @Autowired private ImprintService imprintService;
  @Autowired private IssueService issueService;

  /**
   * Retrieves a list of volumes for the given series, up to the max records specified.
   *
   * @param sourceId the metadata source id
   * @param series the series name
   * @param maxRecords the maximum records
   * @param skipCache the skip cache flag
   * @return the volumes
   * @throws MetadataException if an error occurs
   */
  public List<VolumeMetadata> getVolumes(
      final Long sourceId, final String series, final Integer maxRecords, final boolean skipCache)
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
      final List<VolumeMetadata> fetched =
          metadataAdaptor.getVolumes(series, maxRecords, metadataSource);

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
    try {
      return this.applicationContext.getBean(metadataSource.getBeanName(), MetadataAdaptor.class);
    } catch (BeansException error) {
      throw new MetadataException("Failed to load scraping adaptor", error);
    }
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
   * <p>* @param comicId the comic id
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
      // have to use a final reference here due to the lambdas later in this block
      final ComicBook comicBook = result;
      log.debug("Updating comicBook with scraped data");
      comicBook.getComicDetail().setPublisher(issueDetails.getPublisher());
      comicBook.getComicDetail().setSeries(issueDetails.getSeries());
      comicBook.getComicDetail().setVolume(issueDetails.getVolume());
      comicBook.getComicDetail().setIssueNumber(issueDetails.getIssueNumber());
      if (issueDetails.getCoverDate() != null) {
        comicBook
            .getComicDetail()
            .setCoverDate(this.adjustForTimezone(issueDetails.getCoverDate()));
      } else {
        comicBook.getComicDetail().setCoverDate(null);
      }
      if (issueDetails.getStoreDate() != null) {
        comicBook
            .getComicDetail()
            .setStoreDate(this.adjustForTimezone(issueDetails.getStoreDate()));
      } else {
        comicBook.getComicDetail().setStoreDate(null);
      }
      comicBook.getComicDetail().setTitle(issueDetails.getTitle());
      comicBook.getComicDetail().setDescription(issueDetails.getDescription());
      final ComicDetail detail = comicBook.getComicDetail();
      detail.getTags().clear();
      issueDetails
          .getCharacters()
          .forEach(
              character ->
                  detail.getTags().add(new ComicTag(detail, ComicTagType.CHARACTER, character)));
      issueDetails
          .getTeams()
          .forEach(team -> detail.getTags().add(new ComicTag(detail, ComicTagType.TEAM, team)));
      issueDetails
          .getLocations()
          .forEach(
              location ->
                  detail.getTags().add(new ComicTag(detail, ComicTagType.LOCATION, location)));
      issueDetails
          .getStories()
          .forEach(story -> detail.getTags().add(new ComicTag(detail, ComicTagType.STORY, story)));
      issueDetails.getCredits().stream()
          .filter(credit -> ComicTagType.forValue(credit.getRole()) != null)
          .forEach(
              entry ->
                  detail
                      .getTags()
                      .add(
                          new ComicTag(
                              detail, ComicTagType.forValue(entry.getRole()), entry.getName())));
      log.trace("Creating comicBook metadata record");
      comicBook.setMetadata(
          new ComicMetadataSource(comicBook, metadataSource, issueDetails.getSourceId()));
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
    try {
      return this.comicBookService.getComic(comicId);
    } catch (ComicBookException error) {
      throw new MetadataException("failed to load comic", error);
    }
  }

  /**
   * Fetches the issues for a given volume from the specified metadata source.
   *
   * @param metadataSourceId the metadata source id
   * @param volumeId the volume id
   * @throws MetadataException if an error occurs
   */
  public void fetchIssuesForSeries(final Long metadataSourceId, final String volumeId)
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
      return;
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
                          metadata.getPublisher(),
                          metadata.getSeries(),
                          metadata.getVolume(),
                          metadata.getIssueNumber());

                  if (metadata.getCoverDate() != null) {
                    result.setCoverDate(metadata.getCoverDate());
                  }
                  if (metadata.getStoreDate() != null) {
                    result.setStoreDate(metadata.getStoreDate());
                  }
                  return result;
                })
            .collect(Collectors.toList()));
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
}
