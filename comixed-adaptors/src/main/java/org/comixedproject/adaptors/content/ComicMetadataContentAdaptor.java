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

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.util.*;
import javax.xml.stream.XMLInputFactory;
import javax.xml.stream.XMLOutputFactory;
import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamWriter;
import lombok.extern.log4j.Log4j2;
import org.apache.commons.lang.StringUtils;
import org.apache.commons.lang.time.DateFormatUtils;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.comicbooks.Credit;
import org.springframework.stereotype.Component;

/**
 * <code>ComicMetadataContentAdaptor</code> loads data from the ComicInfo.xml file within a comic.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class ComicMetadataContentAdaptor extends AbstractContentAdaptor {
  private static final XMLInputFactory xmlInputFactory = XMLInputFactory.newInstance();
  private static final XMLOutputFactory xmlOutputFactory = XMLOutputFactory.newInstance();
  public static final String TAG_WRITER = "Writer";
  public static final String TAG_EDITOR = "Editor";
  public static final String TAG_PENCILLER = "Penciller";
  public static final String TAG_INKER = "Inker";
  public static final String TAG_COLORIST = "Colorist";
  public static final String TAG_LETTERER = "Letterer";
  public static final String TAG_COVER_ARTIST = "CoverArtist";
  public static final String CREDIT_WRITER = "writer";
  public static final String CREDIT_EDITOR = "editor";
  public static final String CREDIT_PENCILLER = "penciller";
  public static final String CREDIT_INKER = "inker";
  public static final String CREDIT_COLORIST = "colorist";
  public static final String CREDIT_LETTERER = "letterer";
  public static final String CREDIT_COVER = "cover";
  static final Map<String, String> CREDIT_TO_ROLE =
      Map.of(
          CREDIT_WRITER,
          TAG_WRITER,
          CREDIT_EDITOR,
          TAG_EDITOR,
          CREDIT_PENCILLER,
          TAG_PENCILLER,
          CREDIT_INKER,
          TAG_INKER,
          CREDIT_COLORIST,
          TAG_COLORIST,
          CREDIT_LETTERER,
          TAG_LETTERER,
          CREDIT_COVER,
          TAG_COVER_ARTIST);
  static final Map<String, String> TAG_TO_CREDIT =
      Map.of(
          TAG_WRITER,
          CREDIT_WRITER,
          TAG_EDITOR,
          CREDIT_EDITOR,
          TAG_PENCILLER,
          CREDIT_PENCILLER,
          TAG_INKER,
          CREDIT_INKER,
          TAG_COLORIST,
          CREDIT_COLORIST,
          TAG_LETTERER,
          CREDIT_LETTERER,
          TAG_COVER_ARTIST,
          CREDIT_COVER);
  public static final String TAG_PUBLISHER = "Publisher";
  public static final String TAG_SERIES = "Series";
  public static final String TAG_VOLUME = "Volume";
  public static final String TAG_TITLE = "Title";
  public static final String TAG_ISSUE_NUMBER = "Number";
  public static final String TAG_SUMMARY = "Summary";
  public static final String TAG_NOTES = "Notes";
  public static final String TAG_PUBLISHED_YEAR = "Year";
  public static final String TAG_PUBLISHER_MONTH = "Month";
  public static final String TAG_CHARACTERS = "Characters";
  public static final String TAG_TEAMS = "Teams";
  public static final String TAG_LOCATIONS = "Locations";
  public static final String TAG_ALTERNATE_SERIES = "AlternateSeries";

  @Override
  public void loadContent(final ComicBook comicBook, final String filename, final byte[] content)
      throws ContentAdaptorException {
    try {
      this.loadXmlData(new ByteArrayInputStream(content), comicBook);
    } catch (final XMLStreamException error) {
      throw new ContentAdaptorException("Failed to load metadata", error);
    }
  }

  protected void loadXmlData(InputStream istream, ComicBook comicBook) throws XMLStreamException {
    final var xmlInputReader = xmlInputFactory.createXMLStreamReader(istream);
    int publishedYear = -1;
    int publishedMonth = -1;

    while (xmlInputReader.hasNext()) {
      if (xmlInputReader.isStartElement()) {
        final String tagName = xmlInputReader.getLocalName();
        log.trace("Processing tag: {}", tagName);
        try {
          switch (tagName) {
            case TAG_PUBLISHER:
              comicBook.setPublisher(xmlInputReader.getElementText());
              break;
            case TAG_SERIES:
              comicBook.setSeries(xmlInputReader.getElementText());
              break;
            case TAG_VOLUME:
              comicBook.setVolume(xmlInputReader.getElementText());
              break;
            case TAG_TITLE:
              comicBook.setTitle(xmlInputReader.getElementText());
              break;
            case TAG_ISSUE_NUMBER:
              comicBook.setIssueNumber(xmlInputReader.getElementText());
              break;
            case TAG_SUMMARY:
              comicBook.setDescription(xmlInputReader.getElementText());
              break;
            case TAG_NOTES:
              comicBook.setNotes(xmlInputReader.getElementText());
              break;
            case TAG_PUBLISHED_YEAR:
              publishedYear = Integer.valueOf(xmlInputReader.getElementText());
              break;
            case TAG_PUBLISHER_MONTH:
              publishedMonth = Integer.valueOf(xmlInputReader.getElementText());
              break;
            case TAG_CHARACTERS:
              this.addElementsToList(xmlInputReader.getElementText(), comicBook.getCharacters());
              break;
            case TAG_TEAMS:
              this.addElementsToList(xmlInputReader.getElementText(), comicBook.getTeams());
              break;
            case TAG_LOCATIONS:
              this.addElementsToList(xmlInputReader.getElementText(), comicBook.getLocations());
              break;
            case TAG_ALTERNATE_SERIES:
              this.addElementsToList(xmlInputReader.getElementText(), comicBook.getStories());
              break;
            case TAG_WRITER:
            case TAG_EDITOR:
            case TAG_PENCILLER:
            case TAG_INKER:
            case TAG_COLORIST:
            case TAG_LETTERER:
            case TAG_COVER_ARTIST:
              {
                final String role = TAG_TO_CREDIT.get(tagName);
                this.commandSeparatedList(xmlInputReader.getElementText())
                    .forEach(
                        name -> {
                          log.trace("Adding role: {}={}", role, name);
                          comicBook.getCredits().add(new Credit(comicBook, name, role));
                        });
              }
              break;
            default:
              log.trace("Unused tag");
              break;
          }
        } catch (Exception error) {
          log.error("Error processing tag: " + tagName, error);
        }
      }

      xmlInputReader.next();
    }
    // if we have the published year and/or month then set them
    if (publishedYear > -1) {
      GregorianCalendar gc =
          (publishedMonth > -1)
              ? new GregorianCalendar(publishedYear, publishedMonth - 1, 1)
              : new GregorianCalendar(publishedYear, 0, 1);
      comicBook.setCoverDate(gc.getTime());
    }
  }

  private void addElementsToList(final String elementText, final List<String> list) {
    this.commandSeparatedList(elementText).stream().forEach(list::add);
  }

  private List<String> commandSeparatedList(String text) {
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
    log.trace("Generating comicBook info data from comicBook");
    var result = new ByteArrayOutputStream();
    try {
      final XMLStreamWriter writer = xmlOutputFactory.createXMLStreamWriter(result);
      writer.writeStartElement("ComicInfo");
      writer.writeComment(
          String.format(
              "ComicInfo.xml generated by ComiXed : %s",
              DateFormatUtils.format(new Date(), "MM/dd/yyyy @ HH:mm:ss")));
      this.writeEntry(writer, TAG_PUBLISHER, comicBook.getPublisher(), false);
      this.writeEntry(writer, TAG_SERIES, comicBook.getSeries(), false);
      this.writeEntry(writer, TAG_VOLUME, comicBook.getVolume(), false);
      this.writeEntry(writer, TAG_ISSUE_NUMBER, comicBook.getIssueNumber(), false);
      this.writeEntry(writer, TAG_TITLE, comicBook.getTitle(), false);
      this.writeEntry(writer, TAG_SUMMARY, comicBook.getDescription(), true);
      this.writeEntry(writer, TAG_NOTES, comicBook.getNotes(), true);

      if (comicBook.getCoverDate() != null) {
        var gc = Calendar.getInstance();
        gc.setTime(comicBook.getCoverDate());
        this.writeEntry(writer, TAG_PUBLISHED_YEAR, String.valueOf(gc.get(Calendar.YEAR)), false);
        this.writeEntry(
            writer, TAG_PUBLISHER_MONTH, String.valueOf(gc.get(Calendar.MONTH) + 1), false);
      }
      this.writeEntry(writer, "PageCount", String.valueOf(comicBook.getPageCount()), false);
      this.writeEntry(
          writer, TAG_CHARACTERS, StringUtils.join(comicBook.getCharacters(), ","), false);
      this.writeEntry(writer, TAG_TEAMS, StringUtils.join(comicBook.getTeams(), ","), false);
      this.writeEntry(
          writer, TAG_LOCATIONS, StringUtils.join(comicBook.getLocations(), ","), false);
      for (Credit credit : comicBook.getCredits()) {
        this.writeCreditEntry(writer, credit.getRole(), credit.getName());
      }
      writer.writeEndElement();
      writer.flush();

      return result.toByteArray();
    } catch (XMLStreamException error) {
      throw new ContentAdaptorException("Failed to create XML output writer", error);
    }
  }

  private void writeEntry(
      final XMLStreamWriter writer, final String tagName, String value, final boolean cdatafy)
      throws XMLStreamException {
    if (value != null) {
      writer.writeStartElement(tagName);
      if (cdatafy) {
        writer.writeCData(value);
      } else {
        writer.writeCharacters(value);
      }
      writer.writeEndElement();
    }
  }

  private void writeCreditEntry(final XMLStreamWriter writer, final String role, final String name)
      throws XMLStreamException {
    final String roleValue = CREDIT_TO_ROLE.get(role);
    if (roleValue == null) return;
    this.writeEntry(writer, roleValue, name, false);
  }
}
