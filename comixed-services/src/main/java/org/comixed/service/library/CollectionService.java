/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2019, The ComiXed Project.
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

package org.comixed.service.library;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.List;
import org.comixed.model.library.CollectionEntry;
import org.comixed.model.library.CollectionType;
import org.comixed.model.library.Comic;
import org.comixed.repositories.library.ComicRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CollectionService {
  protected final Logger logger = LoggerFactory.getLogger(this.getClass());

  @Autowired private ComicRepository comicRepository;

  @Transactional
  public List<CollectionEntry> getCollectionEntries(final CollectionType collectionType)
      throws CollectionException {
    this.logger.debug("Getting collection entries: type={}", collectionType);
    try {
      return this.loadCollectionEntry(
          collectionType.getNamesQuery(), collectionType.getComicCountQuery());
    } catch (NoSuchMethodException | IllegalAccessException | InvocationTargetException error) {
      throw new CollectionException("failed to load collection", error);
    }
  }

  @Transactional(propagation = Propagation.REQUIRED)
  protected List<CollectionEntry> loadCollectionEntry(
      final String namesQuery, final String comicCountQuery)
      throws NoSuchMethodException, InvocationTargetException, IllegalAccessException {
    List<CollectionEntry> result = new ArrayList<>();

    this.logger.debug("Getting names query method: {}", namesQuery);
    final Method namesMethod = ComicRepository.class.getMethod(namesQuery);

    this.logger.debug("Executing names query", namesQuery);
    List<String> names = (List<String>) namesMethod.invoke(this.comicRepository);

    this.logger.debug("Getting count query method: {}", comicCountQuery);
    final Method countMethod = ComicRepository.class.getMethod(comicCountQuery, String.class);

    for (String name : names) {
      result.add(new CollectionEntry(name, this.doGetCountForCollection(countMethod, name)));
    }

    this.logger.debug("Returning result");
    return result;
  }

  @Transactional
  protected int doGetCountForCollection(final Method countMethod, final String name)
      throws InvocationTargetException, IllegalAccessException {
    this.logger.debug("Getting count for: name={}", name);
    return (int) countMethod.invoke(this.comicRepository, name);
  }

  public int getCountForCollectionTypeAndName(
      final CollectionType collectionType, final String collectionName) throws CollectionException {
    final String comicCountQuery = collectionType.getComicCountQuery();

    try {
      this.logger.debug("Getting count query method: {}", comicCountQuery);
      final Method countMethod = ComicRepository.class.getMethod(comicCountQuery, String.class);

      return (int) countMethod.invoke(this.comicRepository, collectionName);
    } catch (IllegalAccessException | InvocationTargetException | NoSuchMethodException cause) {
      throw new CollectionException("failed to get collection comic count", cause);
    }
  }

  public List<Comic> getPageForEntry(
      final CollectionType collectionType,
      final String name,
      final int page,
      final int count,
      final String sortField,
      final boolean ascending)
      throws CollectionException {
    String query = collectionType.getComicPageQuery();
    this.logger.debug("Getting comic page method reference: {}", query);

    try {
      final Method method = ComicRepository.class.getMethod(query, String.class, Pageable.class);

      this.logger.debug(
          "Calling query method: page={} count={} sortField={} ascending={}",
          page,
          count,
          sortField,
          ascending);

      return (List<Comic>)
          method.invoke(
              this.comicRepository,
              name,
              PageRequest.of(
                  page, count, Sort.by(ascending ? Direction.ASC : Direction.DESC, sortField)));
    } catch (IllegalAccessException | InvocationTargetException | NoSuchMethodException cause) {
      throw new CollectionException("Failed to get comics for collection", cause);
    }
  }

  public int getCountForCollection(final CollectionType collectionType, final String name)
      throws CollectionException {
    try {
      this.logger.debug("Getting count query method: {}", collectionType.getComicCountQuery());
      final Method countMethod =
          ComicRepository.class.getMethod(collectionType.getComicCountQuery(), String.class);

      return this.doGetCountForCollection(countMethod, name);
    } catch (InvocationTargetException | IllegalAccessException | NoSuchMethodException error) {
      throw new CollectionException("failed to get collection count", error);
    }
  }
}
