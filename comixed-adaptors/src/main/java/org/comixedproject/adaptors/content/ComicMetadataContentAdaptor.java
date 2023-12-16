/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2017, The ComiXed Project
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

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationFeature;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.comicbooks.ComicDetail;
import org.comixedproject.model.comicbooks.ComicMetadataSource;
import org.comixedproject.model.comicbooks.ComicTag;
import org.comixedproject.model.comicbooks.ComicTagType;
import org.comixedproject.model.metadata.ComicInfo;
import org.comixedproject.model.metadata.ComicInfoMetadataSource;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.converter.xml.MappingJackson2XmlHttpMessageConverter;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

/**
 * <code>ComicMetadataContentAdaptor</code> loads data from the ComicInfo.xml file within a comic.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class ComicMetadataContentAdaptor extends AbstractContentAdaptor
    implements InitializingBean {
  @Autowired MappingJackson2XmlHttpMessageConverter xmlConverter;

  @Override
  public void afterPropertiesSet() throws Exception {
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
      comicBook.getComicDetail().setPublisher(comicInfo.getPublisher());
      comicBook.getComicDetail().setSeries(comicInfo.getSeries());
      comicBook.getComicDetail().setVolume(comicInfo.getVolume());
      comicBook.getComicDetail().setIssueNumber(comicInfo.getIssueNumber());
      if (comicInfo.getYear() != null && comicInfo.getMonth() != null) {
        GregorianCalendar gc =
            new GregorianCalendar(comicInfo.getYear(), comicInfo.getMonth() - 1, 1);
        comicBook.getComicDetail().setCoverDate(gc.getTime());
      }
      comicBook.getComicDetail().setTitle(comicInfo.getTitle());
      comicBook.getComicDetail().setDescription(comicInfo.getSummary());
      comicBook.getComicDetail().setNotes(comicInfo.getNotes());
      if (comicInfo.getMetadata() != null
          && StringUtils.hasLength(comicInfo.getMetadata().getName())
          && StringUtils.hasLength(comicInfo.getMetadata().getReferenceId())) {
        log.debug("Loading comic metadata source details");
        comicBook.setMetadataSourceName(comicInfo.getMetadata().getName());
        comicBook.setMetadataReferenceId(comicInfo.getMetadata().getReferenceId());
      }
      final ComicDetail detail = comicBook.getComicDetail();
      log.debug("Clearing comic tags");
      detail.getTags().clear();
      this.commandSeparatedList(comicInfo.getCharacters())
          .forEach(
              name -> detail.getTags().add(new ComicTag(detail, ComicTagType.CHARACTER, name)));
      this.commandSeparatedList(comicInfo.getTeams())
          .forEach(name -> detail.getTags().add(new ComicTag(detail, ComicTagType.TEAM, name)));
      this.commandSeparatedList(comicInfo.getLocations())
          .forEach(name -> detail.getTags().add(new ComicTag(detail, ComicTagType.LOCATION, name)));
      this.commandSeparatedList(comicInfo.getAlternateSeries())
          .forEach(name -> detail.getTags().add(new ComicTag(detail, ComicTagType.STORY, name)));
      this.commandSeparatedList(comicInfo.getWriter())
          .forEach(name -> detail.getTags().add(new ComicTag(detail, ComicTagType.WRITER, name)));
      this.commandSeparatedList(comicInfo.getEditor())
          .forEach(name -> detail.getTags().add(new ComicTag(detail, ComicTagType.EDITOR, name)));
      this.commandSeparatedList(comicInfo.getPenciller())
          .forEach(
              name -> detail.getTags().add(new ComicTag(detail, ComicTagType.PENCILLER, name)));
      this.commandSeparatedList(comicInfo.getInker())
          .forEach(name -> detail.getTags().add(new ComicTag(detail, ComicTagType.INKER, name)));
      this.commandSeparatedList(comicInfo.getColorist())
          .forEach(name -> detail.getTags().add(new ComicTag(detail, ComicTagType.COLORIST, name)));
      this.commandSeparatedList(comicInfo.getLetterer())
          .forEach(name -> detail.getTags().add(new ComicTag(detail, ComicTagType.LETTERER, name)));
      this.commandSeparatedList(comicInfo.getCoverArtist())
          .forEach(name -> detail.getTags().add(new ComicTag(detail, ComicTagType.COVER, name)));
    } catch (IOException error) {
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

  /**
   * Writes the content of the provided comicBook as a ComicInfo.xml file to the provided output
   * stream.
   *
   * @param comicBook the comicBook
   * @return the content of the file
   * @throws org.comixedproject.adaptors.content.ContentAdaptorException if an error occurs
   */
  public byte[] createContent(ComicBook comicBook) throws ContentAdaptorException {
    log.trace("Mapping comic metadata to ComicInfo");
    final ComicInfo comicInfo = new ComicInfo();
    comicInfo.setPublisher(comicBook.getComicDetail().getPublisher());
    comicInfo.setSeries(comicBook.getComicDetail().getSeries());
    comicInfo.setVolume(comicBook.getComicDetail().getVolume());
    comicInfo.setIssueNumber(comicBook.getComicDetail().getIssueNumber());
    if (comicBook.getComicDetail().getCoverDate() != null) {
      final GregorianCalendar calendar = new GregorianCalendar();
      calendar.setTime(comicBook.getComicDetail().getCoverDate());
      comicInfo.setYear(calendar.get(Calendar.YEAR));
      comicInfo.setMonth(calendar.get(Calendar.MONTH) + 1);
    }
    comicInfo.setTitle(comicBook.getComicDetail().getTitle());
    final ComicDetail detail = comicBook.getComicDetail();
    comicInfo.setCharacters(
        String.join(
            ",",
            detail.getTags().stream()
                .filter(tag -> tag.getType() == ComicTagType.CHARACTER)
                .map(ComicTag::getValue)
                .collect(Collectors.toList())));
    comicInfo.setTeams(
        String.join(
            ",",
            detail.getTags().stream()
                .filter(tag -> tag.getType() == ComicTagType.TEAM)
                .map(ComicTag::getValue)
                .collect(Collectors.toList())));
    comicInfo.setLocations(
        String.join(
            ",",
            detail.getTags().stream()
                .filter(tag -> tag.getType() == ComicTagType.LOCATION)
                .map(ComicTag::getValue)
                .collect(Collectors.toList())));
    comicInfo.setAlternateSeries(
        String.join(
            ",",
            detail.getTags().stream()
                .filter(tag -> tag.getType() == ComicTagType.STORY)
                .map(ComicTag::getValue)
                .collect(Collectors.toList())));
    comicInfo.setWriter(
        String.join(
            ",",
            detail.getTags().stream()
                .filter(tag -> tag.getType() == ComicTagType.WRITER)
                .map(ComicTag::getValue)
                .collect(Collectors.toList())));
    comicInfo.setEditor(
        String.join(
            ",",
            detail.getTags().stream()
                .filter(tag -> tag.getType() == ComicTagType.EDITOR)
                .map(ComicTag::getValue)
                .collect(Collectors.toList())));
    comicInfo.setPenciller(
        String.join(
            ",",
            detail.getTags().stream()
                .filter(tag -> tag.getType() == ComicTagType.PENCILLER)
                .map(ComicTag::getValue)
                .collect(Collectors.toList())));
    comicInfo.setInker(
        String.join(
            ",",
            detail.getTags().stream()
                .filter(tag -> tag.getType() == ComicTagType.INKER)
                .map(ComicTag::getValue)
                .collect(Collectors.toList())));
    comicInfo.setColorist(
        String.join(
            ",",
            detail.getTags().stream()
                .filter(tag -> tag.getType() == ComicTagType.COLORIST)
                .map(ComicTag::getValue)
                .collect(Collectors.toList())));
    comicInfo.setLetterer(
        String.join(
            ",",
            detail.getTags().stream()
                .filter(tag -> tag.getType() == ComicTagType.LETTERER)
                .map(ComicTag::getValue)
                .collect(Collectors.toList())));
    comicInfo.setCoverArtist(
        String.join(
            ",",
            detail.getTags().stream()
                .filter(tag -> tag.getType() == ComicTagType.COVER)
                .map(ComicTag::getValue)
                .collect(Collectors.toList())));
    comicInfo.setNotes(comicBook.getComicDetail().getNotes());
    comicInfo.setSummary(comicBook.getComicDetail().getDescription());
    final ComicMetadataSource metadata = comicBook.getMetadata();
    if (metadata != null
        && StringUtils.hasLength(metadata.getMetadataSource().getAdaptorName())
        && StringUtils.hasLength(metadata.getReferenceId())) {
      log.debug("Adding metadata source details");
      comicInfo.setMetadata(
          new ComicInfoMetadataSource(
              metadata.getMetadataSource().getAdaptorName(), metadata.getReferenceId()));
    }
    try {
      log.trace("Generating ComicInfo.xml data");
      return this.xmlConverter.getObjectMapper().writeValueAsBytes(comicInfo);
    } catch (JsonProcessingException error) {
      throw new ContentAdaptorException("Failed to write ComicInfo.xml data", error);
    }
  }
}
