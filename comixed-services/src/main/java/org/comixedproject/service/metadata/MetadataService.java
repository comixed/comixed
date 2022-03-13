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
import lombok.extern.log4j.Log4j2;
import org.comixedproject.metadata.MetadataException;
import org.comixedproject.metadata.adaptors.MetadataAdaptor;
import org.comixedproject.metadata.model.IssueDetailsMetadata;
import org.comixedproject.metadata.model.IssueMetadata;
import org.comixedproject.metadata.model.VolumeMetadata;
import org.comixedproject.model.comicbooks.Comic;
import org.comixedproject.model.comicbooks.ComicMetadataSource;
import org.comixedproject.model.comicbooks.Credit;
import org.comixedproject.model.metadata.MetadataAuditLogEntry;
import org.comixedproject.model.metadata.MetadataSource;
import org.comixedproject.repositories.metadata.MetadataAuditLogRepository;
import org.comixedproject.service.comicbooks.ComicException;
import org.comixedproject.service.comicbooks.ComicService;
import org.comixedproject.service.comicbooks.ImprintService;
import org.comixedproject.state.comicbooks.ComicEvent;
import org.comixedproject.state.comicbooks.ComicStateHandler;
import org.springframework.beans.BeansException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
  @Autowired private ComicService comicService;
  @Autowired private ComicStateHandler comicStateHandler;
  @Autowired private ImprintService imprintService;
  @Autowired private MetadataAuditLogRepository metadataAuditLogRepository;

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
      final Long sourceId,
      final Integer volumeId,
      final String issueNumber,
      final boolean skipCache)
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
  public Comic scrapeComic(
      final Long metadataSourceId,
      final Long comicId,
      final Integer issueId,
      final boolean skipCache)
      throws MetadataException {
    log.debug("Scraping comic: id={} issueId={} skipCache={}", comicId, issueId, skipCache);
    Comic result = null;
    final MetadataSource metadataSource = this.doLoadMetadataSource(metadataSourceId);
    final MetadataAdaptor metadataAdaptor = this.doLoadScrapingAdaptor(metadataSource);
    final String source = metadataAdaptor.getSource();
    final String key = metadataAdaptor.getIssueDetailsKey(issueId);

    try {
      result = this.comicService.getComic(comicId);
    } catch (ComicException error) {
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
      final Comic comic = result;
      log.debug("Updating comic with scraped data");
      comic.setPublisher(issueDetails.getPublisher());
      comic.setSeries(issueDetails.getSeries());
      comic.setVolume(issueDetails.getVolume());
      comic.setIssueNumber(issueDetails.getIssueNumber());
      if (issueDetails.getCoverDate() != null)
        comic.setCoverDate(this.adjustForTimezone(issueDetails.getCoverDate()));
      if (issueDetails.getStoreDate() != null)
        comic.setStoreDate(this.adjustForTimezone(issueDetails.getStoreDate()));
      comic.setTitle(issueDetails.getTitle());
      comic.setDescription(issueDetails.getDescription());
      comic.getCharacters().clear();
      issueDetails.getCharacters().forEach(character -> comic.getCharacters().add(character));
      comic.getTeams().clear();
      issueDetails.getTeams().forEach(team -> comic.getTeams().add(team));
      comic.getLocations().clear();
      issueDetails.getLocations().forEach(location -> comic.getLocations().add(location));
      comic.getStories().clear();
      issueDetails.getStories().forEach(story -> comic.getStories().add(story));
      comic.getCredits().clear();
      issueDetails
          .getCredits()
          .forEach(
              entry -> comic.getCredits().add(new Credit(comic, entry.getName(), entry.getRole())));
      log.trace("Creating comic metadata record");
      comic.setMetadataSource(
          new ComicMetadataSource(comic, metadataSource, issueDetails.getSourceId()));
      comic.setNotes(String.format("Comic details scraped by %s", metadataAdaptor.getIdentifier()));
      log.trace("Checking for imprint");
      this.imprintService.update(comic);
      log.info("Creating metadata audit log entry");
      this.metadataAuditLogRepository.save(
          new MetadataAuditLogEntry(result, metadataSource, issueDetails.getSourceId()));
      log.trace("Updating comic state: scraped");
      this.comicStateHandler.fireEvent(comic, ComicEvent.scraped);
    }
    try {
      return this.comicService.getComic(comicId);
    } catch (ComicException error) {
      throw new MetadataException("failed to load comic", error);
    }
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
   * Returns all audit log entries.
   *
   * @return the entry list
   */
  public List<MetadataAuditLogEntry> loadAuditLogEntries() {
    log.trace("Loading all metadata audit log entries");
    return this.metadataAuditLogRepository.loadAll();
  }

  /** Deletes all metadata audit log entries. */
  @Transactional
  public void clearAuditLog() {
    log.trace("Deleting all metadata audit log entries");
    this.metadataAuditLogRepository.deleteAll();
  }
}
