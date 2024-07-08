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

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationFeature;
import java.util.Calendar;
import java.util.GregorianCalendar;
import java.util.stream.Collectors;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.comicbooks.*;
import org.comixedproject.model.metadata.ComicInfo;
import org.comixedproject.model.metadata.ComicInfoMetadataSource;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.converter.xml.MappingJackson2XmlHttpMessageConverter;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
@Log4j2
public class ComicMetadataWriter implements InitializingBean {
  @Autowired MappingJackson2XmlHttpMessageConverter xmlConverter;

  @Override
  public void afterPropertiesSet() throws Exception {
    this.xmlConverter
        .getObjectMapper()
        .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
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
    var comicDetail = comicBook.getComicDetail();
    comicInfo.setWeb(comicDetail.getWebAddress());
    comicInfo.setPublisher(comicDetail.getPublisher());
    comicInfo.setSeries(comicDetail.getSeries());
    comicInfo.setVolume(comicDetail.getVolume());
    comicInfo.setIssueNumber(comicDetail.getIssueNumber());
    if (comicDetail.getCoverDate() != null) {
      final GregorianCalendar calendar = new GregorianCalendar();
      calendar.setTime(comicDetail.getCoverDate());
      comicInfo.setYear(calendar.get(Calendar.YEAR));
      comicInfo.setMonth(calendar.get(Calendar.MONTH) + 1);
    }
    comicInfo.setTitle(comicDetail.getTitle());
    final ComicDetail detail = comicDetail;
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
    comicInfo.setNotes(comicDetail.getNotes());
    comicInfo.setSummary(comicDetail.getDescription());
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
