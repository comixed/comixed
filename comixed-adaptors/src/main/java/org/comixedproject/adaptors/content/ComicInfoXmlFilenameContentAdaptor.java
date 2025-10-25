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

import static java.util.Calendar.*;
import static org.apache.commons.lang3.StringUtils.trim;
import static org.apache.commons.lang3.StringUtils.truncate;

import com.fasterxml.jackson.databind.DeserializationFeature;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.*;
import lombok.Getter;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.adaptors.archive.model.ArchiveEntryType;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.comicbooks.ComicDetail;
import org.comixedproject.model.comicbooks.ComicTag;
import org.comixedproject.model.comicbooks.ComicTagType;
import org.comixedproject.model.comicpages.ComicPage;
import org.comixedproject.model.metadata.ComicInfo;
import org.comixedproject.model.metadata.PageInfo;
import org.springframework.http.converter.xml.MappingJackson2XmlHttpMessageConverter;
import org.springframework.util.StringUtils;

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
  private MappingJackson2XmlHttpMessageConverter xmlConverter;

  public ComicInfoXmlFilenameContentAdaptor() {
    this.xmlConverter = new MappingJackson2XmlHttpMessageConverter();
    this.xmlConverter
        .getObjectMapper()
        .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
  }

  @Override
  public void loadContent(
      final ComicBook comicBook,
      final String filename,
      final byte[] content,
      final ContentAdaptorRules rules)
      throws ContentAdaptorException {
    if (rules.isSkipMetadata()) {
      log.info("Skipping metadata import due to rule");
      return;
    }
    log.trace("Reading ComicInfo.xml content");
    final ComicInfo comicInfo;
    try {
      comicInfo =
          this.xmlConverter
              .getObjectMapper()
              .readValue(new ByteArrayInputStream(content), ComicInfo.class);
      log.trace("Setting comic metadata");
      comicBook.getComicDetail().setPublisher(trim(comicInfo.getPublisher()));
      comicBook.getComicDetail().setSeries(trim(comicInfo.getSeries()));
      comicBook.getComicDetail().setVolume(truncate(trim(comicInfo.getVolume()), 0, 4));
      comicBook.getComicDetail().setIssueNumber(trim(comicInfo.getIssueNumber()));
      if (comicInfo.getYear() != null && comicInfo.getMonth() != null) {
        GregorianCalendar gc =
            new GregorianCalendar(comicInfo.getYear(), comicInfo.getMonth() - 1, 1);
        comicBook.getComicDetail().setCoverDate(gc.getTime());
      }
      comicBook.getComicDetail().setTitle(trim(comicInfo.getTitle()));
      comicBook.getComicDetail().setDescription(trim(comicInfo.getSummary()));
      comicBook.getComicDetail().setNotes(trim(comicInfo.getNotes()));
      if (comicInfo.getMetadata() != null
          && StringUtils.hasLength(comicInfo.getMetadata().getName())
          && StringUtils.hasLength(comicInfo.getMetadata().getReferenceId())) {
        log.debug("Loading comic metadata source details");
        comicBook.setMetadataSourceName(comicInfo.getMetadata().getName());
        comicBook.setMetadataReferenceId(trim(comicInfo.getMetadata().getReferenceId()));
        if (StringUtils.hasLength(comicInfo.getMetadata().getLastScrapedDate())) {
          comicBook.setLastScrapedDate(
              this.dateFormat.parse(comicInfo.getMetadata().getLastScrapedDate()));
        }
      }
      final ComicDetail detail = comicBook.getComicDetail();
      detail.setWebAddress(comicInfo.getWeb());
      log.debug("Clearing comic tags");
      detail.getTags().clear();
      this.commandSeparatedList(comicInfo.getCharacters())
          .forEach(
              name ->
                  detail.getTags().add(new ComicTag(detail, ComicTagType.CHARACTER, trim(name))));
      this.commandSeparatedList(comicInfo.getTeams())
          .forEach(
              name -> detail.getTags().add(new ComicTag(detail, ComicTagType.TEAM, trim(name))));
      this.commandSeparatedList(comicInfo.getLocations())
          .forEach(
              name ->
                  detail.getTags().add(new ComicTag(detail, ComicTagType.LOCATION, trim(name))));
      this.commandSeparatedList(comicInfo.getAlternateSeries())
          .forEach(
              name -> detail.getTags().add(new ComicTag(detail, ComicTagType.STORY, trim(name))));
      this.commandSeparatedList(comicInfo.getWriter())
          .forEach(
              name -> detail.getTags().add(new ComicTag(detail, ComicTagType.WRITER, trim(name))));
      this.commandSeparatedList(comicInfo.getEditor())
          .forEach(
              name -> detail.getTags().add(new ComicTag(detail, ComicTagType.EDITOR, trim(name))));
      this.commandSeparatedList(comicInfo.getPenciller())
          .forEach(
              name ->
                  detail.getTags().add(new ComicTag(detail, ComicTagType.PENCILLER, trim(name))));
      this.commandSeparatedList(comicInfo.getInker())
          .forEach(
              name -> detail.getTags().add(new ComicTag(detail, ComicTagType.INKER, trim(name))));
      this.commandSeparatedList(comicInfo.getColorist())
          .forEach(
              name ->
                  detail.getTags().add(new ComicTag(detail, ComicTagType.COLORIST, trim(name))));
      this.commandSeparatedList(comicInfo.getLetterer())
          .forEach(
              name ->
                  detail.getTags().add(new ComicTag(detail, ComicTagType.LETTERER, trim(name))));
      this.commandSeparatedList(comicInfo.getCoverArtist())
          .forEach(
              name -> detail.getTags().add(new ComicTag(detail, ComicTagType.COVER, trim(name))));
      log.debug("Loading page metadata");
      for (int index = 0; index < comicInfo.getPages().size(); index++) {
        final PageInfo pageInfo = comicInfo.getPages().get(index);
        // only extract data if we can match the filename to the entry
        if (Objects.nonNull(pageInfo) && StringUtils.hasLength(pageInfo.getFilename())) {
          final Optional<ComicPage> optionalPage =
              comicBook.getPages().stream()
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
    } catch (IOException | ParseException error) {
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
