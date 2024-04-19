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

package org.comixedproject.service.batch;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.batch.ComicBatch;
import org.comixedproject.model.batch.ComicBatchEntry;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.repositories.batch.ComicBatchRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * <code>ComicBatchService</code> provides APIs for working with instances of {@link ComicBatch}.
 *
 * @author Darryl L. Pierce
 */
@Service
@Log4j2
public class ComicBatchService {
  @Autowired private ComicBatchRepository comicBatchRepository;

  private SimpleDateFormat simpleDateFormat = new SimpleDateFormat("MMM dd yyyy HH:mm:ss");

  /**
   * Creates a comic batch for unprocessed comic books.
   *
   * @param comicBooks the comic books to process
   * @return the comic batch
   */
  @Transactional
  public ComicBatch createProcessComicBooksGroup(final List<ComicBook> comicBooks) {
    log.debug("Creating a process comic batch");
    final String name = String.format("Process Comics (%s)", simpleDateFormat.format(new Date()));
    log.debug("Getting unprocessed comics");
    final ComicBatch batch = new ComicBatch(name);
    comicBooks.forEach(
        comicBook -> {
          log.trace("Adding comic book to batch: name={} comic book={}", name, comicBook.getId());
          batch.getEntries().add(new ComicBatchEntry(batch, comicBook));
        });
    log.debug("Saving batch: {}", batch.getName());
    this.comicBatchRepository.save(batch);
    return batch;
  }

  /**
   * Saves or updates a comic batch.
   *
   * @param comicBatch the comic batch
   * @return the saved comic batch
   */
  @Transactional
  public ComicBatch save(final ComicBatch comicBatch) {
    return this.comicBatchRepository.save(comicBatch);
  }

  /**
   * Returns the instance with the given name.
   *
   * @param batchName the batch name
   * @return the batch
   */
  public ComicBatch getIncompleteBatchByName(final String batchName) {
    log.debug("Loading comic batch: {}", batchName);
    return this.comicBatchRepository.getIncompleteBatchByName(batchName);
  }

  /**
   * Deletes a comic batch entry.
   *
   * @param comicBatch the batch
   */
  @Transactional
  public void deleteBatch(final ComicBatch comicBatch) {
    this.comicBatchRepository.delete(comicBatch);
  }

  /**
   * Retrieves an instance by name.
   *
   * @param batchName the batch name
   * @return the batch
   */
  @Transactional
  public ComicBatch getByName(final String batchName) {
    log.debug("Loading comici batch: {}", batchName);
    return this.comicBatchRepository.getByName(batchName);
  }
}
