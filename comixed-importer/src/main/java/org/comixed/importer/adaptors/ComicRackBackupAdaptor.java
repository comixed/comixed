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
import java.util.*;
import javax.xml.stream.XMLInputFactory;
import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamReader;
import org.apache.commons.lang3.time.DateUtils;
import org.comixed.importer.model.ComicBookGroupMatcher;
import org.comixed.importer.model.ComicBookItemMatcher;
import org.comixed.importer.model.ComicBookMatcher;
import org.comixed.importer.model.ComicSmartListItem;
import org.comixed.model.library.Comic;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/**
 * <code>ComicRackBackupAdaptor</code> handles reading individual book entries from a ComicRack
 * database.
 *
 * @author João França
 * @author Darryl L. Pierce
 */
@Component
public class ComicRackBackupAdaptor {
  private final Logger logger = LoggerFactory.getLogger(this.getClass());
  private final XMLInputFactory xmlInputFactory = XMLInputFactory.newFactory();
  private static final String COMICIDLISTITEM = "ComicIdListItem";
  private static final String COMICSMARTLISTITEM = "ComicSmartListItem";
  private static final String ITEM = "Item";
  private static final String NAME = "Name";
  private static final String TYPE = "type";
  private static final String GUID = "guid";
  private static final String NAMESPACE = "http://www.w3.org/2001/XMLSchema-instance";
  private static final String MATCHERMODE = "MatcherMode";
  private static final String MATCHOPERATOR = "MatchOperator";
  private static final String NOT = "Not";
  private static final String TRUE = "true";
  private static final String MATCHERS = "Matchers";
  private static final String COMICBOOKMATCHER = "ComicBookMatcher";
  private static final String COMICBOOKGROUPMATCHER = "ComicBookGroupMatcher";
  private static final String MATCHVALUE = "MatchValue";

