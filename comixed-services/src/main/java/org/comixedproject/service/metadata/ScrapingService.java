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
import org.comixedproject.model.comicbooks.Comic;
import org.comixedproject.model.comicbooks.ComicMetadataSource;
import org.comixedproject.model.comicbooks.Credit;
import org.comixedproject.model.metadata.MetadataSource;
import org.comixedproject.scrapers.ScrapingException;
import org.comixedproject.scrapers.adaptors.ScrapingAdaptor;
import org.comixedproject.scrapers.model.ScrapingIssue;
import org.comixedproject.scrapers.model.ScrapingIssueDetails;
import org.comixedproject.scrapers.model.ScrapingVolume;
import org.comixedproject.service.comicbooks.ComicException;
import org.comixedproject.service.comicbooks.ComicService;
import org.comixedproject.service.comicbooks.ImprintService;
import org.comixedproject.state.comicbooks.ComicEvent;
import org.comixedproject.state.comicbooks.ComicStateHandler;
import org.springframework.beans.BeansException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Service;

/**
 * <code>ScrapingService</code> handles interacting with the selected {@link ScrapingAdaptor} and
 * the scraping cache.
 *
 * @author Darryl L. Pierce
 */
@Service
@Log4j2
public class ScrapingService {
  @Autowired private ApplicationContext applicationContext;
  @Autowired private MetadataSourceService metadataSourceService;
  @Autowired private ObjectMapper objectMapper;
  @Autowired private ScrapingCacheService scrapingCacheService;
  @Autowired private ComicService comicService;
  @Autowired private ComicStateHandler comicStateHandler;
  @Autowired private ImprintService imprintService;

  /**
   * Retrieves a list of volumes for the given series, up to the max records specified.
   *
   * @param sourceId the metadata source id
   * @param series the series name
   * @param maxRecords the maximum records
   * @param skipCache the skip cache flag
   * @return the volumes
   * @throws ScrapingException if an error occurs
   */
  public List<ScrapingVolume> getVolumes(
      final Long sourceId, final String series, final Integer maxRecords, final boolean skipCache)
      throws ScrapingException {
    final MetadataSource metadataSource = this.doLoadMetadataSource(sourceId);
    final ScrapingAdaptor scrapingAdaptor = this.doLoadScrapingAdaptor(metadataSource);
    List<ScrapingVolume> result = new ArrayList<>();
    final String source = scrapingAdaptor.getSource();
    final String key = scrapingAdaptor.getVolumeKey(series);

    log.debug(
        "Getting volumes: series={} maxRecords={} skipCache={}", series, maxRecords, skipCache);
    if (!skipCache) {
      log.debug("Fetching from the cache: source={} key={}", source, key);
      result = this.doLoadScrapingVolumes(source, key);
    }

    if (result.isEmpty()) {
      log.debug("Fetching from scraping source");
      final List<ScrapingVolume> fetched =
          scrapingAdaptor.getVolumes(series, maxRecords, metadataSource);

      log.debug("Fetched {} volume{}", fetched.size(), fetched.size() == 1 ? "" : "s");
      if (fetched.isEmpty()) {
        log.debug("No entries fetched");
      } else {
        result.addAll(fetched);
        log.debug("Encoding fetched entries");
        final List<String> cacheEntries = new ArrayList<>();
        for (ScrapingVolume volume : fetched) {
          try {
            cacheEntries.add(this.objectMapper.writeValueAsString(volume));
          } catch (JsonProcessingException error) {
            throw new ScrapingException("Failed to encoded scraping volume", error);
          }
        }
        log.debug("Caching fetched entries: source={} key={}", source, key);
        this.scrapingCacheService.saveToCache(source, key, cacheEntries);
      }
    }

    return result;
  }

  private MetadataSource doLoadMetadataSource(final Long sourceId) throws ScrapingException {
    try {
      return this.metadataSourceService.getById(sourceId);
    } catch (MetadataSourceException error) {
      throw new ScrapingException("Failed to load metadata source", error);
    }
  }

  private ScrapingAdaptor doLoadScrapingAdaptor(final MetadataSource metadataSource)
      throws ScrapingException {
    try {
      return this.applicationContext.getBean(metadataSource.getBeanName(), ScrapingAdaptor.class);
    } catch (BeansException error) {
      throw new ScrapingException("Failed to load scraping adaptor", error);
    }
  }

