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

package org.comixedproject.adaptors;

import java.io.*;
import java.text.MessageFormat;
import java.util.*;
import javax.xml.stream.XMLInputFactory;
import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamReader;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.loaders.EntryLoader;
import org.comixedproject.loaders.EntryLoaderException;
import org.comixedproject.model.comic.Comic;
import org.comixedproject.model.comic.Credit;
import org.springframework.stereotype.Component;

/**
 * * <code>ComicInfoEntryAdaptor</code> loads data from the ComicInfo.xml file created by ComicRack.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class ComicInfoEntryAdaptor implements EntryLoader {
  private final XMLInputFactory xmlInputFactory;

  public ComicInfoEntryAdaptor() {
    this.xmlInputFactory = XMLInputFactory.newInstance();
  }

  @Override
  public void loadContent(Comic comic, String filename, byte[] content)
      throws EntryLoaderException {
    try {
      this.loadXmlData(new ByteArrayInputStream(content), comic);
    } catch (final XMLStreamException error) {
      throw new EntryLoaderException(error);
    }
  }

  protected void loadXmlData(InputStream istream, Comic comic) throws XMLStreamException {
    final XMLStreamReader xmlInputReader = this.xmlInputFactory.createXMLStreamReader(istream);
    int publishedYear = -1;
    int publishedMonth = -1;

    while (xmlInputReader.hasNext()) {
      if (xmlInputReader.isStartElement()) {
        final String tagName = xmlInputReader.getLocalName();
        log.debug("Processing tag: " + tagName);
        switch (tagName) {
          case "Publisher":
            comic.setPublisher(xmlInputReader.getElementText());
            break;
          case "Series":
            comic.setSeries(xmlInputReader.getElementText());
            break;
          case "Volume":
            comic.setVolume(xmlInputReader.getElementText());
            break;
          case "Title":
            comic.setTitle(xmlInputReader.getElementText());
            break;
          case "Number":
            comic.setIssueNumber(xmlInputReader.getElementText());
            break;
          case "Summary":
            comic.setSummary(xmlInputReader.getElementText());
            break;
          case "Notes":
            comic.setNotes(xmlInputReader.getElementText());
            break;
          case "Year":
            publishedYear = Integer.valueOf(xmlInputReader.getElementText());
            break;
          case "Month":
            publishedMonth = Integer.valueOf(xmlInputReader.getElementText());
            break;
          case "Web":
            break;
          case "PageCount":
            break;
          case "Characters":
            List<String> characters = this.commandSeparatedList(xmlInputReader.getElementText());
            for (String character : characters) {
              comic.getCharacters().add(character);
            }
            break;
          case "Teams":
            List<String> teams = this.commandSeparatedList(xmlInputReader.getElementText());
            for (String team : teams) {
              comic.getTeams().add(team);
            }
            break;
          case "Locations":
            List<String> locations = this.commandSeparatedList(xmlInputReader.getElementText());
            for (String location : locations) {
              comic.getLocations().add(location);
            }
            break;
          case "Writer":
          case "Editor":
          case "Penciller":
          case "Inker":
          case "Colorist":
          case "Letterer":
          case "CoverArtist":
            {
              List<String> names = this.commandSeparatedList(xmlInputReader.getElementText());
              for (String name : names) {
                String role = tagName.toLowerCase();
                if (role.equals("coverartist")) {
                  role = "cover";
                }
                log.debug("Adding role: {}={}", role, name);
                comic.getCredits().add(new Credit(comic, name, role));
              }
            }
            break;
          default:
            log.debug("Unrecognized tag");
            break;
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
      comic.setCoverDate(gc.getTime());
    }
  }

  private List<String> commandSeparatedList(String text) {
    List<String> result = new ArrayList<>();
    StringTokenizer tokens = new StringTokenizer(text, ",");

    while (tokens.hasMoreTokens()) {
      result.add(tokens.nextToken().trim());
    }

    return result;
  }

  /**
   * Writes the content of the provided comic as a ComicInfo.xml file to the provided output stream.
   *
   * @param comic the comic
   * @return the content of the file
   * @throws IOException if an error occurs
   */
  public byte[] saveContent(Comic comic) throws IOException {
    log.debug("Generating comic info data from comic");
    ByteArrayOutputStream result = new ByteArrayOutputStream();
    PrintWriter writer = new PrintWriter(new OutputStreamWriter(result));

    writer.write(
        "<?xml version=\"1.0\"?><ComicInfo xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\"  xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\">");
    this.writeEntry(writer, "Publisher", comic.getPublisher());
    this.writeEntry(writer, "Series", comic.getSeries());
    this.writeEntry(writer, "Volume", comic.getVolume());
    this.writeEntry(writer, "Number", comic.getIssueNumber());
    this.writeEntry(writer, "Title", comic.getTitle());
    this.writeEntry(writer, "Summary", comic.getSummary());
    this.writeEntry(writer, "Notes", comic.getNotes());

    if (comic.getCoverDate() != null) {
      Calendar gc = Calendar.getInstance();
      gc.setTime(comic.getCoverDate());
      this.writeEntry(writer, "Year", String.valueOf(gc.get(Calendar.YEAR)));
      this.writeEntry(writer, "Month", String.valueOf(gc.get(Calendar.MONTH) + 1));
    }
    this.writeEntry(writer, "PageCount", String.valueOf(comic.getPageCount()));
    this.writeEntry(writer, "Characters", this.arrayToString(comic.getCharacters()));
    this.writeEntry(writer, "Teams", this.arrayToString(comic.getTeams()));
    this.writeEntry(writer, "Locations", this.arrayToString(comic.getLocations()));
    writer.write("</ComicInfo>");
    writer.flush();

    return result.toByteArray();
  }

  private void writeEntry(PrintWriter writer, String tagName, String value) {
    if (value != null) {
      writer.write(MessageFormat.format("<{0}>{1}</{0}>", tagName, value));
    }
  }

  private String arrayToString(List<String> items) {
    if ((items == null) || items.isEmpty()) return null;

    StringBuilder result = new StringBuilder();

    for (String item : items) {
      if (result.length() > 0) {
        result.append(",");
      }
      result.append(item);
    }
    return result.toString();
  }
}
