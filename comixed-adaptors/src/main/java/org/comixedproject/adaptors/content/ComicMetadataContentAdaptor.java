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
import org.comixedproject.model.comicbooks.Credit;
import org.comixedproject.model.metadata.ComicInfo;
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
  public void loadContent(final ComicBook comicBook, final String filename, final byte[] content)
      throws ContentAdaptorException {
    log.trace("Reading ComicInfo.xml content");
    final ComicInfo comicInfo;
    try {
      comicInfo =
          this.xmlConverter
              .getObjectMapper()
              .readValue(new ByteArrayInputStream(content), ComicInfo.class);
      log.trace("Setting comic metadata");
      comicBook.setPublisher(comicInfo.getPublisher());
      comicBook.setSeries(comicInfo.getSeries());
      comicBook.setVolume(comicInfo.getVolume());
      comicBook.setIssueNumber(comicInfo.getIssueNumber());
      if (comicInfo.getYear() != null && comicInfo.getMonth() != null) {
        GregorianCalendar gc =
            new GregorianCalendar(comicInfo.getYear(), comicInfo.getMonth() - 1, 1);
        comicBook.setCoverDate(gc.getTime());
      }
      comicBook.setTitle(comicInfo.getTitle());
      comicBook.setDescription(comicInfo.getSummary());
      comicBook.setNotes(comicInfo.getNotes());
      this.addElementsToList(comicInfo.getCharacters(), comicBook.getCharacters());
      this.addElementsToList(comicInfo.getTeams(), comicBook.getTeams());
      this.addElementsToList(comicInfo.getLocations(), comicBook.getLocations());
      this.addElementsToList(comicInfo.getAlternateSeries(), comicBook.getStories());
      this.commandSeparatedList(comicInfo.getWriter())
          .forEach(name -> comicBook.getCredits().add(new Credit(comicBook, name, "writer")));
      this.commandSeparatedList(comicInfo.getEditor())
          .forEach(name -> comicBook.getCredits().add(new Credit(comicBook, name, "editor")));
      this.commandSeparatedList(comicInfo.getPenciller())
          .forEach(name -> comicBook.getCredits().add(new Credit(comicBook, name, "penciller")));
      this.commandSeparatedList(comicInfo.getInker())
          .forEach(name -> comicBook.getCredits().add(new Credit(comicBook, name, "inker")));
      this.commandSeparatedList(comicInfo.getColorist())
          .forEach(name -> comicBook.getCredits().add(new Credit(comicBook, name, "colorist")));
      this.commandSeparatedList(comicInfo.getLetterer())
          .forEach(name -> comicBook.getCredits().add(new Credit(comicBook, name, "letterer")));
      this.commandSeparatedList(comicInfo.getCoverArtist())
          .forEach(name -> comicBook.getCredits().add(new Credit(comicBook, name, "cover")));
    } catch (IOException error) {
      throw new ContentAdaptorException("Failed to load ComicInfo.xml", error);
    }
  }

  private void addElementsToList(final String elementText, final List<String> list) {
    this.commandSeparatedList(elementText).stream().forEach(list::add);
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
    comicInfo.setPublisher(comicBook.getPublisher());
    comicInfo.setSeries(comicBook.getSeries());
    comicInfo.setVolume(comicBook.getVolume());
    comicInfo.setIssueNumber(comicBook.getIssueNumber());
    if (comicBook.getCoverDate() != null) {
      final GregorianCalendar calendar = new GregorianCalendar();
      calendar.setTime(comicBook.getCoverDate());
      comicInfo.setYear(calendar.get(Calendar.YEAR));
      comicInfo.setMonth(calendar.get(Calendar.MONTH) + 1);
    }
    comicInfo.setTitle(comicBook.getTitle());
    comicInfo.setCharacters(String.join(",", comicBook.getCharacters()));
    comicInfo.setTeams(String.join(",", comicBook.getTeams()));
    comicInfo.setLocations(String.join(",", comicBook.getLocations()));
    comicInfo.setAlternateSeries(String.join(",", comicBook.getStories()));
    comicInfo.setWriter(
        String.join(
            ",",
            comicBook.getCredits().stream()
                .filter(credit -> credit.getRole().equals("writer"))
                .map(Credit::getName)
                .collect(Collectors.toList())));
    comicInfo.setEditor(
        String.join(
            ",",
            comicBook.getCredits().stream()
                .filter(credit -> credit.getRole().equals("editor"))
                .map(Credit::getName)
                .collect(Collectors.toList())));
    comicInfo.setPenciller(
        String.join(
            ",",
            comicBook.getCredits().stream()
                .filter(credit -> credit.getRole().equals("penciller"))
                .map(Credit::getName)
                .collect(Collectors.toList())));
    comicInfo.setInker(
        String.join(
            ",",
            comicBook.getCredits().stream()
                .filter(credit -> credit.getRole().equals("inker"))
                .map(Credit::getName)
                .collect(Collectors.toList())));
    comicInfo.setColorist(
        String.join(
            ",",
            comicBook.getCredits().stream()
                .filter(credit -> credit.getRole().equals("colorist"))
                .map(Credit::getName)
                .collect(Collectors.toList())));
    comicInfo.setLetterer(
        String.join(
            ",",
            comicBook.getCredits().stream()
                .filter(credit -> credit.getRole().equals("letterer"))
                .map(Credit::getName)
                .collect(Collectors.toList())));
    comicInfo.setCoverArtist(
        String.join(
            ",",
            comicBook.getCredits().stream()
                .filter(credit -> credit.getRole().equals("cover"))
                .map(Credit::getName)
                .collect(Collectors.toList())));
    comicInfo.setNotes(comicBook.getNotes());
    comicInfo.setSummary(comicBook.getDescription());
    try {
      log.trace("Generating ComicInfo.xml data");
      return this.xmlConverter.getObjectMapper().writeValueAsBytes(comicInfo);
    } catch (JsonProcessingException error) {
      throw new ContentAdaptorException("Failed to write ComicInfo.xml data", error);
    }
  }
}
