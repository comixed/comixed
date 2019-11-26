/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2019, The ComiXed Project
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

package org.comixed.importer.adaptors;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.text.ParseException;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import javax.xml.stream.XMLInputFactory;
import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamReader;
import org.apache.commons.lang3.time.DateUtils;
import org.comixed.model.library.Comic;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/**
 * <code>ComicRackBackupAdaptor</code> handles reading individual book entries from a ComicRack
 * database.
 *
 * @author Darryl L. Pierce
 */
@Component
public class ComicRackBackupAdaptor {
  private final Logger logger = LoggerFactory.getLogger(this.getClass());
  private final XMLInputFactory xmlInputFactory = XMLInputFactory.newFactory();

  /**
   * @param filename
   * @return a list of comic files
   * @throws ImportAdaptorException if an error occurs
   */
  public List<Comic> load(
      File filename, Map<String, String> currentPages, Map<String, String> booksguids)
      throws ImportAdaptorException {
    try {
      this.logger.debug("Opening file for reading");
      FileInputStream istream = new FileInputStream(filename);

      this.logger.debug("Processing file content");
      List<Comic> result = this.loadFromXml(istream, currentPages, booksguids);

      this.logger.debug("Closing file");
      istream.close();

      this.logger.debug("Returning {} comic entries", result.size());
      return result;
    } catch (IOException | XMLStreamException | ParseException error) {
      throw new ImportAdaptorException("unable to read file", error);
    }
  }

  private List<Comic> loadFromXml(
      InputStream istream, Map<String, String> currentPages, Map<String, String> booksguids)
      throws XMLStreamException, ParseException {
    List<Comic> result = new ArrayList<>();
    final XMLStreamReader xmlInputReader = this.xmlInputFactory.createXMLStreamReader(istream);

    this.logger.debug("Reading contents of XML file");

    Comic comic = null;

    while (xmlInputReader.hasNext()) {
      if (xmlInputReader.isStartElement()) {
        String tagName = xmlInputReader.getLocalName();

        switch (tagName) {
          case "Book":
            {
              this.logger.debug("Starting new comic file");
              comic = new Comic();
              String filename = xmlInputReader.getAttributeValue(null, "File");
              this.logger.debug("Filename: {}", filename);
              comic.setFilename(filename);
              result.add(comic);
              booksguids.put(xmlInputReader.getAttributeValue(null, "Id"), filename);
            }
            break;
          case "Added":
            {
              this.logger.debug("Setting added date");
              Date date =
                  DateUtils.parseDate(
                      xmlInputReader.getElementText(), "yyyy-MM-dd'T'HH:mm:ss.SSSXXX");
              this.logger.debug("Added date: {}", date.toString());
              comic.setDateAdded(date);
            }
            break;
          case "CurrentPage":
            {
              this.logger.debug("Setting current page");
              String currentPage = xmlInputReader.getElementText();
              this.logger.debug("Added current page: {}", currentPage);
              currentPages.put(comic.getFilename(), currentPage);
            }
            break;
          default:
            // this.logger.debug("Unsupported tag");
            break;
        }
      }
      xmlInputReader.next();
    }

    return result;
  }

  /**
   * @param filename
   * @return a list of comic files
   * @throws ImportAdaptorException if an error occurs
   */
  public Map<String, List> loadLists(File filename, Map<String, String> booksguids)
      throws ImportAdaptorException {
    try {
      this.logger.debug("Opening file for reading");
      FileInputStream istream = new FileInputStream(filename);

      this.logger.debug("Processing file content");
      Map<String, List> result = this.loadListsFromXml(istream, booksguids);

      this.logger.debug("Closing file");
      istream.close();

      this.logger.debug("Returning {} comic entries", result.size());
      return result;
    } catch (IOException | XMLStreamException | ParseException error) {
      throw new ImportAdaptorException("unable to read file", error);
    }
  }

  private Map<String, List> loadListsFromXml(InputStream istream, Map<String, String> booksguids)
      throws XMLStreamException, ParseException {
    Map<String, List> result = new HashMap<>();
    final XMLStreamReader xmlInputReader = this.xmlInputFactory.createXMLStreamReader(istream);

    this.logger.debug("Reading lists of XML file");

    while (xmlInputReader.hasNext()) {
      if (xmlInputReader.isStartElement()
          && xmlInputReader.getLocalName().equalsIgnoreCase("Item")
          && xmlInputReader
              .getAttributeValue("http://www.w3.org/2001/XMLSchema-instance", "type")
              .equalsIgnoreCase("ComicIdListItem")) {
        String listName = xmlInputReader.getAttributeValue(null, "Name");
        List<String> comics = new ArrayList<>();
        while (xmlInputReader.hasNext()) {
          if (xmlInputReader.isStartElement()
              && xmlInputReader.getLocalName().equalsIgnoreCase("guid")) {
            String guid = xmlInputReader.getElementText();
            String filename = booksguids.get(guid);
            if (filename == null) this.logger.debug("Book not found for guid {}", guid);
            else comics.add(filename);
          }
          xmlInputReader.next();
          if (xmlInputReader.isStartElement()
              && xmlInputReader.getLocalName().equalsIgnoreCase("Item")) break;
        }
        result.put(listName, comics);
      }
      xmlInputReader.next();
    }

    return result;
  }
}