  /**
   * @param filename
   * @return a list of comic files
   * @throws ImportAdaptorException if an error occurs
   */
  public List<Comic> load(
      File filename, Map<String, String> currentPages, Map<String, String> booksguids)
      throws ImportAdaptorException {

    this.logger.debug("Opening file for reading");

    try (FileInputStream istream = new FileInputStream(filename)) {

      this.logger.debug("Processing file content");
      List<Comic> result = this.loadFromXml(istream, currentPages, booksguids);

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
              this.logger.debug("Added date: {}", date);
              if (comic != null) comic.setDateAdded(date);
            }
            break;
          case "CurrentPage":
            {
              this.logger.debug("Setting current page");
              String currentPage = xmlInputReader.getElementText();
              this.logger.debug("Added current page: {}", currentPage);
              if (comic != null) currentPages.put(comic.getFilename(), currentPage);
            }
            break;
          default:
            this.logger.debug("Unsupported tag");
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
  public Map<String, Object> loadLists(File filename, Map<String, String> booksguids)
      throws ImportAdaptorException {
    this.logger.debug("Opening file for reading");
    try (FileInputStream istream = new FileInputStream(filename)) {

      this.logger.debug("Processing file content");
      Map<String, Object> result = this.loadListsFromXml(istream, booksguids);

      this.logger.debug("Returning {} comic entries", result.size());
      return result;
    } catch (IOException | XMLStreamException error) {
      throw new ImportAdaptorException("unable to read file", error);
    }
  }

  private Map<String, Object> loadListsFromXml(InputStream istream, Map<String, String> booksguids)
      throws XMLStreamException {
    Map<String, Object> result = new HashMap<>();
    final XMLStreamReader xmlInputReader = this.xmlInputFactory.createXMLStreamReader(istream);

    this.logger.debug("Reading lists of XML file");

    while (xmlInputReader.hasNext()) {
      if (xmlInputReader.isStartElement()
          && xmlInputReader.getLocalName().equalsIgnoreCase(ITEM)
          && xmlInputReader.getAttributeValue(NAMESPACE, TYPE).equalsIgnoreCase(COMICIDLISTITEM)) {

        readComicIdListItem(xmlInputReader, booksguids, result);

      } else if (xmlInputReader.isStartElement()
          && xmlInputReader.getLocalName().equalsIgnoreCase(ITEM)
          && xmlInputReader
              .getAttributeValue(NAMESPACE, TYPE)
              .equalsIgnoreCase(COMICSMARTLISTITEM)) {

        ComicSmartListItem smartList = readComicSmartListItem(xmlInputReader);
        result.put(smartList.getName(), smartList);
        this.logger.debug("Loaded smart list: {}", smartList.getName());
      }
      xmlInputReader.next();
    }

    return result;
  }

  private void readComicIdListItem(
      XMLStreamReader xmlInputReader, Map<String, String> booksguids, Map<String, Object> result)
      throws XMLStreamException {
    String listName = xmlInputReader.getAttributeValue(null, NAME);
    List<String> comics = new ArrayList<>();
    while (xmlInputReader.hasNext()) {
      if (xmlInputReader.isStartElement() && xmlInputReader.getLocalName().equalsIgnoreCase(GUID)) {
        String guid = xmlInputReader.getElementText();
        String filename = booksguids.get(guid);
        if (filename == null) this.logger.debug("Book not found for guid {}", guid);
        else comics.add(filename);
      }
      xmlInputReader.next();
      if (xmlInputReader.isStartElement() && xmlInputReader.getLocalName().equalsIgnoreCase(ITEM))
        break;
    }
    result.put(listName, comics);
    this.logger.debug("Loaded list: {}", listName);
  }

  private ComicSmartListItem readComicSmartListItem(XMLStreamReader xmlInputReader)
      throws XMLStreamException {

    ComicSmartListItem smartList = new ComicSmartListItem();

    smartList.setName(xmlInputReader.getAttributeValue(null, NAME));
    if (xmlInputReader.getAttributeValue(null, NOT) != null
        && xmlInputReader.getAttributeValue(null, NOT).equalsIgnoreCase(TRUE))
      smartList.setNot(true);
    smartList.setMatcherMode(xmlInputReader.getAttributeValue(null, MATCHERMODE));
    smartList.setMatchers(readMatchers(xmlInputReader));

    return smartList;
  }

  private List<ComicBookMatcher> readMatchers(XMLStreamReader xmlInputReader)
      throws XMLStreamException {

    List<ComicBookMatcher> matchers = new ArrayList<>();

    while (xmlInputReader.hasNext()) {
      xmlInputReader.next();
      if (xmlInputReader.isStartElement()
          && xmlInputReader.getLocalName().equalsIgnoreCase(COMICBOOKMATCHER)) {
        matchers.add(readMatcher(xmlInputReader));
      } else if (xmlInputReader.isEndElement()
          && xmlInputReader.getLocalName().equalsIgnoreCase(MATCHERS)) {
        break;
      }
    }

    return matchers;
  }

  private ComicBookMatcher readMatcher(XMLStreamReader xmlInputReader) throws XMLStreamException {

    if (xmlInputReader.getAttributeValue(NAMESPACE, TYPE).equalsIgnoreCase(COMICBOOKGROUPMATCHER)) {
      ComicBookGroupMatcher matcher = new ComicBookGroupMatcher();

      matcher.setType(COMICBOOKGROUPMATCHER);
      if (xmlInputReader.getAttributeValue(null, NOT) != null
          && xmlInputReader.getAttributeValue(null, NOT).equalsIgnoreCase(TRUE))
        matcher.setNot(true);
      matcher.setMatcherMode(xmlInputReader.getAttributeValue(null, MATCHERMODE));
      matcher.setMatchers(readMatchers(xmlInputReader));

      return matcher;
    } else {
      ComicBookItemMatcher matcher = new ComicBookItemMatcher();

      matcher.setType(xmlInputReader.getAttributeValue(NAMESPACE, TYPE));
      if (xmlInputReader.getAttributeValue(null, NOT) != null
          && xmlInputReader.getAttributeValue(null, NOT).equalsIgnoreCase(TRUE))
        matcher.setNot(true);
      matcher.setMatchOperator(xmlInputReader.getAttributeValue(null, MATCHOPERATOR));
      while (xmlInputReader.hasNext()) {

        xmlInputReader.next();
        if (xmlInputReader.isStartElement()
            && xmlInputReader.getLocalName().equalsIgnoreCase(MATCHVALUE)) {
          matcher.setValue(xmlInputReader.getElementText());
          break;
        }
      }

      return matcher;
    }
  }
}
