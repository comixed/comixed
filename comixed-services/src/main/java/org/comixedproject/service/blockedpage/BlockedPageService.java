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
import java.util.Date;
import java.util.List;
import lombok.extern.log4j.Log4j2;
import org.apache.commons.lang.time.DateFormatUtils;
import org.comixedproject.adaptors.CsvAdaptor;
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
    return this.blockedPageRepository.save(record);
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
    final BlockedPage result = this.blockedPageRepository.findByHash(hash);
    if (result == null) {
      throw new BlockedPageException("No such blocked page: hash=" + hash);
    }
    log.trace("Copying blocked page values");
    result.setLabel(blockedPage.getLabel());
    log.trace("Saving updated blocked page");
    return this.blockedPageRepository.save(result);
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
}
