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
 * along with this program. If not, see <http://www.gnu.org/licenses>
 */

package org.comixedproject.scrapers.comicvine.adaptors;

import com.fasterxml.jackson.core.JsonProcessingException;
import java.util.ArrayList;
import java.util.List;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.comic.Comic;
import org.comixedproject.scrapers.ScrapingException;
import org.comixedproject.scrapers.adaptors.AbstractScrapingAdaptor;
import org.comixedproject.scrapers.comicvine.actions.ComicVineGetIssuesAction;
import org.comixedproject.scrapers.comicvine.actions.ComicVineGetVolumesAction;
import org.comixedproject.scrapers.comicvine.actions.ComicVineScrapeComicAction;
import org.comixedproject.scrapers.model.ScrapingIssue;
import org.comixedproject.scrapers.model.ScrapingIssueDetails;
import org.comixedproject.scrapers.model.ScrapingVolume;
import org.springframework.beans.factory.ObjectFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * <code>ComicVineScrapingAdaptor</code> provides an implementation of {@link ScrapingAdaptor} for
 * ComicVine.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class ComicVineScrapingAdaptor extends AbstractScrapingAdaptor {
  public static final String CACHE_KEY = "comicvine";
  public static final String BASE_URL = "https://comicvine.gamespot.com";

  @Autowired private ObjectFactory<ComicVineGetVolumesAction> getVolumesActionObjectFactory;
  @Autowired private ObjectFactory<ComicVineGetIssuesAction> getIssuesActionObjectFactory;
  @Autowired private ObjectFactory<ComicVineScrapeComicAction> scrapeComicActionObjectFactory;

  @Override
  public List<ScrapingVolume> getVolumes(
      final String apiKey, final String seriesName, final boolean skipCache)
      throws ScrapingException {
    log.debug(
        "Fetching volumes from ComicVine: seriesName={} {}",
        seriesName,
        skipCache ? "(skip cache)" : "");

    final List<ScrapingVolume> result = new ArrayList<>();

    if (!skipCache) {
      this.loadEntriesFromCache(
          CACHE_KEY,
          this.getVolumeKey(seriesName),
          value -> {
            try {
              result.add(this.objectMapper.readValue(value, ScrapingVolume.class));
            } catch (JsonProcessingException error) {
              throw new ScrapingException("error reading cached value", error);
            }
          });
    }

    if (result.isEmpty()) {
      final ComicVineGetVolumesAction action = this.getVolumesActionObjectFactory.getObject();
      action.setBaseUrl(BASE_URL);
      action.setApiKey(apiKey);
      action.setSeries(seriesName);

      log.debug("Executing action");
      result.addAll(action.execute());
      if (!result.isEmpty()) {
        log.debug(
            "Preparing {} volume{} for caching", result.size(), result.size() == 1 ? "" : "s");
        List<String> cacheValues = new ArrayList<>();
        for (int index = 0; index < result.size(); index++) {
          try {
            cacheValues.add(this.objectMapper.writeValueAsString(result.get(index)));
          } catch (JsonProcessingException error) {
            throw new ScrapingException("error encoding volume for caching", error);
          }
        }
        log.debug("Storing values in the cache");
        this.scrapingCacheService.saveToCache(
            CACHE_KEY, this.getVolumeKey(seriesName), cacheValues);
      } else {
        log.debug("No results received");
      }
    }

    log.debug("Returning {} volume{}", result.size(), result.size() == 1 ? "" : "s");
    return result;
  }

  @Override
  public ScrapingIssue doGetIssue(
      final String apiKey, final Integer volume, final String issueNumber, final boolean skipCache)
      throws ScrapingException {
    log.debug(
        "Fetching issue from ComicVine: volume={} issueNumber={} {}",
        volume,
        issueNumber,
        skipCache ? "(skip cache)" : "");

    final List<ScrapingIssue> result = new ArrayList<>();

    if (Boolean.FALSE.equals(skipCache)) {
      this.loadEntriesFromCache(
          CACHE_KEY,
          this.getIssuesKey(volume, issueNumber),
          value -> {
            try {
              result.add(this.objectMapper.readValue(value, ScrapingIssue.class));
            } catch (JsonProcessingException error) {
              throw new ScrapingException("error reading cached value", error);
            }
          });
    }

    if (result.isEmpty()) {
      final ComicVineGetIssuesAction getIssuesAction =
          this.getIssuesActionObjectFactory.getObject();

      getIssuesAction.setBaseUrl(BASE_URL);
      getIssuesAction.setApiKey(apiKey);
      getIssuesAction.setVolumeId(volume);
      getIssuesAction.setIssueNumber(issueNumber);

      result.addAll(getIssuesAction.execute());
      if (!result.isEmpty()) {
        log.debug("Preparing {} issue{} for caching", result.size(), result.size() == 1 ? "" : "s");
        List<String> cacheValues = new ArrayList<>();
        for (int index = 0; index < result.size(); index++) {
          try {
            cacheValues.add(this.objectMapper.writeValueAsString(result.get(index)));
          } catch (JsonProcessingException error) {
            throw new ScrapingException("error encoding issue for caching", error);
          }
        }
        log.debug("Storing values in the cache");
        this.scrapingCacheService.saveToCache(
            CACHE_KEY, this.getIssuesKey(volume, issueNumber), cacheValues);
      } else {
        log.debug("No results received");
      }
    }

    return result.isEmpty() ? null : result.get(0);
  }

  @Override
  public void doScrapeComic(
      final String apiKey, final String issueId, final Boolean skipCache, final Comic comic)
      throws ScrapingException {
    ScrapingIssueDetails details = null;

    if (!skipCache) {
      log.debug("Checking scraping cache");
      final List<String> encoded =
          this.scrapingCacheService.getFromCache(CACHE_KEY, this.getComicDetailsKey(issueId));
      if (encoded != null && !encoded.isEmpty()) {
        log.debug("Decoding cached entry");
        try {
          details = this.objectMapper.readValue(encoded.get(0), ScrapingIssueDetails.class);
        } catch (JsonProcessingException error) {
          throw new ScrapingException("error decoding issue", error);
        }
      }
    }

    if (details == null) {
      final ComicVineScrapeComicAction action = this.scrapeComicActionObjectFactory.getObject();

      action.setBaseUrl(BASE_URL);
      action.setApiKey(apiKey);
      action.setIssueId(issueId);

      details = action.execute();

      if (details != null) {
        log.debug("Storing the issue details");
        final List<String> values = new ArrayList<>();
        try {
          values.add(this.objectMapper.writeValueAsString(details));
        } catch (JsonProcessingException error) {
          throw new ScrapingException("error encoding details for caching", error);
        }
        this.scrapingCacheService.saveToCache(CACHE_KEY, this.getComicDetailsKey(issueId), values);
      }
    }

    if (details != null) {
      log.debug("Updating comic with details");
      comic.setPublisher(details.getPublisher());
      comic.setSeries(details.getSeries());
      comic.setVolume(details.getVolume());
      comic.setIssueNumber(details.getIssueNumber());
      comic.setCoverDate(details.getCoverDate());
      comic.setDescription(details.getDescription());
      comic.clearCharacters();
      details.getCharacters().forEach(character -> comic.addCharacter(character));
      comic.clearTeams();
      details.getTeams().forEach(team -> comic.addTeam(team));
      comic.clearLocations();
      details.getLocations().forEach(location -> comic.addLocation(location));
      comic.clearStoryArcs();
      details.getStories().forEach(story -> comic.addStoryArc(story));
      comic.clearCredits();
      details.getCredits().forEach(entry -> comic.addCredit(entry.getName(), entry.getRole()));
    }
  }
}
