/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2024, The ComiXed Project
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

package org.comixedproject.adaptors.content;

import static org.apache.commons.lang3.StringUtils.trim;
import static org.apache.commons.lang3.StringUtils.truncate;

import java.io.ByteArrayInputStream;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.*;
import lombok.Getter;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.adaptors.archive.model.ArchiveEntryType;
import org.comixedproject.model.comicbooks.Comic;
import org.comixedproject.model.comicbooks.ComicTag;
import org.comixedproject.model.comicbooks.ComicTagType;
import org.comixedproject.model.comicpages.ComicPage;
import org.comixedproject.model.metadata.ComicInfo;
import org.comixedproject.model.metadata.PageInfo;
import org.springframework.http.converter.xml.JacksonXmlHttpMessageConverter;
import org.springframework.util.StringUtils;
import tools.jackson.core.exc.StreamReadException;
import tools.jackson.databind.DeserializationFeature;

/**
 * <code>ComicInfoXmlFilenameContentAdaptor</code> provides an implementation of {@link
 * FilenameContentAdaptor} that loads files named <code>ComicInfo.xml</code>.
 *
 * @author Darryl L. Pierce
 */
@Log4j2
public class ComicInfoXmlFilenameContentAdaptor implements FilenameContentAdaptor {
  @Getter private ArchiveEntryType archiveEntryType = ArchiveEntryType.FILE;

  private SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
  private final JacksonXmlHttpMessageConverter xmlConverter;

  public ComicInfoXmlFilenameContentAdaptor() {
    this.xmlConverter = new JacksonXmlHttpMessageConverter();
    this.xmlConverter
        .getMapper()
        .rebuild()
        .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false)
        .build();
  }

  @Override
  public void loadContent(final Comic comic, final String filename, final byte[] content)
      throws ContentAdaptorException {
    log.trace("Reading ComicInfo.xml content");
    final ComicInfo comicInfo;
    try {
      comicInfo =
          this.xmlConverter
              .getMapper()
              .readValue(new ByteArrayInputStream(content), ComicInfo.class);
      log.trace("Setting comic metadata");
      comic.setPublisher(trim(comicInfo.getPublisher()));
      comic.setSeries(trim(comicInfo.getSeries()));
      comic.setVolume(truncate(trim(comicInfo.getVolume()), 0, 4));
      comic.setIssueNumber(trim(comicInfo.getIssueNumber()));
      if (comicInfo.getYear() != null && comicInfo.getMonth() != null) {
        GregorianCalendar gc =
            new GregorianCalendar(comicInfo.getYear(), comicInfo.getMonth() - 1, 1);
        comic.setCoverDate(gc.getTime());
      }
      comic.setTitle(trim(comicInfo.getTitle()));
      comic.setDescription(trim(comicInfo.getSummary()));
      comic.setNotes(trim(comicInfo.getNotes()));
      if (comicInfo.getMetadata() != null
          && StringUtils.hasLength(comicInfo.getMetadata().getName())
          && StringUtils.hasLength(comicInfo.getMetadata().getReferenceId())) {
        log.debug("Loading comic metadata source details");
        comic.setMetadataSourceName(comicInfo.getMetadata().getName());
        comic.setMetadataReferenceId(trim(comicInfo.getMetadata().getReferenceId()));
        if (StringUtils.hasLength(comicInfo.getMetadata().getLastScrapedDate())) {
          try {
            comic.setLastScrapedDate(
                this.dateFormat.parse(comicInfo.getMetadata().getLastScrapedDate()));
          } catch (ParseException error) {
            throw new ContentAdaptorException("Failed to last scraped data from metadata", error);
          }
        }
      }
      comic.setWebAddress(comicInfo.getWeb());
      log.debug("Clearing comic tags");
      comic.getTags().clear();
      this.commandSeparatedList(comicInfo.getCharacters())
          .forEach(
              name -> comic.getTags().add(new ComicTag(comic, ComicTagType.CHARACTER, trim(name))));
      this.commandSeparatedList(comicInfo.getTeams())
          .forEach(name -> comic.getTags().add(new ComicTag(comic, ComicTagType.TEAM, trim(name))));
      this.commandSeparatedList(comicInfo.getLocations())
          .forEach(
              name -> comic.getTags().add(new ComicTag(comic, ComicTagType.LOCATION, trim(name))));
      this.commandSeparatedList(comicInfo.getAlternateSeries())
          .forEach(
              name -> comic.getTags().add(new ComicTag(comic, ComicTagType.STORY, trim(name))));
      this.commandSeparatedList(comicInfo.getWriter())
          .forEach(
              name -> comic.getTags().add(new ComicTag(comic, ComicTagType.WRITER, trim(name))));
      this.commandSeparatedList(comicInfo.getEditor())
          .forEach(
              name -> comic.getTags().add(new ComicTag(comic, ComicTagType.EDITOR, trim(name))));
      this.commandSeparatedList(comicInfo.getPenciller())
          .forEach(
              name -> comic.getTags().add(new ComicTag(comic, ComicTagType.PENCILLER, trim(name))));
      this.commandSeparatedList(comicInfo.getInker())
          .forEach(
              name -> comic.getTags().add(new ComicTag(comic, ComicTagType.INKER, trim(name))));
      this.commandSeparatedList(comicInfo.getColorist())
          .forEach(
              name -> comic.getTags().add(new ComicTag(comic, ComicTagType.COLORIST, trim(name))));
      this.commandSeparatedList(comicInfo.getLetterer())
          .forEach(
              name -> comic.getTags().add(new ComicTag(comic, ComicTagType.LETTERER, trim(name))));
      this.commandSeparatedList(comicInfo.getCoverArtist())
          .forEach(
              name -> comic.getTags().add(new ComicTag(comic, ComicTagType.COVER, trim(name))));
      log.debug("Loading page metadata");
      for (int index = 0; index < comicInfo.getPages().size(); index++) {
        final PageInfo pageInfo = comicInfo.getPages().get(index);
        // only extract data if we can match the filename to the entry
        if (Objects.nonNull(pageInfo) && StringUtils.hasLength(pageInfo.getFilename())) {
          final Optional<ComicPage> optionalPage =
              comic.getPages().stream()
                  .filter(
                      comicPage ->
                          Objects.nonNull(comicPage)
                              && comicPage.getFilename().equals(pageInfo.getFilename()))
                  .findFirst();
          if (optionalPage.isPresent()) {
            final ComicPage page = optionalPage.get();
            page.setPageNumber(pageInfo.getPageNumber());
            if (Objects.nonNull(pageInfo.getImageType())) {
              page.setPageType(pageInfo.getImageType().getComicPageType());
            }
            page.setWidth(pageInfo.getImageWidth());
            page.setHeight(pageInfo.getImageHeight());
            page.setHash(pageInfo.getImageHash());
          } else {
            log.warn("No comic page found for comic page: " + pageInfo.getPageNumber());
          }
        }
      }
    } catch (StreamReadException error) {
      throw new ContentAdaptorException("Failed to load ComicInfo.xml", error);
    }
  }

  private List<String> commandSeparatedList(String text) {
    if (!StringUtils.hasLength(text)) {
      return Collections.emptyList();
    }
    List<String> result = new ArrayList<>();
    var tokens = new StringTokenizer(text, ",");

    while (tokens.hasMoreTokens()) {
      result.add(tokens.nextToken().trim());
    }

    return result;
  }
}