  private List<ScrapingVolume> doLoadScrapingVolumes(final String source, final String key) {
    List<ScrapingVolume> result = new ArrayList<>();
    final List<String> cachedEntries = this.scrapingCacheService.getFromCache(source, key);
    if (cachedEntries != null && !cachedEntries.isEmpty()) {
      for (String entry : cachedEntries) {
        try {
          result.add(this.objectMapper.readValue(entry, ScrapingVolume.class));
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
   * @throws ScrapingException if an error occurs
   */
  public ScrapingIssue getIssue(
      final Long sourceId,
      final Integer volumeId,
      final String issueNumber,
      final boolean skipCache)
      throws ScrapingException {
    final MetadataSource metadataSource = this.doLoadMetadataSource(sourceId);
    final ScrapingAdaptor scrapingAdaptor = this.doLoadScrapingAdaptor(metadataSource);
    final String source = scrapingAdaptor.getSource();
    final String key = scrapingAdaptor.getIssueKey(volumeId, issueNumber);
    log.debug(
        "Getting issue: volumeId={} issueNumber={} skipCache={}", volumeId, issueNumber, skipCache);

    ScrapingIssue result = null;

    if (!skipCache) {
      log.debug("Fetching from the cache: source={} key={}", source, key);
      final List<String> cachedEntries = this.scrapingCacheService.getFromCache(source, key);
      if (cachedEntries != null && !cachedEntries.isEmpty()) {
        log.debug("Decoding cached issue");
        try {
          result = this.objectMapper.readValue(cachedEntries.get(0), ScrapingIssue.class);
        } catch (JsonProcessingException error) {
          log.error("Failed to decode cached scraping issue", error);
        }
      }
    }

    if (result == null) {
      log.debug("Fetching from scraping source");
      result = scrapingAdaptor.getIssue(volumeId, issueNumber, metadataSource);
      if (result != null) {
        log.debug("Encoding fetched issue");
        final List<String> encodedValues = new ArrayList<>();
        try {
          encodedValues.add(this.objectMapper.writeValueAsString(result));
        } catch (JsonProcessingException error) {
          throw new ScrapingException("Failed to encode issue", error);
        }
        log.debug("Caching fetched issue: source={} key={}", source, key);
        this.scrapingCacheService.saveToCache(source, key, encodedValues);
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
   * @throws ScrapingException if an error occurs
   */
  public Comic scrapeComic(
      final Long metadataSourceId,
      final Long comicId,
      final Integer issueId,
      final boolean skipCache)
      throws ScrapingException {
    log.debug("Scraping comic: id={} issueId={} skipCache={}", comicId, issueId, skipCache);
    Comic result = null;
    final MetadataSource metadataSource = this.doLoadMetadataSource(metadataSourceId);
    final ScrapingAdaptor scrapingAdaptor = this.doLoadScrapingAdaptor(metadataSource);
    final String source = scrapingAdaptor.getSource();
    final String key = scrapingAdaptor.getIssueDetailsKey(issueId);

    try {
      result = this.comicService.getComic(comicId);
    } catch (ComicException error) {
      throw new ScrapingException("failed to load comic", error);
    }

    ScrapingIssueDetails issueDetails = null;

    if (!skipCache) {
      log.trace("Loading cached issue details: source={} key={}", source, key);
      issueDetails = this.doLoadIssueDetails(source, key);
    }

    if (issueDetails == null) {
      log.debug("Fetching issue details");
      issueDetails = scrapingAdaptor.getIssueDetails(issueId, metadataSource);

      if (issueDetails != null) {
        log.debug("Encoding fetched issue details");
        List<String> encodedDetails = new ArrayList<>();
        try {
          encodedDetails.add(this.objectMapper.writeValueAsString(issueDetails));
          log.debug("Caching fetched issue details");
          this.scrapingCacheService.saveToCache(source, key, encodedDetails);
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
      comic.setNotes(String.format("Comic details scraped by %s", scrapingAdaptor.getIdentifier()));
      log.trace("Checking for imprint");
      this.imprintService.update(comic);
      log.trace("Updating comic state: scraped");
      this.comicStateHandler.fireEvent(comic, ComicEvent.scraped);
    }
    try {
      return this.comicService.getComic(comicId);
    } catch (ComicException error) {
      throw new ScrapingException("failed to load comic", error);
    }
  }

  Date adjustForTimezone(final Date date) {
    final LocalDateTime localDateTime =
        LocalDateTime.ofInstant(date.toInstant(), ZoneId.systemDefault());
    return new Date(localDateTime.atOffset(ZoneOffset.UTC).toInstant().toEpochMilli());
  }

  private ScrapingIssueDetails doLoadIssueDetails(final String source, final String key)
      throws ScrapingException {
    final List<String> cachedEntries = this.scrapingCacheService.getFromCache(source, key);
    if (cachedEntries != null && !cachedEntries.isEmpty()) {
      log.debug("Decoding cached issue details");
      try {
        return this.objectMapper.readValue(cachedEntries.get(0), ScrapingIssueDetails.class);
      } catch (JsonProcessingException error) {
        throw new ScrapingException("Failed to decoded cached issue details", error);
      }
    }
    log.trace("No cached entries found");
    return null;
  }
}
