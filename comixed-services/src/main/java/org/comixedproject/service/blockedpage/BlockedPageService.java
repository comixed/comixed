/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2021, The ComiXed Project
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

package org.comixedproject.service.blockedpage;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import lombok.extern.log4j.Log4j2;
import org.apache.commons.lang.time.DateFormatUtils;
import org.comixedproject.adaptors.csv.CsvAdaptor;
import org.comixedproject.messaging.PublishingException;
import org.comixedproject.messaging.blockedpage.PublishBlockedPageRemovalAction;
import org.comixedproject.messaging.blockedpage.PublishBlockedPageUpdateAction;
import org.comixedproject.model.blockedpage.BlockedPage;
import org.comixedproject.model.net.DownloadDocument;
import org.comixedproject.repositories.blockedpage.BlockedPageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * <code>BlockedPageService</code> applies business rules to instances of {@link BlockedPage}.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class BlockedPageService {
  static final String PAGE_LABEL_HEADER = "Page Label";
  static final String PAGE_HASH_HEADER = "Hash Value";
  static final String PAGE_SNAPSHOT_HEADER = "Encoded Snapshot";

  @Autowired private BlockedPageRepository blockedPageRepository;
  @Autowired private CsvAdaptor csvAdaptor;
  @Autowired private PublishBlockedPageUpdateAction publishBlockedPageUpdateAction;
  @Autowired private PublishBlockedPageRemovalAction publishBlockedPageRemovalAction;

  /**
   * Returns all blocked pages.
   *
   * @return all blocked pages
   */
  public List<BlockedPage> getAll() {
    log.debug("Loading all blocked page records");
    return this.blockedPageRepository.getAll();
  }

  /**
   * Returns a single blocked page by its hash.
   *
   * @param hash the blocked page has
   * @return the blocked page
   * @throws BlockedPageException if no such record exists
   */
  public BlockedPage getByHash(final String hash) throws BlockedPageException {
    log.debug("Loading blocked page by hash: {}", hash);
    final BlockedPage result = this.blockedPageRepository.findByHash(hash);

    if (result == null) {
      throw new BlockedPageException("No such blocked page: hash=" + hash);
    }

    return result;
  }

  /**
   * Retrieves the set of hashes only.
   *
   * @return the blocked page hashes
   */
  public List<String> getHashes() {
    log.debug("Loading all blocked page hashes");
    return this.blockedPageRepository.getHashes();
  }

  /**
   * Adds a page type to the blocked page lis.
   *
   * @param hash the page has
   * @return the blocked page
   */
  public BlockedPage blockHash(final String hash) {
    log.debug("Blocked pages with hash: {}", hash);
    BlockedPage record = this.blockedPageRepository.findByHash(hash);
    if (record != null) {
      log.debug("Page already blocked: id={}", record.getId());
      return record;
    }
    String snapshot = "";
    // here we will eventually load a snapshot of the image
    record = new BlockedPage("Blocked On " + new Date(), hash, snapshot);
    final BlockedPage result = this.blockedPageRepository.save(record);
    try {
      this.publishBlockedPageUpdateAction.publish(result);
    } catch (PublishingException error) {
      log.error("Failed to publish blocked page update", error);
    }
    return result;
  }

  /**
   * Updates the details for a blocked page.
   *
   * @param hash the page hash
   * @param blockedPage the updated details
   * @return the updated record
   * @throws BlockedPageException if the hash is invalid
   */
  @Transactional
  public BlockedPage updateBlockedPage(final String hash, final BlockedPage blockedPage)
      throws BlockedPageException {
    log.debug("Updating blocked page hash: {}", hash);
    BlockedPage result = this.blockedPageRepository.findByHash(hash);
    if (result == null) {
      throw new BlockedPageException("No such blocked page: hash=" + hash);
    }
    log.trace("Copying blocked page values");
    result.setLabel(blockedPage.getLabel());
    log.trace("Saving updated blocked page");
    result = this.blockedPageRepository.save(result);
    try {
      this.publishBlockedPageUpdateAction.publish(result);
    } catch (PublishingException error) {
      log.error("Failed to publish blocked page update", error);
    }
    return result;
  }

  /**
   * Unblocked a page type by hash.
   *
   * @param hash the hash
   * @return the now-deleted record
   * @throws BlockedPageException if the hash is not blocked
   */
  public BlockedPage unblockPage(final String hash) throws BlockedPageException {
    log.debug("Unblocked page hash: {}", hash);
    final BlockedPage result = this.blockedPageRepository.findByHash(hash);
    if (result == null) {
      throw new BlockedPageException("No such blocked page: hash=" + hash);
    }
    log.trace("Deleting record");
    this.blockedPageRepository.delete(result);
    try {
      this.publishBlockedPageRemovalAction.publish(result);
    } catch (PublishingException error) {
      log.error("Failed to publish blocked page remove", error);
    }
    return result;
  }

  /**
   * Creates a CSV file containing the list of all blocked pages.
   *
   * @return the document
   */
  public DownloadDocument createFile() throws IOException {
    log.debug("Retrieving blocked pages");
    final List<BlockedPage> entries = this.blockedPageRepository.findAll();
    final byte[] content =
        this.csvAdaptor.encodeRecords(
            entries,
            (index, model) -> {
              if (index == 0) {
                return new String[] {PAGE_LABEL_HEADER, PAGE_HASH_HEADER, PAGE_SNAPSHOT_HEADER};
              } else {
                return new String[] {model.getLabel(), model.getHash(), model.getSnapshot()};
              }
            });
    return new DownloadDocument(
        String.format(
            "ComiXed Blocked Pages For %s.csv", DateFormatUtils.format(new Date(), "yyyy-MM-dd")),
        "text/csv",
        content);
  }

  /**
   * Processes a received file of blocked pages.
   *
   * @param inputStream the data stream
   * @return the updated list of blocked pages
   * @throws IOException if an error occurs with the data stream.
   */
  @Transactional
  public List<BlockedPage> uploadFile(final InputStream inputStream) throws IOException {
    this.csvAdaptor.decodeRecords(
        inputStream,
        new String[] {PAGE_LABEL_HEADER, PAGE_HASH_HEADER, PAGE_SNAPSHOT_HEADER},
        (index, row) -> {
          if (index > 0) {
            final String label = row.get(0);
            final String hash = row.get(1);
            final String snapshot = row.get(2);

            log.debug("Checking if blocked page already exists: hash={}", hash);
            var blockedPage = this.blockedPageRepository.findByHash(hash);
            if (blockedPage == null) {
              log.debug("Creating new blocked page record");
              this.doSaveRecord(label, hash, snapshot);
            }
          }
        });
    return this.blockedPageRepository.findAll();
  }

  @Transactional
  public void doSaveRecord(final String label, final String hash, final String snapshot) {
    final var blockedPage = new BlockedPage(label, hash, snapshot);
    this.blockedPageRepository.save(blockedPage);
  }

  /**
   * Deletes a set of entries based on their hashes.
   *
   * @param hashes the entry hashes
   * @return the deleted entries
   */
  @Transactional
  public List<String> deleteBlockedPages(final List<String> hashes) {
    log.debug("Deleting {} blocked page entr{}", hashes.size(), hashes.size() == 1 ? "y" : "ies");
    List<String> result = new ArrayList<>();
    hashes.forEach(
        hash -> {
          log.trace("Loading blocked page for hash: {}", hash);
          final BlockedPage entry = this.blockedPageRepository.findByHash(hash);
          if (entry != null) {
            log.trace("Deleting entry: id={}", entry.getId());
            this.blockedPageRepository.delete(entry);
            result.add(entry.getHash());
          }
        });
    log.trace("Returning list of deleted blocked pages");
    return result;
  }
}
